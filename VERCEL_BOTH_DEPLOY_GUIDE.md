# 🚀 Deploy Both Frontend & Backend on Vercel

## Overview

You'll create **TWO separate Vercel projects** from the same GitHub repository:
1. **Project 1**: Backend API (serverless)
2. **Project 2**: Frontend UI (Next.js)

---

## Prerequisites

✅ Code pushed to GitHub  
✅ Vercel account connected to GitHub  
✅ External PostgreSQL database (Neon, Supabase, or PlanetScale)

---

## Part 1: Deploy Backend API

### Step 1: Create Backend Project on Vercel

1. Go to https://vercel.com/new
2. **Import your repository**: `meatloverlisaa/meatlovers`
3. **Configure Project**:
   ```
   Project Name: meatlovers-api (or any name you prefer)
   Framework Preset: Other
   Root Directory: api
   Build Command: npm run vercel-build
   Output Directory: (leave empty)
   Install Command: npm install
   ```

### Step 2: Add Backend Environment Variables

Click **Environment Variables** and add these:

```env
# Database (REQUIRED - from Neon/Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secrets (from PRODUCTION_SECRETS.txt)
JWT_SECRET=025e31efe478f1c5144ccf0a6f61c1c317395d94d6bc8093de8dc6a13c37177dd62f7d89a3f686e97dc25c0fb63676a886af9c94f29677bb174b881c42a85187
REFRESH_TOKEN_SECRET=296bf858730c937cc7a4a73d2b44aff8a30b19e7a15f63cd60581b1fb17465e5aa45ad0dcdaabc694a298842c1cf23dfd7e63db084df913e5f1dea63f4df1649

# JWT Configuration
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
NODE_ENV=production

# CORS (update after frontend deployment)
ALLOWED_ORIGINS=http://localhost:3000
```

### Step 3: Deploy Backend

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. **Copy your backend URL**: `https://meatlovers-api.vercel.app` ← Save this!

### Step 4: Run Database Migrations

After backend deploys, you need to run Prisma migrations:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not installed
npm install -g vercel

# Link to your project
cd /home/the-macharias/MeatLovers/meetlovers/api
vercel link

# Run migrations
vercel env pull .env.production
npm run prisma:migrate:deploy
```

**Option B: Using GitHub Actions or Manual SQL**
- Export your Prisma migrations to SQL
- Run them directly on your database

---

## Part 2: Deploy Frontend UI

### Step 1: Create Frontend Project on Vercel

1. Go to https://vercel.com/new again
2. **Import the SAME repository**: `meatloverlisaa/meatlovers`
3. **Configure Project**:
   ```
   Project Name: meatlovers-ui (or any name you prefer)
   Framework Preset: Next.js
   Root Directory: ui
   Build Command: npm run build
   Output Directory: (leave as default)
   Install Command: npm install
   ```

### Step 2: Add Frontend Environment Variables

Click **Environment Variables** and add:

```env
# Backend API URL (from Step 1.3)
NEXT_PUBLIC_API_URL=https://meatlovers-api.vercel.app
```

### Step 3: Deploy Frontend

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. **Your frontend URL**: `https://meatlovers-ui.vercel.app` ← Your live app!

---

## Part 3: Update Backend CORS

Now that you have the frontend URL, update the backend:

1. Go to your **backend project** on Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Update `ALLOWED_ORIGINS`:
   ```env
   ALLOWED_ORIGINS=https://meatlovers-ui.vercel.app,http://localhost:3000
   ```
4. **Redeploy** the backend (Vercel → Deployments → three dots → Redeploy)

---

## 🎯 Summary of What You'll Have

```
┌─────────────────────────────────────────────────┐
│  Your Vercel Deployment Architecture           │
└─────────────────────────────────────────────────┘

┌──────────────────────────┐
│  Frontend (Next.js)      │
│  meatlovers-ui.vercel.app│
└────────────┬─────────────┘
             │
             │ API Calls
             ▼
┌──────────────────────────┐
│  Backend (NestJS)        │
│  meatlovers-api.vercel.app│
└────────────┬─────────────┘
             │
             │ Queries
             ▼
┌──────────────────────────┐
│  PostgreSQL Database     │
│  (Neon/Supabase)         │
└──────────────────────────┘
```

**Frontend**: `https://meatlovers-ui.vercel.app`  
**Backend**: `https://meatlovers-api.vercel.app`  
**Database**: External PostgreSQL service

---

## 📋 Quick Reference Card

### Backend Project Settings
```
Root Directory: api
Framework: Other
Build Command: npm run vercel-build
```

### Frontend Project Settings
```
Root Directory: ui
Framework: Next.js
Build Command: npm run build
```

---

## 🔧 Setting Up External Database

### Option 1: Neon (Recommended - Free Tier)

1. Go to https://neon.tech
2. Sign up and create a new project
3. Create a database named `meatlovers`
4. **Copy the connection string**: `postgresql://...`
5. Add to backend env vars as `DATABASE_URL`

**Neon Free Tier**: 
- ✅ 500 MB storage
- ✅ Unlimited queries
- ✅ 1 project
- ✅ Perfect for development/production

### Option 2: Supabase

1. Go to https://supabase.com
2. Create new project
3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI mode)
5. Add to backend env vars as `DATABASE_URL`

**Supabase Free Tier**:
- ✅ 500 MB database
- ✅ 2 GB bandwidth
- ✅ Includes auth, storage, real-time

### Option 3: PlanetScale

1. Go to https://planetscale.com
2. Create new database
3. Create a branch (production)
4. Copy connection string
5. Add to backend env vars as `DATABASE_URL`

---

## ✅ Testing Your Deployment

### 1. Test Backend API

```bash
# Health check
curl https://meatlovers-api.vercel.app/health

# Should return: {"status":"ok"}
```

### 2. Test Frontend

1. Visit: `https://meatlovers-ui.vercel.app`
2. Check:
   - [ ] Homepage loads
   - [ ] Styles applied correctly
   - [ ] Login page accessible
   - [ ] No console errors

### 3. Test API Connection

1. Open browser console on frontend
2. Try to login
3. Check Network tab:
   - [ ] API requests going to backend URL
   - [ ] No CORS errors
   - [ ] Getting responses

---

## 🆘 Troubleshooting

### Backend build fails with "Cannot find module"

**Problem**: Missing dependencies  
**Solution**: 
```bash
cd api
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Frontend can't connect to backend

**Problem**: Wrong API URL or CORS issue  
**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in frontend env vars
2. Must include protocol: `https://your-backend.vercel.app`
3. Check backend `ALLOWED_ORIGINS` includes frontend URL

### Database connection fails

**Problem**: Wrong DATABASE_URL or database not accessible  
**Solution**:
1. Verify connection string format:
   ```
   postgresql://user:password@host:5432/database?sslmode=require
   ```
2. Check database service is running
3. Verify IP allowlist (if any)

### "Serverless Function has timed out"

**Problem**: Backend function exceeds 10s limit (Hobby plan)  
**Solution**:
1. Upgrade to Pro plan (60s timeout)
2. Optimize slow database queries
3. Add database indexes
4. Consider Railway for backend instead

### Frontend build succeeds but pages are blank

**Problem**: Environment variables not set correctly  
**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set
2. Must start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after changing env vars

---

## 💡 Pro Tips

### 1. Use Vercel CLI for Faster Workflow

```bash
# Install
npm install -g vercel

# Deploy backend
cd api
vercel --prod

# Deploy frontend
cd ../ui
vercel --prod
```

### 2. Set Up Custom Domains

**Backend**:
- `api.yourdomain.com` → meatlovers-api.vercel.app

**Frontend**:
- `yourdomain.com` → meatlovers-ui.vercel.app

Add in Vercel Dashboard → Settings → Domains

### 3. Enable Automatic Deployments

✅ Already enabled by default!
- Push to GitHub → Auto deploys
- Preview deployments for PRs
- Rollback to any previous deployment

### 4. Monitor Your Apps

1. **Vercel Analytics** (built-in)
   - Dashboard → Analytics
   - See traffic, performance, etc.

2. **Vercel Logs** (built-in)
   - Dashboard → Logs
   - Real-time function logs
   - Filter by severity

### 5. Cost Optimization

**Free Tier Limits**:
- 100 GB bandwidth/month
- 100 GB-hours compute/month
- Unlimited deployments
- Unlimited preview deployments

**When to Upgrade**:
- Need more bandwidth (heavy traffic)
- Longer serverless timeout (complex operations)
- Team collaboration features

---

## 🎬 Step-by-Step Video Guide

### Quick Deployment (5 minutes per project)

**Backend Deployment**:
1. Vercel Dashboard → New Project (0:30)
2. Import repo → Root: `api` (1:00)
3. Add environment variables (2:00)
4. Deploy → Copy URL (1:30)

**Frontend Deployment**:
1. Vercel Dashboard → New Project (0:30)
2. Import repo → Root: `ui` (1:00)
3. Add `NEXT_PUBLIC_API_URL` (1:00)
4. Deploy → Test app (2:30)

**Total Time**: ~10 minutes

---

## 📊 Deployment Checklist

### Pre-Deployment
- [x] Code pushed to GitHub
- [x] Serverless adapter created (`api/src/serverless.ts`)
- [x] Environment variables documented
- [ ] External database created (Neon/Supabase)
- [ ] Database connection string obtained

### Backend Deployment
- [ ] Vercel project created (Root: `api`)
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] Backend URL copied
- [ ] Database migrations run
- [ ] Health check endpoint tested

### Frontend Deployment
- [ ] Vercel project created (Root: `ui`)
- [ ] `NEXT_PUBLIC_API_URL` added
- [ ] Frontend deployed successfully
- [ ] Homepage loads correctly
- [ ] Styles applied correctly

### Post-Deployment
- [ ] Backend CORS updated with frontend URL
- [ ] Backend redeployed
- [ ] Login tested successfully
- [ ] API requests working
- [ ] No CORS errors
- [ ] Custom domains configured (optional)

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **NestJS Serverless**: https://docs.nestjs.com/faq/serverless
- **Neon Database**: https://neon.tech/docs
- **Supabase Database**: https://supabase.com/docs

---

## 🎉 You're Done!

Your MeetLovers app is now live on Vercel with:
- ✅ Serverless backend API
- ✅ Next.js frontend
- ✅ External PostgreSQL database
- ✅ Automatic deployments on Git push
- ✅ Free hosting (within limits)

**Next Steps**:
1. Set up monitoring
2. Configure custom domain
3. Add more features
4. Scale as needed

---

**Need Help?** Check the troubleshooting section or reach out with specific errors!

**Generated**: August 20, 2026  
**Status**: Production Ready ✅
