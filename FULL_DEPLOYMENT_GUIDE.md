# Complete Deployment Guide - Frontend + Backend

## Architecture Overview

```
MeetLovers Project
├── ui/          → Next.js Frontend (Port 3000)
└── api/         → NestJS Backend (Port 3001)
```

## 🎯 Recommended Deployment Strategy

### Option 1: Separate Deployments (Recommended)

Deploy frontend and backend on different platforms optimized for each:

**Frontend (Next.js)**: Vercel ✅
**Backend (NestJS + PostgreSQL)**: Railway, Render, or Fly.io ✅

---

## 📦 Backend Deployment Options

### Option A: Railway (Easiest - Recommended)

**Pros:**
- One-click PostgreSQL provisioning
- Automatic environment variables
- Free tier available ($5 credit/month)
- Git-based deployment
- Built-in database backups

**Steps:**

1. **Create Railway Account**: https://railway.app/

2. **Deploy Backend:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Navigate to API folder
   cd /home/the-macharias/MeatLovers/meetlovers/api
   
   # Initialize Railway project
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   
   # Deploy
   railway up
   ```

3. **Configure Environment Variables:**
   Railway automatically sets `DATABASE_URL`. Add these manually:
   ```env
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-production-secret
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_SECRET=your-refresh-secret
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

4. **Run Migrations:**
   ```bash
   railway run npm run prisma:migrate:deploy
   ```

5. **Get Backend URL:**
   ```bash
   railway domain
   # Example: https://your-app.railway.app
   ```

---

### Option B: Render (Good Alternative)

**Pros:**
- Free tier available
- Automatic HTTPS
- Easy database management

**Steps:**

1. **Create Render Account**: https://render.com/

2. **Create PostgreSQL Database:**
   - Dashboard → New PostgreSQL
   - Copy connection string

3. **Create Web Service:**
   - Dashboard → New Web Service
   - Connect GitHub repo
   - Root Directory: `api`
   - Build Command: `npm install && npm run build && npm run prisma:generate`
   - Start Command: `npm run start:prod`

4. **Environment Variables:**
   ```env
   DATABASE_URL=<from-render-postgres>
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret
   JWT_EXPIRES_IN=1h
   REFRESH_TOKEN_SECRET=your-refresh-secret
   REFRESH_TOKEN_EXPIRES_IN=7d
   ```

5. **After First Deploy:**
   ```bash
   # SSH into Render service and run migrations
   npm run prisma:migrate:deploy
   ```

---

### Option C: Fly.io (Most Control)

**Pros:**
- Global edge deployment
- Free allowance
- PostgreSQL included

**Steps:**

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy:**
   ```bash
   cd /home/the-macharias/MeatLovers/meetlovers/api
   fly launch
   # Follow prompts, select region, create Postgres
   fly deploy
   ```

---

## 🎨 Frontend Deployment (Vercel)

### Steps:

1. **Push to GitHub:**
   ```bash
   cd /home/the-macharias/MeatLovers/meetlovers
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your repository
   - **Root Directory**: `ui`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=<your-backend-url-from-railway-or-render>
   NODE_ENV=production
   ```
   Example: `NEXT_PUBLIC_API_URL=https://your-app.railway.app`

4. **Deploy!**

---

## ⚙️ Complete Deployment Workflow

### Step 1: Deploy Backend First

```bash
# Choose one platform (Railway recommended)
cd /home/the-macharias/MeatLovers/meetlovers/api

# Railway
railway login
railway init
railway add postgresql
railway up

# Get your backend URL
railway domain
# Save this URL: https://your-app.railway.app
```

### Step 2: Configure Backend

```bash
# Add environment variables in Railway dashboard
# Run migrations
railway run npm run prisma:migrate:deploy

# Test backend
curl https://your-app.railway.app/health
```

### Step 3: Deploy Frontend

```bash
# Push to GitHub
cd /home/the-macharias/MeatLovers/meetlovers
git push origin main

# Deploy on Vercel
# 1. Import repo on Vercel
# 2. Set Root Directory: ui
# 3. Add environment variable:
#    NEXT_PUBLIC_API_URL=https://your-app.railway.app
# 4. Deploy
```

### Step 4: Test Everything

```bash
# Visit your Vercel URL
https://your-project.vercel.app

# Try logging in
# Check if API calls work
```

---

## 🔧 Backend Configuration Files Needed

### Create `Procfile` (for Render/Railway)

Create `/api/Procfile`:
```
web: npm run start:prod
release: npm run prisma:migrate:deploy
```

### Create `.dockerignore` (if using Docker)

Create `/api/.dockerignore`:
```
node_modules
dist
.env
.git
*.md
```

### Update `package.json` Start Script

Already correct:
```json
{
  "scripts": {
    "start:prod": "node dist/src/main",
    "build": "nest build",
    "prisma:migrate:deploy": "prisma migrate deploy"
  }
}
```

---

## 🌍 Environment Variables Reference

### Backend (Railway/Render/Fly.io)

```env
# Database (automatically set by Railway)
DATABASE_URL=postgresql://...

# Node Environment
NODE_ENV=production
PORT=3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS (if needed)
FRONTEND_URL=https://your-project.vercel.app

# Optional: Redis (if using)
REDIS_URL=redis://...
```

### Frontend (Vercel)

```env
# API URL (from Railway/Render)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Node Environment
NODE_ENV=production
```

---

## 🔒 Security Checklist

- [ ] Changed all default secrets in production
- [ ] Database URL is secure and not exposed
- [ ] CORS configured to allow only your frontend domain
- [ ] HTTPS enabled (automatic on Vercel/Railway/Render)
- [ ] Environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Backend health check endpoint working
- [ ] Frontend can connect to backend API

---

## 📊 Cost Estimate (Free Tiers)

| Service | Free Tier | Paid Plans Start |
|---------|-----------|------------------|
| **Vercel** (Frontend) | 100GB bandwidth | $20/month |
| **Railway** (Backend + DB) | $5 credit/month | $5/month (pay as you go) |
| **Render** (Backend + DB) | 750 hours/month | $7/month |
| **Fly.io** (Backend + DB) | 3 VMs, 3GB storage | $5/month |

**Recommendation**: Start with Railway ($5 credit) + Vercel (free) = $0-5/month

---

## 🚨 Common Issues & Solutions

### Issue: Backend Returns 502

**Solution**: Check if backend is running and migrations are applied
```bash
railway logs
railway run npm run prisma:migrate:deploy
```

### Issue: CORS Errors

**Solution**: Update backend CORS configuration in `main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

### Issue: Database Connection Failed

**Solution**: Verify DATABASE_URL is set correctly
```bash
railway variables
# Check DATABASE_URL is present
```

### Issue: Frontend Can't Connect to Backend

**Solution**: Verify `NEXT_PUBLIC_API_URL` in Vercel:
- Go to Vercel Dashboard → Settings → Environment Variables
- Ensure `NEXT_PUBLIC_API_URL` is set to your backend URL
- Redeploy frontend

---

## 📝 Quick Start Commands

```bash
# Deploy Backend (Railway)
cd api
railway login
railway init
railway add postgresql
railway up
railway domain  # Save this URL

# Deploy Frontend (Vercel CLI)
cd ui
npm install -g vercel
vercel --prod
# Enter backend URL when prompted for NEXT_PUBLIC_API_URL

# Or just push to GitHub and use Vercel dashboard
git push origin main
```

---

## 🎉 Success Checklist

- [ ] Backend deployed and accessible
- [ ] Database created and migrations run
- [ ] Backend health check returns 200
- [ ] Frontend deployed on Vercel
- [ ] Frontend can fetch from backend API
- [ ] Login works end-to-end
- [ ] All features functional

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **NestJS Deployment**: https://docs.nestjs.com/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment

---

**Next Steps**: Choose backend platform (Railway recommended), deploy backend first, then deploy frontend!
