# 🔧 Fix: API Deployment - "No Next.js version detected"

## Problem

Vercel says: **"No Next.js version detected"** when deploying the **API (backend)**

This happens because Vercel is trying to detect Next.js, but your API is **NestJS** (not Next.js).

---

## ✅ Solution: Set Framework to "Other"

### Correct Configuration for API:

```
┌─────────────────────────────────────────────┐
│  Configure Project (API/Backend)            │
├─────────────────────────────────────────────┤
│                                             │
│  Project Name: meatlovers-api               │
│                                             │
│  Framework Preset: Other ▼  ← CRITICAL!     │
│  (NOT Next.js!)                             │
│                                             │
│  Root Directory: api        ← IMPORTANT!    │
│  (Click "Edit" button to change)            │
│                                             │
│  Build Command: npm run vercel-build        │
│  (Override and enter manually)              │
│                                             │
│  Output Directory: (leave empty)            │
│                                             │
│  Install Command: npm install               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Fix

### If You Haven't Deployed Yet:

1. On Vercel import page, **BEFORE clicking Deploy**:

2. **Set Framework**:
   - Click **Framework Preset** dropdown
   - Select **"Other"** (NOT Next.js, NOT Node.js)

3. **Set Root Directory**:
   - Click **"Edit"** next to Root Directory
   - Type: `api`
   - Click **"Continue"**

4. **Override Build Command**:
   - Click **"Override"** on Build Command
   - Enter: `npm run vercel-build`

5. Now click **"Deploy"**

---

### If You Already Created the Project:

1. Go to your Vercel project dashboard (API project)
2. Click **"Settings"**
3. Go to **"General"** section
4. Find **"Build & Development Settings"**

**Change Framework:**
```
Framework Preset: Other
[Save]
```

**Set Root Directory:**
```
Root Directory: api
[Edit] → Type "api" → [Save]
```

**Set Build Command:**
```
Build Command: [Override]
npm run vercel-build
[Save]
```

**Set Output Directory:**
```
Output Directory: (leave empty)
[Save]
```

5. Go to **"Deployments"** tab
6. Click **"..."** (three dots) → **"Redeploy"**

---

## 🎯 Correct Settings Summary

### Backend/API Project:
```yaml
Project Name: meatlovers-api (or your choice)
Framework Preset: Other                    ← NOT Next.js!
Root Directory: api                        ← Points to api/ folder
Build Command: npm run vercel-build        ← Custom command
Output Directory: (empty)                  ← Leave blank
Install Command: npm install               ← Default is fine
```

### Frontend/UI Project:
```yaml
Project Name: meatlovers-ui (or your choice)
Framework Preset: Next.js                  ← This one uses Next.js
Root Directory: ui                         ← Points to ui/ folder
Build Command: npm run build               ← Auto-detected
Output Directory: (empty)                  ← Auto-detected
Install Command: npm install               ← Auto-detected
```

---

## 🔍 Why This Happens

Your repository has:
- **Backend (api/)**: NestJS serverless API
- **Frontend (ui/)**: Next.js application

Vercel auto-detects frameworks, and if you don't specify, it tries to find Next.js. For the **API**, you must tell Vercel it's **NOT Next.js** by selecting **"Other"**.

---

## ⚠️ Common Mistakes for API Deployment

### ❌ Wrong Framework Preset:
```
Framework Preset: Next.js    ← This is WRONG for API!
Framework Preset: Node.js    ← This is also WRONG!
```

### ✅ Correct Framework Preset:
```
Framework Preset: Other      ← This is CORRECT for API!
```

### ❌ Wrong Root Directory:
```
Root Directory: (empty)      ← Looks at root, not api/
Root Directory: ./api        ← Don't add ./
Root Directory: /api         ← Don't add /
Root Directory: ui           ← That's the frontend!
```

### ✅ Correct Root Directory:
```
Root Directory: api          ← Exactly "api"
```

### ❌ Wrong or Missing Build Command:
```
Build Command: npm run build      ← Generic, won't work
Build Command: (empty)            ← Won't generate serverless function
```

### ✅ Correct Build Command:
```
Build Command: npm run vercel-build    ← Runs: build + prisma:generate
```

---

## 🧪 Verify API Configuration

After setting correctly, verify in `api/package.json`:

```json
{
  "scripts": {
    "vercel-build": "npm run build && npm run prisma:generate"
  }
}
```

This command:
1. ✅ Builds NestJS (`npm run build`)
2. ✅ Generates Prisma client (`npm run prisma:generate`)

---

## 📊 Project Structure Reference

```
meatlovers/                        ← Root of repository
│
├── api/                           ← Backend (NestJS)
│   ├── package.json              ← Has NestJS (NOT Next.js)
│   ├── src/
│   │   ├── main.ts               ← Traditional entry
│   │   └── serverless.ts         ← Serverless entry ✅
│   ├── vercel.json               ← Vercel config for API
│   └── prisma/
│       └── schema.prisma         ← Database schema
│
├── ui/                            ← Frontend (Next.js)
│   ├── package.json              ← Has Next.js
│   ├── next.config.mjs
│   └── src/app/
│
└── package.json                  ← Root (not used by Vercel)
```

**For API**: Framework = "Other", Root = "api"  
**For UI**: Framework = "Next.js", Root = "ui"

---

## ✅ Deployment Checklist for API

Before deploying API:

- [ ] Framework Preset: **Other** (NOT Next.js)
- [ ] Root Directory: **api**
- [ ] Build Command: **npm run vercel-build** (overridden)
- [ ] Output Directory: **(empty)**
- [ ] Install Command: **npm install**
- [ ] Environment variables added (DATABASE_URL, JWT_SECRET, etc.)
- [ ] External database set up (Neon/Supabase)

---

## 🎬 Deploy API - Step by Step

### Create New Project:

1. **Vercel Dashboard** → **New Project**
2. **Import** your repository: `meatloverlisaa/meatlovers`

3. **Configure**:
   ```
   Framework Preset: [Click dropdown] → Select "Other"
   Root Directory: [Click Edit] → Type "api" → Continue
   ```

4. **Build & Development Settings**:
   ```
   Build Command: [Click Override] → npm run vercel-build
   Output Directory: (leave empty)
   Install Command: npm install (leave as is)
   ```

5. **Environment Variables** → Click **Add**:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=025e31efe478f1c5...
   REFRESH_TOKEN_SECRET=296bf858730c93...
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_EXPIRES_IN=7d
   NODE_ENV=production
   ALLOWED_ORIGINS=http://localhost:3000
   ```

6. **Deploy** → Wait 2-3 minutes

7. **Save Backend URL**: `https://meatlovers-api.vercel.app`

---

## 🆘 Still Getting Errors?

### Error: "No package.json found"
**Fix**: Make sure Root Directory is set to `api` (not empty)

### Error: "Build failed"
**Fix**: Check `api/package.json` has `vercel-build` script:
```json
"scripts": {
  "vercel-build": "npm run build && npm run prisma:generate"
}
```

### Error: "Missing dependencies"
**Fix**: Make sure these are in `api/package.json`:
```json
"dependencies": {
  "@nestjs/platform-express": "^11.2.1",
  "express": "^5.2.1"
}
```

### Error: "Serverless function not found"
**Fix**: Check `api/vercel.json` exists with correct routing:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/serverless.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/serverless.ts"
    }
  ]
}
```

---

## ✨ Success Indicators

After correct configuration and deployment:

1. ✅ Build completes without errors
2. ✅ Serverless function created
3. ✅ Deployment successful
4. ✅ Can access: `https://your-api.vercel.app/health`
5. ✅ Returns: `{"status":"ok"}`

---

## 🔄 Quick Reset

If nothing works, **start fresh**:

1. **Delete** the API project on Vercel
2. **New Project** → Import repository
3. **Framework**: Select **"Other"** FIRST
4. **Root Directory**: Set to **"api"** SECOND
5. **Build Command**: Override to **"npm run vercel-build"** THIRD
6. **Add environment variables**
7. **Deploy**

---

## 📚 Summary

**The Key Difference:**

| Component | Framework | Root Directory |
|-----------|-----------|----------------|
| **API** | **Other** | **api** |
| **UI** | Next.js | ui |

**Remember**: API uses NestJS (not Next.js), so Framework must be "Other"!

---

**Try redeploying with these settings!** 🚀
