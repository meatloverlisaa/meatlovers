# 🔧 Fix: "No Next.js version detected" Error

## Problem

Vercel says: **"No Next.js version detected"**

This happens because Vercel is looking in the **wrong directory**.

---

## ✅ Solution: Set Root Directory Correctly

### When Creating the Project on Vercel:

#### For **Frontend (UI)**:

```
┌─────────────────────────────────────────────┐
│  Configure Project                          │
├─────────────────────────────────────────────┤
│                                             │
│  Project Name: meatlovers-ui                │
│                                             │
│  Framework Preset: Next.js ▼                │
│                                             │
│  Root Directory: ui        ← IMPORTANT!     │
│  (Click "Edit" button to change)            │
│                                             │
│  Build Command: npm run build               │
│  (auto-detected, leave as is)               │
│                                             │
│  Output Directory: (leave empty)            │
│                                             │
│  Install Command: npm install               │
│  (auto-detected, leave as is)               │
│                                             │
└─────────────────────────────────────────────┘
```

**Key Point**: The **Root Directory** MUST be set to `ui`

---

## 📝 Step-by-Step Fix

### If You Haven't Deployed Yet:

1. On Vercel import page, **BEFORE clicking Deploy**:
2. Look for **"Root Directory"** section
3. Click **"Edit"** button next to Root Directory
4. Type: `ui`
5. Click **"Continue"**
6. Now click **"Deploy"**

### If You Already Created the Project:

1. Go to your Vercel project dashboard
2. Click **"Settings"**
3. Scroll to **"Build & Development Settings"**
4. Find **"Root Directory"**
5. Click **"Edit"**
6. Enter: `ui`
7. Click **"Save"**
8. Go to **"Deployments"** tab
9. Click **"..."** (three dots) on latest deployment
10. Click **"Redeploy"**

---

## 🎯 Correct Configuration for Both Projects

### Frontend Project (UI)
```yaml
Root Directory: ui
Framework: Next.js
Build Command: npm run build
Output Directory: (leave empty)
Install Command: npm install
```

### Backend Project (API)
```yaml
Root Directory: api
Framework: Other
Build Command: npm run vercel-build
Output Directory: (leave empty)
Install Command: npm install
```

---

## 🔍 Visual Guide - Where to Click

### Step 1: Import Repository
```
Vercel Dashboard → New Project → Import Git Repository
```

### Step 2: Find Root Directory Setting
```
After selecting repo, you'll see:

┌────────────────────────────────┐
│ Import Git Repository          │
├────────────────────────────────┤
│ Configure Project              │
│                                │
│ Framework Preset: Next.js      │
│                                │
│ Root Directory: ./             │ ← Click "Edit" here!
│ [Edit]                         │
│                                │
│ Build and Output Settings ▼    │
└────────────────────────────────┘
```

### Step 3: Set Root Directory
```
┌────────────────────────────────┐
│ Root Directory                 │
├────────────────────────────────┤
│                                │
│ The directory in which your    │
│ code is located. Leave empty   │
│ if your code is in the root.   │
│                                │
│ [  ui  ]                       │ ← Type "ui" here
│                                │
│ [Cancel] [Continue]            │
└────────────────────────────────┘
```

---

## 🧪 Verify It's Working

After setting Root Directory to `ui`, Vercel should:

1. ✅ Detect Next.js automatically
2. ✅ Show "Framework Preset: Next.js"
3. ✅ Auto-fill Build Command: `npm run build`
4. ✅ Auto-fill Install Command: `npm install`

If you see these, you're good to deploy!

---

## ⚠️ Common Mistakes

### ❌ Wrong:
```
Root Directory: ./ui     (Don't add ./)
Root Directory: /ui      (Don't add /)
Root Directory: ui/      (Don't add trailing /)
Root Directory: (empty)  (This looks at root)
```

### ✅ Correct:
```
Root Directory: ui
```

---

## 🆘 Still Not Working?

### Check These:

1. **Is `package.json` in the right place?**
   ```bash
   # Should be at:
   ui/package.json  ✅
   
   # Not at:
   package.json     ❌
   ```

2. **Does `ui/package.json` have Next.js?**
   ```json
   {
     "dependencies": {
       "next": "^14.2.35"  ✅
     }
   }
   ```

3. **Are you on the right branch?**
   - Check Vercel is deploying from: `chore/narrow-eslint-suppressions` or `main`

4. **Try re-importing:**
   - Delete the Vercel project
   - Import again from scratch
   - Set Root Directory: `ui` BEFORE first deploy

---

## 📊 Project Structure Reference

Your repository structure:
```
meatlovers/                    ← Root of repository
├── api/                       ← Backend (NestJS)
│   ├── package.json          ← Has NestJS
│   ├── src/
│   │   └── serverless.ts     ← Serverless adapter
│   └── vercel.json           ← Backend Vercel config
│
├── ui/                        ← Frontend (Next.js)
│   ├── package.json          ← Has Next.js ✅
│   ├── next.config.mjs       ← Next.js config
│   ├── src/
│   │   └── app/              ← Next.js pages
│   └── vercel.json           ← Frontend Vercel config
│
└── package.json              ← Root package (not used by Vercel)
```

**For frontend**: Root Directory must be `ui` so Vercel looks at `ui/package.json`

---

## ✅ Quick Checklist

Before deploying frontend:

- [ ] Repository imported to Vercel
- [ ] Root Directory set to: `ui`
- [ ] Framework detected as: Next.js
- [ ] Build Command: `npm run build` (auto-filled)
- [ ] Environment variable added: `NEXT_PUBLIC_API_URL`
- [ ] Ready to deploy!

---

## 🎬 Try Again

1. **Delete** current failed deployment project (if any)
2. **New Project** on Vercel
3. **Import** your repository
4. **Set Root Directory** to `ui` ← This is the key!
5. **Add** environment variables
6. **Deploy**

Should work now! 🚀

---

**Need more help?** Share a screenshot of your Vercel configuration screen.
