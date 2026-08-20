# 🎯 Vercel Setup: Two Separate Projects Required

## ⚠️ CRITICAL: You Need TWO Projects!

You **CANNOT** deploy both frontend and backend in one Vercel project. You need:

```
┌─────────────────────────────────────┐
│  Project 1: meatlovers-api          │
│  (Backend/NestJS)                   │
│  Root: api/                         │
│  Framework: Other                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Project 2: meatlovers-ui           │
│  (Frontend/Next.js)                 │
│  Root: ui/                          │
│  Framework: Next.js                 │
└─────────────────────────────────────┘
```

---

## 🚨 Are You Getting This Error?

```
No Next.js version detected. Make sure your package.json 
has "next" in either "dependencies" or "devDependencies"
```

**This means:**
- ✅ You're trying to deploy the API
- ❌ But Vercel thinks it's a Next.js project
- ❌ Or the Root Directory is not set to `api`

---

## ✅ Solution: Create TWO Separate Projects

### 🔵 **Project 1: Backend API**

#### Step 1: Create New Project
1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `meatloverlisaa/meatlovers`
4. **DO NOT CLICK DEPLOY YET!**

#### Step 2: Configure for API
```
┌──────────────────────────────────────────────┐
│ Configure Project                            │
├──────────────────────────────────────────────┤
│                                              │
│ Project Name:                                │
│ ┌──────────────────────────────────────────┐│
│ │ meatlovers-api                           ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Framework Preset:                            │
│ ┌──────────────────────────────────────────┐│
│ │ Other                    ▼               ││ ← CRITICAL!
│ └──────────────────────────────────────────┘│
│                                              │
│ Root Directory:                              │
│ ┌──────────────────────────────────────────┐│
│ │ api                                      ││ ← CRITICAL!
│ └──────────────────────────────────────────┘│
│ [Edit]                                       │
│                                              │
│ Build and Output Settings                    │
│ Build Command:         [Override]            │
│ ┌──────────────────────────────────────────┐│
│ │ npm run vercel-build                     ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Output Directory:                            │
│ ┌──────────────────────────────────────────┐│
│ │ (leave empty)                            ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Install Command:                             │
│ ┌──────────────────────────────────────────┐│
│ │ npm install                              ││
│ └──────────────────────────────────────────┘│
│                                              │
└──────────────────────────────────────────────┘
```

#### Step 3: Add Environment Variables
Click **"Environment Variables"** button:
```
DATABASE_URL=postgresql://...
JWT_SECRET=025e31efe478f1c5...
REFRESH_TOKEN_SECRET=296bf858730c93...
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000
```

#### Step 4: Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- **Save the URL**: `https://meatlovers-api.vercel.app`

---

### 🔵 **Project 2: Frontend UI**

#### Step 1: Create ANOTHER New Project
1. Go to https://vercel.com/new **AGAIN**
2. Click **"Import Git Repository"**
3. Select: `meatloverlisaa/meatlovers` (**SAME REPO!**)
4. **DO NOT CLICK DEPLOY YET!**

#### Step 2: Configure for UI
```
┌──────────────────────────────────────────────┐
│ Configure Project                            │
├──────────────────────────────────────────────┤
│                                              │
│ Project Name:                                │
│ ┌──────────────────────────────────────────┐│
│ │ meatlovers-ui                            ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Framework Preset:                            │
│ ┌──────────────────────────────────────────┐│
│ │ Next.js                  ▼               ││ ← CRITICAL!
│ └──────────────────────────────────────────┘│
│                                              │
│ Root Directory:                              │
│ ┌──────────────────────────────────────────┐│
│ │ ui                                       ││ ← CRITICAL!
│ └──────────────────────────────────────────┘│
│ [Edit]                                       │
│                                              │
│ Build and Output Settings                    │
│ Build Command:         (auto-detected)       │
│ ┌──────────────────────────────────────────┐│
│ │ npm run build                            ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Output Directory:      (auto-detected)       │
│ ┌──────────────────────────────────────────┐│
│ │ .next                                    ││
│ └──────────────────────────────────────────┘│
│                                              │
│ Install Command:       (auto-detected)       │
│ ┌──────────────────────────────────────────┐│
│ │ npm install                              ││
│ └──────────────────────────────────────────┘│
│                                              │
└──────────────────────────────────────────────┘
```

#### Step 3: Add Environment Variable
Click **"Environment Variables"** button:
```
NEXT_PUBLIC_API_URL=https://meatlovers-api.vercel.app
```
(Use the URL from Project 1!)

#### Step 4: Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- **Your Live App**: `https://meatlovers-ui.vercel.app`

---

### 🔵 **Project 3: Update Backend CORS**

#### Step 1: Update API Environment Variables
1. Go to **Project 1** (meatlovers-api)
2. Settings → Environment Variables
3. Find `ALLOWED_ORIGINS`
4. Update to:
   ```
   ALLOWED_ORIGINS=https://meatlovers-ui.vercel.app,http://localhost:3000
   ```

#### Step 2: Redeploy API
1. Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## 📊 Visual Summary

```
Your GitHub Repository
└── meatloverlisaa/meatlovers
    ├── api/     ─────┐
    │   └── ...       │
    │                 ├──► Vercel Project 1: meatlovers-api
    │                 │    Framework: Other
    │                 │    Root: api
    │                 │    URL: meatlovers-api.vercel.app
    │
    └── ui/      ─────┐
        └── ...       │
                      ├──► Vercel Project 2: meatlovers-ui
                      │    Framework: Next.js
                      │    Root: ui
                      │    URL: meatlovers-ui.vercel.app
```

**Key Point:** Same GitHub repo, TWO different Vercel projects with different Root Directories!

---

## 🎯 Quick Comparison

| Setting | Backend (API) | Frontend (UI) |
|---------|---------------|---------------|
| **Project Name** | meatlovers-api | meatlovers-ui |
| **Framework** | Other | Next.js |
| **Root Directory** | api | ui |
| **Build Command** | npm run vercel-build | npm run build |
| **GitHub Repo** | meatloverlisaa/meatlovers | meatloverlisaa/meatlovers |

**Same repo, different configurations!**

---

## ❌ Common Mistakes

### Mistake 1: Trying to Deploy Both in One Project
```
✗ Root Directory: (empty)
✗ Trying to build both api/ and ui/
✗ Result: "No Next.js version detected"
```

**Fix:** Create TWO separate projects

### Mistake 2: Wrong Framework for API
```
✗ Framework: Next.js (for API project)
✗ Result: "No Next.js version detected"
```

**Fix:** Set Framework to "Other" for API

### Mistake 3: Wrong Root Directory
```
✗ Root Directory: (empty) or wrong path
✗ Result: Can't find package.json
```

**Fix:** 
- API: Root Directory = `api`
- UI: Root Directory = `ui`

### Mistake 4: Setting Root Directory with Slashes
```
✗ Root Directory: ./api or /api or api/
```

**Fix:** 
- Exactly: `api` (no dots, no slashes)
- Exactly: `ui` (no dots, no slashes)

---

## 🔍 How to Check Your Current Setup

### Check if You Have Two Projects:

1. Go to Vercel Dashboard
2. You should see **TWO projects**:
   ```
   ┌────────────────────────┐
   │ meatlovers-api         │
   │ meatloverlisaa/...     │
   └────────────────────────┘
   
   ┌────────────────────────┐
   │ meatlovers-ui          │
   │ meatloverlisaa/...     │
   └────────────────────────┘
   ```

### If You Only Have ONE Project:

**You need to:**
1. Create the second project (follow steps above)
2. Or delete the wrong one and start over

---

## 📝 Step-by-Step Deployment Workflow

### Starting Fresh:

1. **Delete any existing Vercel projects** (if misconfigured)
   
2. **Create Project 1 (API)**:
   - New Project
   - Import repo
   - Framework: **Other**
   - Root: **api**
   - Override Build: **npm run vercel-build**
   - Add environment variables
   - Deploy
   - Copy API URL

3. **Create Project 2 (UI)**:
   - New Project **again**
   - Import **same repo**
   - Framework: **Next.js**
   - Root: **ui**
   - Add `NEXT_PUBLIC_API_URL` with API URL from step 2
   - Deploy
   - Copy UI URL

4. **Update API CORS**:
   - Go to Project 1 settings
   - Add UI URL to `ALLOWED_ORIGINS`
   - Redeploy

5. **Test**:
   - Visit UI URL
   - Check if it loads
   - Try login
   - Check browser console for errors

---

## ✅ Success Indicators

### For API Project:
- ✓ Framework shows: **Other**
- ✓ Root Directory shows: **api**
- ✓ Build succeeds
- ✓ URL works: `https://your-api.vercel.app`

### For UI Project:
- ✓ Framework shows: **Next.js**
- ✓ Root Directory shows: **ui**
- ✓ Build succeeds (147 static pages)
- ✓ URL works: `https://your-ui.vercel.app`
- ✓ Styles load correctly
- ✓ No CORS errors

---

## 🆘 If Still Getting "No Next.js version detected"

This means you're still trying to deploy the API with Next.js detection.

**Check these:**

1. **Are you in the API project?**
   - Settings → General → Framework Preset
   - Should be: **Other** (not Next.js)

2. **Is Root Directory set correctly?**
   - Settings → General → Root Directory
   - Should be: **api** (not empty, not ui)

3. **Did you click Override on Build Command?**
   - Settings → Build & Development Settings
   - Build Command should be: **npm run vercel-build**

4. **Start over if needed:**
   - Delete the project
   - Create new project
   - Follow the exact steps above
   - DON'T skip any configuration step

---

## 🎯 Final Checklist

Before deploying, verify:

### API Project Configuration:
- [ ] Project name includes "api"
- [ ] Framework Preset: **Other**
- [ ] Root Directory: **api**
- [ ] Build Command: **npm run vercel-build** (overridden)
- [ ] All environment variables added
- [ ] External database URL added

### UI Project Configuration:
- [ ] Project name includes "ui"
- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: **ui**
- [ ] Build Command: **npm run build** (auto-detected)
- [ ] NEXT_PUBLIC_API_URL added (with API URL)

### Post-Deployment:
- [ ] Both projects deployed successfully
- [ ] API URL accessible
- [ ] UI URL accessible and styled correctly
- [ ] CORS updated on API with UI URL
- [ ] API redeployed after CORS update

---

**Remember: Same GitHub repo → TWO Vercel projects with different Root Directories!** 🚀
