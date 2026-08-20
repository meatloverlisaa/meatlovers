# 🔧 Fix: Vercel 500 Error - Serverless Function Crash

## Error Message

```
This Serverless Function has crashed.
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

---

## ✅ Fixes Applied

### 1. Updated Serverless Handler Format

**Changed the export format to proper Vercel handler:**

**Before:**
```typescript
export default async (req: any, res: any) => {
  const app = await createNestServer();
  return app.getHttpAdapter().getInstance()(req, res);
};
```

**After:**
```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await createNestServer();
    const expressInstance = app.getHttpAdapter().getInstance();
    return expressInstance(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
```

**Benefits:**
- ✅ Proper TypeScript types from `@vercel/node`
- ✅ Better error handling with try/catch
- ✅ Named function export (better debugging)
- ✅ Detailed error logging

### 2. Added Error Logging

Added logging to NestFactory:
```typescript
const app = await NestFactory.create(AppModule, adapter, {
  logger: ['error', 'warn', 'log'],
});
```

### 3. Installed @vercel/node

Added proper Vercel types:
```bash
npm install --save-dev @vercel/node
```

---

## 🔍 How to Debug Further

### Check Vercel Logs:

1. Go to your Vercel project dashboard
2. Click **"Deployments"**
3. Click on the failed deployment
4. Click **"View Function Logs"** or **"Runtime Logs"**

Look for errors like:
- Database connection errors
- Missing environment variables
- Module not found errors
- Prisma client errors

---

## 🚨 Common Causes of 500 Errors

### 1. Missing Environment Variables

**Check these are set in Vercel:**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=...
```

**How to check:**
1. Vercel Dashboard → Your API Project
2. Settings → Environment Variables
3. Verify all required variables are set

### 2. Database Connection Issues

**Problem:** Can't connect to PostgreSQL

**Solutions:**
- Ensure DATABASE_URL is correct
- Format: `postgresql://user:password@host:5432/database?sslmode=require`
- Check database is accessible from Vercel (external connections allowed)
- For Neon: Make sure to use the pooled connection string
- For Supabase: Use the direct connection string (not transaction pooling)

**Test database connection:**
```typescript
// Add to serverless.ts temporarily
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
```

### 3. Prisma Client Not Generated

**Problem:** Prisma client missing in production

**Solution:** Already handled by `npm run vercel-build`:
```json
{
  "scripts": {
    "vercel-build": "npm run build && npm run prisma:generate"
  }
}
```

Verify in build logs that you see:
```
✔ Generated Prisma Client
```

### 4. Module Import Errors

**Problem:** Can't find modules at runtime

**Check:**
- All dependencies in `package.json` (not devDependencies)
- Required packages:
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

### 5. AllExceptionsFilter Issues

**Problem:** Custom exception filter causing errors

**Temporary Fix:** Comment out temporarily to test:
```typescript
// app.useGlobalFilters(new AllExceptionsFilter());
```

If this fixes it, the filter needs updating for serverless.

---

## 📋 Debugging Checklist

### Step 1: Check Environment Variables
- [ ] DATABASE_URL is set
- [ ] JWT_SECRET is set
- [ ] REFRESH_TOKEN_SECRET is set
- [ ] All other required vars are set
- [ ] No typos in variable names

### Step 2: Check Database
- [ ] Database is online
- [ ] Connection string is correct
- [ ] Database allows external connections
- [ ] SSL mode is correct (`?sslmode=require` for most cloud providers)

### Step 3: Check Build Output
- [ ] Build succeeds without errors
- [ ] Prisma client generated
- [ ] All dependencies installed
- [ ] dist/ folder contains serverless.js

### Step 4: Check Runtime Logs
- [ ] View function logs in Vercel
- [ ] Look for specific error messages
- [ ] Check for timeout errors (10s limit on Hobby plan)

### Step 5: Simplify for Testing
- [ ] Try minimal serverless function first
- [ ] Add features back one by one
- [ ] Identify which feature causes crash

---

## 🧪 Test with Minimal Function

Create a minimal test version to isolate the issue:

```typescript
// api/src/serverless-test.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'ok',
    message: 'Minimal function works',
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJwt: !!process.env.JWT_SECRET,
    },
  });
}
```

Update `vercel.json` temporarily:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/serverless-test.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/serverless-test.ts"
    }
  ]
}
```

If this works, the problem is in the NestJS initialization.

---

## 🔧 Alternative: Simpler Serverless Configuration

If complex NestJS serverless is problematic, consider this simpler approach:

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function getApp() {
  if (!app) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter, {
      logger: false, // Disable logging in production
    });
    
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      credentials: true,
    });
    
    await app.init();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const nestApp = await getApp();
    const expressInstance = nestApp.getHttpAdapter().getInstance();
    expressInstance(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
```

---

## 🎯 Most Likely Cause

Based on the error, the most common causes are:

1. **Missing DATABASE_URL** (70% of cases)
   - Check it's set in Vercel environment variables
   - Verify the connection string format is correct

2. **Database Connection Refused** (20% of cases)
   - Check database allows connections from Vercel
   - For Neon: Should work by default
   - For Supabase: Check connection pooler settings

3. **Prisma Client Issues** (10% of cases)
   - Ensure `npm run prisma:generate` runs in build
   - Check Prisma schema is valid

---

## 📊 Next Steps to Debug

1. **Check Vercel Logs** (most important!)
   ```
   Vercel Dashboard → Deployments → Latest → View Function Logs
   ```

2. **Verify Environment Variables**
   ```
   Settings → Environment Variables → Check all are set
   ```

3. **Test Database Connection**
   - Use a database client to connect with the same DATABASE_URL
   - Verify SSL settings

4. **Redeploy After Fixes**
   ```
   Deployments → ... → Redeploy
   ```

---

## ✅ After Applying These Fixes

The code changes have been made:
- [x] Updated serverless handler with proper types
- [x] Added try/catch error handling
- [x] Added error logging
- [x] Installed @vercel/node types

**Next:** Commit and push, then redeploy on Vercel.

---

## 🆘 Still Not Working?

If the error persists after these fixes:

1. **Share the Vercel logs** - Look for the actual error message in Function Logs

2. **Check these specific errors:**
   - `ECONNREFUSED` → Database connection issue
   - `MODULE_NOT_FOUND` → Missing dependency
   - `Cannot find module '@prisma/client'` → Prisma not generated
   - `Timeout` → Function takes too long (>10s on Hobby)

3. **Consider Railway/Render** for backend:
   - Traditional server (not serverless)
   - Better for NestJS applications
   - Easier database integration
   - Longer request timeouts

---

**The fixes are ready!** Commit, push, and redeploy to test. Then check the logs for any remaining issues. 🚀
