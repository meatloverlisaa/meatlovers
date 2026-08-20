# ⚡ Quick Vercel Setup - 2 Projects

## TL;DR

Deploy **2 separate Vercel projects** from the same GitHub repo:

---

## 1️⃣ Backend (API)

### Vercel Settings:
```
Root Directory: api
Framework: Other
Build Command: npm run vercel-build
```

### Environment Variables:
```env
DATABASE_URL=postgresql://...        # From Neon/Supabase
JWT_SECRET=025e31efe478...          # From PRODUCTION_SECRETS.txt
REFRESH_TOKEN_SECRET=296bf858...    # From PRODUCTION_SECRETS.txt
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000
```

### Result:
✅ Backend URL: `https://your-backend.vercel.app`

---

## 2️⃣ Frontend (UI)

### Vercel Settings:
```
Root Directory: ui              ⚠️ CRITICAL! Click "Edit" to set this!
Framework: Next.js
Build Command: npm run build
```

**⚠️ IMPORTANT**: You MUST set Root Directory to `ui` or you'll get "No Next.js version detected" error!

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

### Result:
✅ Frontend URL: `https://your-frontend.vercel.app`

---

## 3️⃣ Update Backend CORS

After frontend deploys, update backend:

```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

Then **redeploy backend**.

---

## 🗄️ Database Setup (Required!)

### Option 1: Neon (Easiest)
1. https://neon.tech → Create Project
2. Copy connection string
3. Add to backend as `DATABASE_URL`

### Option 2: Supabase
1. https://supabase.com → New Project
2. Settings → Database → Connection String
3. Add to backend as `DATABASE_URL`

---

## ✅ Done!

- Backend: `https://your-backend.vercel.app`
- Frontend: `https://your-frontend.vercel.app`
- Both auto-deploy on git push

**Full Guide**: See `VERCEL_BOTH_DEPLOY_GUIDE.md`
