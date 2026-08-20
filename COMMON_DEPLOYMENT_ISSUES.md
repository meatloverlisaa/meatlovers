# 🔍 Common Deployment Issues & Solutions

## 🚨 Most Common Issues

---

### Issue #1: "No Next.js version detected"

**Where:** Build fails on Vercel

**Symptoms:**
```
No Next.js version detected. Make sure your package.json 
has "next" in either "dependencies" or "devDependencies"
```

**Causes:**
1. ❌ Wrong Framework selected (Next.js instead of Other for API)
2. ❌ Root Directory not set or set incorrectly
3. ❌ Trying to deploy both API and UI in one project

**Solutions:**

| If deploying... | Framework should be | Root Directory should be |
|-----------------|---------------------|--------------------------|
| Backend (API) | **Other** | **api** |
| Frontend (UI) | **Next.js** | **ui** |

**Fix:**
1. Vercel Dashboard → Your Project
2. Settings → General
3. Check Framework Preset: Must be "Other" for API, "Next.js" for UI
4. Check Root Directory: Must be "api" for API, "ui" for UI
5. Save and redeploy

---

### Issue #2: "This Serverless Function has crashed" (500 Error)

**Where:** Runtime after successful build

**Symptoms:**
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

**Most Common Causes:**

#### A. Missing DATABASE_URL (90% of cases)

**Check:**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Look for: DATABASE_URL
```

**Symptoms in logs:**
- `ECONNREFUSED`
- `connect ETIMEDOUT`
- Prisma connection errors
- `Can't reach database server`

**Fix:**
1. Get external database (Neon or Supabase)
2. Add to Vercel environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   ```
3. Redeploy

#### B. Missing JWT Secrets

**Check:**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Look for:
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
```

**Symptoms in logs:**
- `JWT secret is required`
- Authentication errors on any request

**Fix:**
1. Copy from `PRODUCTION_SECRETS.txt`
2. Add to Vercel environment variables
3. Redeploy

#### C. Prisma Client Not Generated

**Symptoms in logs:**
```
Error: Cannot find module '@prisma/client'
or
PrismaClient is not a constructor
```

**Fix:**
1. Check `api/package.json` has:
   ```json
   {
     "scripts": {
       "vercel-build": "npm run build && npm run prisma:generate"
     }
   }
   ```
2. Check build logs show:
   ```
   ✔ Generated Prisma Client
   ```
3. If not, manually trigger: redeploy

#### D. Module Import Errors

**Symptoms in logs:**
```
Cannot find module 'express'
or
Cannot find module 'helmet'
```

**Fix:**
1. Check dependencies are in `dependencies` (not `devDependencies`)
2. Required in `api/package.json`:
   ```json
   {
     "dependencies": {
       "@nestjs/core": "^11.0.1",
       "@nestjs/platform-express": "^11.2.1",
       "@prisma/client": "^5.22.0",
       "express": "^5.2.1",
       "helmet": "^8.2.0"
     }
   }
   ```
3. If any missing, add and push to trigger rebuild

---

### Issue #3: Frontend Builds But Shows Blank Page

**Where:** Frontend deployed successfully but nothing displays

**Symptoms:**
- White screen
- No content
- Console errors about API

**Causes:**

#### A. Missing NEXT_PUBLIC_API_URL

**Check browser console:**
```
Failed to fetch
or
net::ERR_NAME_NOT_RESOLVED
```

**Fix:**
1. Vercel Dashboard → Frontend Project
2. Settings → Environment Variables
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```
4. **Must start with NEXT_PUBLIC_** for client-side access
5. Redeploy

#### B. Wrong API URL Format

**Check:**
```env
❌ NEXT_PUBLIC_API_URL=your-backend.vercel.app  # Missing https://
❌ NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/  # Trailing slash
✅ NEXT_PUBLIC_API_URL=https://your-backend.vercel.app  # Correct!
```

---

### Issue #4: CORS Errors in Browser

**Where:** Frontend loads but API requests fail

**Symptoms in browser console:**
```
Access to fetch at 'https://api...' from origin 'https://ui...' 
has been blocked by CORS policy
```

**Fix:**
1. Vercel Dashboard → **Backend** Project
2. Settings → Environment Variables
3. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   ```
4. Must include your actual frontend URL
5. Redeploy backend

---

### Issue #5: Build Succeeds Locally But Fails on Vercel

**Symptoms:**
- `npm run build` works on your machine
- Fails on Vercel with various errors

**Common Causes:**

#### A. Missing Dependencies

**Check:**
```bash
# In your local repo
cd api  # or ui
npm install
npm run build
```

If you added packages but didn't save to package.json:
```bash
npm install <package> --save  # Not just npm install <package>
```

#### B. Environment-Specific Code

**Issues:**
- Code that works on Windows but not Linux
- Hardcoded paths (`C:\Users\...`)
- Case-sensitive file imports

**Fix:**
- Use path.join() for paths
- Match import case exactly with filename
- Test on Linux if possible

#### C. Node Version Mismatch

**Check:**
```bash
# In package.json, specify Node version
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Issue #6: Timeout Errors

**Symptoms:**
```
Task timed out after 10.00 seconds
or
FUNCTION_INVOCATION_TIMEOUT
```

**Causes:**
- Serverless function takes >10s (Hobby plan limit)
- Slow database queries
- Heavy computation

**Solutions:**

1. **Optimize Database Queries:**
   - Add indexes to frequently queried columns
   - Use `select` to limit returned fields
   - Implement pagination

2. **Upgrade Vercel Plan:**
   - Pro plan: 60s timeout
   - Enterprise: Unlimited

3. **Use Traditional Server Instead:**
   - Deploy backend to Railway/Render
   - Keep frontend on Vercel
   - No serverless timeout limits

---

### Issue #7: Environment Variables Not Working

**Symptoms:**
- Variables are set but `undefined` in code
- Frontend can't access backend URL

**Common Mistakes:**

#### Frontend Variables:
```env
❌ API_URL=...              # Won't work on frontend!
✅ NEXT_PUBLIC_API_URL=...  # Must start with NEXT_PUBLIC_
```

#### Backend Variables:
```env
✅ DATABASE_URL=...         # Works fine
✅ JWT_SECRET=...           # Works fine
❌ NEXT_PUBLIC_SECRET=...   # Don't use NEXT_PUBLIC_ on backend
```

**Fix:**
1. Frontend: All client-side vars must start with `NEXT_PUBLIC_`
2. Backend: Regular names without prefix
3. After changing env vars, always **redeploy**

---

### Issue #8: Database Connection Issues

**Symptoms:**
```
Connection refused
or
connect ETIMEDOUT
or
SSL connection error
```

**Solutions:**

#### For Neon Database:
```env
# Use POOLED connection string
DATABASE_URL=postgresql://user:pass@host.pooler.neon.tech:5432/db?sslmode=require
```

#### For Supabase:
```env
# Use DIRECT connection (not pooler for serverless)
DATABASE_URL=postgresql://postgres:pass@host.supabase.co:5432/postgres?sslmode=require
```

#### General Tips:
- Always include `?sslmode=require` at the end
- Check database allows connections from anywhere (0.0.0.0/0)
- For Vercel: No need to whitelist IPs (dynamic)

---

### Issue #9: "Build Command Exited with 1"

**Symptoms:**
```
Error: Command "npm run build" exited with 1
or
Error: Command "npm run vercel-build" exited with 1
```

**Check Build Logs for:**

#### TypeScript Errors:
```
error TS2349: This expression is not callable
```
**Fix:** Check `api/src/serverless.ts` imports

#### Prisma Errors:
```
Error: Prisma schema not found
```
**Fix:** Ensure `prisma/schema.prisma` exists

#### Dependency Errors:
```
Cannot find module 'some-package'
```
**Fix:** Run `npm install some-package --save` and push

---

### Issue #10: Changes Not Reflecting

**Symptoms:**
- Pushed code changes to GitHub
- Vercel deployed
- But changes not visible

**Solutions:**

1. **Hard Refresh Browser:**
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache

2. **Check Correct Deployment:**
   - Vercel Dashboard → Deployments
   - Verify latest commit is deployed
   - Check commit hash matches GitHub

3. **Force Redeploy:**
   - Deployments → ... → Redeploy
   - Select "Use existing build cache: No"

4. **Environment Variables:**
   - If changed env vars, must redeploy
   - Settings → Environment Variables → Edit → Save → Redeploy

---

## 🔍 How to Debug Issues

### Step 1: Check Vercel Build Logs

1. Vercel Dashboard → Your Project
2. Deployments → Latest deployment
3. Click on deployment
4. View "Build Logs"

**Look for:**
- Red error messages
- `Error: ...`
- `Failed to compile`
- Module not found errors

### Step 2: Check Vercel Runtime Logs

1. Same deployment page
2. Click "Functions" tab
3. Click on your function
4. View "Logs"

**Look for:**
- Database connection errors
- Prisma errors
- Module errors
- Timeout errors

### Step 3: Check Browser Console

1. Open your deployed frontend
2. Press F12 (Developer Tools)
3. Check "Console" tab

**Look for:**
- CORS errors (red text)
- Network errors
- API request failures
- Missing resources (404)

### Step 4: Check Network Tab

1. Browser Developer Tools (F12)
2. "Network" tab
3. Try the action that's failing
4. Look at failed requests

**Check:**
- Request URL (correct API URL?)
- Status code (404, 500, 502?)
- Response body (error message?)
- Request headers (CORS?)

---

## ✅ Deployment Health Checklist

Use this to verify everything is configured correctly:

### Backend (API) Project:

**Configuration:**
- [ ] Framework Preset: **Other** (not Next.js)
- [ ] Root Directory: **api**
- [ ] Build Command: **npm run vercel-build** (overridden)

**Environment Variables:**
- [ ] DATABASE_URL (with `?sslmode=require`)
- [ ] JWT_SECRET (128 characters)
- [ ] REFRESH_TOKEN_SECRET (128 characters)
- [ ] JWT_EXPIRES_IN=1h
- [ ] REFRESH_TOKEN_EXPIRES_IN=7d
- [ ] NODE_ENV=production
- [ ] ALLOWED_ORIGINS (includes frontend URL)

**Build:**
- [ ] Build succeeds
- [ ] Logs show "Generated Prisma Client"
- [ ] No TypeScript errors

**Runtime:**
- [ ] Function doesn't crash immediately
- [ ] Can access any endpoint
- [ ] Database queries work

### Frontend (UI) Project:

**Configuration:**
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **ui**
- [ ] Build Command: **npm run build** (auto)

**Environment Variables:**
- [ ] NEXT_PUBLIC_API_URL (starts with https://)

**Build:**
- [ ] Build succeeds
- [ ] Shows "147 static pages" (or similar)
- [ ] No errors in build log

**Runtime:**
- [ ] Page loads and displays content
- [ ] Styles load correctly (Tailwind CSS)
- [ ] No blank white screen
- [ ] Browser console has no errors

**Integration:**
- [ ] Frontend can call backend API
- [ ] No CORS errors
- [ ] Login works
- [ ] Data displays correctly

---

## 🆘 Still Stuck?

### Provide This Information:

1. **Which project?** (API or UI)
2. **What stage?** (Build or Runtime)
3. **Error message:** (exact text or screenshot)
4. **Build logs:** (if build fails)
5. **Runtime logs:** (if runtime crashes)
6. **Browser console:** (if frontend issue)

### Quick Tests:

**Test API:**
```bash
curl https://your-api.vercel.app/health
# or any simple endpoint
```

**Test Frontend:**
- Open in incognito/private window
- Check browser console (F12)
- Check Network tab for failed requests

**Test Database:**
- Connect with a database client using same DATABASE_URL
- Verify connection works

---

## 💡 Pro Tips

1. **Deploy Backend First:** Always deploy API before frontend so you have the URL
2. **Check Logs Immediately:** After every deploy, check logs even if it seems successful
3. **Test Locally First:** Run `npm run build` locally before pushing
4. **Use Environment Variable Preview:** Add env vars to "Preview" and "Development" too
5. **Enable Detailed Logging:** Temporarily add `console.log()` to debug

---

**Share the specific error and I can provide a targeted solution!** 🚀
