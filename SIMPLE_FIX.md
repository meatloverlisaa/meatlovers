# 🔧 SIMPLE FIX - Database Error

## What's Wrong?

Your API shows this error:
```
The table `public.leave_requests` does not exist
```

## Why?

Your **Vercel deployment** doesn't have the `DATABASE_URL` environment variable set correctly, OR the database is empty.

---

## ✅ FIX IT NOW (3 Steps)

### Step 1: Go to Vercel

1. Open your browser
2. Go to: **https://vercel.com/dashboard**
3. Click on your **API project** (the backend one)

### Step 2: Add Database URL

1. Click **"Settings"** on the left
2. Click **"Environment Variables"**
3. Look for **DATABASE_URL**

**If DATABASE_URL exists:**
- Copy the value
- Make sure it's the same as this:
```
postgresql://neondb_owner:npg_VR8T4DJPMyOq@ep-little-dust-axitggkv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**If DATABASE_URL doesn't exist:**
- Click **"Add New"**
- Name: `DATABASE_URL`
- Value: 
```
postgresql://neondb_owner:npg_VR8T4DJPMyOq@ep-little-dust-axitggkv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```
- Click **"Save"**

### Step 3: Redeploy

1. Click **"Deployments"** tab
2. Click the **"..."** button on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Test It

After redeployment, visit:
```
https://meatlovers-6seidk48k-meatlovers.vercel.app/hrm/leave/summary
```

It should work now! No more errors.

---

## 🎯 That's It!

You just needed to:
1. Add DATABASE_URL to Vercel ✅
2. Redeploy ✅
3. Done! ✅

---

**The database already has tables. Vercel just needs the connection string.** 🚀
