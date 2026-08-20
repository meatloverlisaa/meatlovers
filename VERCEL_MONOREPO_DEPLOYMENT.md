# Deploy Both Frontend + Backend on Vercel (Monorepo)

## ⚡ Overview

You have two deployment options for Vercel:

### Option A: Two Separate Vercel Projects (Easier) ⭐ Recommended
- Deploy `ui/` as one project (frontend)
- Deploy `api/` as another project (backend serverless)
- Each has its own URL
- Easier to manage and debug

### Option B: Single Monorepo Project (Advanced)
- Deploy both from one repository
- Single deployment command
- Shared configuration
- More complex setup

---

## 🚀 Option A: Two Separate Projects (RECOMMENDED)

### Step 1: Deploy Backend API

#### 1.1 Create Vercel Serverless Adapter

Create `/api/src/serverless.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import * as express from 'express';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);

export let cachedApp: any;

async function createNestServer() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, adapter);

  app.useGlobalFilters(new AllExceptionsFilter());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.init();
  cachedApp = app;
  return app;
}

export default async (req: any, res: any) => {
  const app = await createNestServer();
  return app.getHttpAdapter().getInstance()(req, res);
};
```

#### 1.2 Create `/api/vercel.json`

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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.3 Update `/api/package.json`

Add build command for Vercel:

```json
{
  "scripts": {
    "build": "nest build",
    "vercel-build": "npm run build && npm run prisma:generate"
  }
}
```

#### 1.4 Deploy API to Vercel

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Or link to GitHub and deploy via dashboard
```

#### 1.5 Configure API Environment Variables (Vercel Dashboard)

Go to Vercel Dashboard → Your API Project → Settings → Environment Variables:

```env
DATABASE_URL=<your-postgres-connection-string>
JWT_SECRET=<from-PRODUCTION_SECRETS.txt>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=<from-PRODUCTION_SECRETS.txt>
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Note**: For DATABASE_URL, you'll need:
- **Neon** (Serverless Postgres): https://neon.tech (Free tier)
- **Supabase**: https://supabase.com (Free tier)
- **PlanetScale**: https://planetscale.com (Free tier)

---

### Step 2: Deploy Frontend UI

```bash
cd /home/the-macharias/MeatLovers/meetlovers/ui

# Deploy
vercel --prod
```

#### Configure UI Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
```

---

## 🏗️ Option B: Single Monorepo Project

### Project Structure

```
meetlovers/
├── api/              → Backend (Serverless Functions)
├── ui/               → Frontend
└── vercel.json       → Monorepo config
```

### Create Root `/vercel.json`

Create `/home/the-macharias/MeatLovers/meetlovers/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "ui/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "api/src/serverless.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/src/serverless.ts"
    },
    {
      "src": "/(.*)",
      "dest": "ui/$1"
    }
  ]
}
```

### Deploy Monorepo

```bash
cd /home/the-macharias/MeatLovers/meetlovers

# Deploy everything
vercel --prod
```

### Environment Variables (Monorepo)

Set in Vercel Dashboard:

```env
# API Variables
DATABASE_URL=<postgres-url>
JWT_SECRET=<secret>
REFRESH_TOKEN_SECRET=<secret>
NODE_ENV=production

# Frontend Variables  
NEXT_PUBLIC_API_URL=/api
```

---

## 🗄️ Database Options for Vercel

Since Vercel is serverless, you need a serverless-compatible database:

### 1. Neon (Recommended for Vercel) ⭐

```bash
# Sign up: https://neon.tech
# Create project
# Copy connection string
# Format: postgresql://user:pass@host/db?sslmode=require
```

**Pros:**
- Serverless Postgres (perfect for Vercel)
- Free tier: 10 databases, 3GB storage
- Auto-scaling
- Excellent performance

### 2. Supabase

```bash
# Sign up: https://supabase.com
# Create project
# Get Database → Connection String → Direct
```

**Pros:**
- Generous free tier
- Built-in auth, storage, realtime
- Good dashboard

### 3. PlanetScale (MySQL)

```bash
# Sign up: https://planetscale.com
# Create database
# Get connection string
```

**Note**: Requires Prisma MySQL adapter changes

---

## ⚙️ Complete Setup Guide (Two Projects Approach)

### Phase 1: Prepare Files

```bash
cd /home/the-macharias/MeatLovers/meetlovers
```

#### 1. Create API Serverless Handler

Create `api/src/serverless.ts` (see code above)

#### 2. Create API Vercel Config

Create `api/vercel.json` (see code above)

#### 3. Update API Package.json

```bash
cd api
npm install @nestjs/platform-express express
```

### Phase 2: Setup Database

```bash
# Option 1: Neon (Recommended)
# 1. Sign up at https://neon.tech
# 2. Create project: "meetlovers-production"
# 3. Copy connection string
# 4. Save for later

# Option 2: Supabase
# 1. Sign up at https://supabase.com
# 2. Create project
# 3. Get connection string from Settings → Database
```

### Phase 3: Deploy API

```bash
cd api

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel --prod

# When prompted:
# - Project name: meetlovers-api
# - Build command: (leave default)
# - Output directory: (leave default)
```

### Phase 4: Configure API Environment

```bash
# Add environment variables via CLI
vercel env add DATABASE_URL production
# Paste your Neon/Supabase connection string

vercel env add JWT_SECRET production
# Paste from PRODUCTION_SECRETS.txt

vercel env add REFRESH_TOKEN_SECRET production
# Paste from PRODUCTION_SECRETS.txt

# Redeploy to apply env vars
vercel --prod
```

### Phase 5: Run Migrations

```bash
# SSH into deployment (if needed) or run locally against production DB
DATABASE_URL="your-production-db-url" npm run prisma:migrate:deploy
```

### Phase 6: Deploy Frontend

```bash
cd ../ui

# Deploy
vercel --prod

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://meetlovers-api.vercel.app

# Redeploy
vercel --prod
```

---

## 🔧 Required Files Summary

### `/api/src/serverless.ts` (NEW)
Serverless function adapter for NestJS

### `/api/vercel.json` (NEW)
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

### `/api/package.json` (UPDATE)
```json
{
  "scripts": {
    "vercel-build": "npm run build && npm run prisma:generate"
  },
  "dependencies": {
    "@nestjs/platform-express": "^11.0.1",
    "express": "^4.18.0"
  }
}
```

---

## ⚠️ Limitations of Vercel Serverless

1. **Cold Starts**: First request after inactivity is slower
2. **Execution Time**: Max 10 seconds per request (Pro: 60s)
3. **No WebSockets**: Use Pusher or Socket.io with Redis
4. **No Long-Running Jobs**: Use cron jobs or external workers
5. **Stateless**: No in-memory state between requests

**Verdict**: 
- ✅ Good for APIs with sporadic traffic
- ✅ Perfect for MVPs and prototypes
- ⚠️ May need optimization for high-traffic production
- ❌ Not ideal for real-time features without external services

---

## 🎯 Recommendations

### For Development/Small Projects:
✅ **Use Vercel for both** (serverless)
- Easier deployment
- Free tier adequate
- Single platform management

### For Production/Scale:
✅ **Use Vercel (Frontend) + Railway/Render (Backend)**
- Better performance
- Dedicated backend server
- More control
- Easier debugging
- Better for real-time features

---

## 📊 Cost Comparison

| Platform | Free Tier | Use Case |
|----------|-----------|----------|
| **Vercel (Both)** | 100GB bandwidth, serverless functions | Development, MVP |
| **Vercel + Neon** | 100GB + 3GB DB | Small production |
| **Vercel + Railway** | 100GB + $5 credit | Growing production |
| **Vercel + Render** | 100GB + 750 hours | Stable production |

---

## 🚀 Quick Start: Deploy Both on Vercel Now

```bash
# 1. Create serverless adapter
cd /home/the-macharias/MeatLovers/meetlovers
# (Copy api/src/serverless.ts code from above)

# 2. Create vercel.json files
# (Copy configs from above)

# 3. Install dependencies
cd api && npm install @nestjs/platform-express express

# 4. Deploy API
vercel --prod --cwd api

# 5. Deploy Frontend
vercel --prod --cwd ui

# Done! 🎉
```

**Need help?** Check `FULL_DEPLOYMENT_GUIDE.md` for Railway/Render alternatives.
