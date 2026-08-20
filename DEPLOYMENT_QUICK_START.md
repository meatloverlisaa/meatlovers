# 🚀 Quick Deployment Guide

## Your Setup

```
┌─────────────────────────────────────────────┐
│  MeetLovers Restaurant Management System   │
└─────────────────────────────────────────────┘
           │
           ├── 📱 ui/    (Next.js Frontend)
           └── 🔧 api/   (NestJS Backend + PostgreSQL)
```

## ✅ Best Deployment Strategy

### Backend → Railway (or Render)
### Frontend → Vercel

---

## 🎯 3-Step Deployment

### Step 1: Deploy Backend (5 minutes)

**Using Railway (Easiest):**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Go to API folder
cd /home/the-macharias/MeatLovers/meetlovers/api

# Login and deploy
railway login
railway init
railway add postgresql
railway up

# Run database migrations
railway run npm run prisma:migrate:deploy

# Get your backend URL
railway domain
```

Save the URL: `https://your-app.railway.app` ← **You'll need this!**

---

### Step 2: Deploy Frontend (5 minutes)

**Push to GitHub:**
```bash
cd /home/the-macharias/MeatLovers/meetlovers
git add .
git commit -m "Deploy to production"
git push origin main
```

**Deploy on Vercel:**
1. Visit: https://vercel.com/new
2. Import your GitHub repository
3. **Configure:**
   - Root Directory: `ui`
   - Framework: Next.js (auto-detected)
4. **Add Environment Variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-app.railway.app
   ```
5. Click "Deploy"

---

### Step 3: Test (2 minutes)

```bash
# Visit your Vercel URL
https://your-project.vercel.app

# Try:
1. Homepage loads ✓
2. Login works ✓
3. Dashboard displays ✓
```

---

## 🔐 Required Environment Variables

### Backend (Railway Dashboard)

Already auto-configured:
- ✅ `DATABASE_URL` (automatic from Railway PostgreSQL)

Add manually:
```env
JWT_SECRET=change-this-super-secret-key-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=change-this-refresh-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
```

### Frontend (Vercel Dashboard)

```env
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

---

## 💰 Cost

**Free for development:**
- Railway: $5 credit/month (enough for development)
- Vercel: Unlimited (free tier)

**Total: $0-5/month**

---

## 🎬 Alternative: Vercel for Both (Advanced)

You CAN deploy both on Vercel, but it requires converting your NestJS app to serverless functions. Not recommended for beginners.

**Why separate platforms are better:**
1. ✅ Easier setup
2. ✅ Better performance (dedicated backend server)
3. ✅ Easier database management
4. ✅ More flexible scaling
5. ✅ Simpler debugging

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
railway logs
# Check for errors
```

### Database connection failed?
```bash
railway run npm run prisma:migrate:deploy
```

### Frontend can't reach backend?
- Check `NEXT_PUBLIC_API_URL` in Vercel settings
- Make sure it starts with `https://`
- Redeploy frontend after changing env vars

### CORS errors?
Update `api/src/main.ts`:
```typescript
app.enableCors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:3000'  // for development
  ],
  credentials: true,
});
```

---

## 📚 Full Documentation

See `FULL_DEPLOYMENT_GUIDE.md` for:
- Alternative platforms (Render, Fly.io)
- Docker deployment
- Advanced configuration
- Security best practices
- Monitoring setup

---

## ✨ That's It!

Your restaurant management system will be live in ~15 minutes:
- Backend: `https://your-app.railway.app`
- Frontend: `https://your-project.vercel.app`

**Start with Step 1 above!** 🚀
