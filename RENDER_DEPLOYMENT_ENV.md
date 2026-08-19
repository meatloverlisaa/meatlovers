# Render Deployment Environment Variables

Copy these environment variables to your Render.com dashboard for the API service:

## Required Environment Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_VR8T4DJPMyOq@ep-little-dust-axitggkv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=MeatLoversCIMS2026SecureProductionKey!@#
NODE_ENV=production
PORT=3001
```

## Optional Environment Variables

```
ALLOWED_ORIGINS=https://your-render-app-url.onrender.com,https://your-domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@meatlovers.com
SMTP_PASS=your-app-specific-password
FRONTEND_URL=https://your-frontend-domain.com
```

## Important Notes

1. **DATABASE_URL**: Already configured for your Neon PostgreSQL database
2. **JWT_SECRET**: Generated 32+ character secure key for production
3. **PORT**: Set to 3001 (standard for this application)
4. **NODE_ENV**: Set to production for optimal performance
5. **ALLOWED_ORIGINS**: Update with your actual Render URL and frontend domain after deployment

## Deployment Steps

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm run start:prod`
5. Add the environment variables above
6. Deploy

## Post-Deployment

After deployment, you'll need to:
1. Run database migrations: Render will auto-run `npx prisma migrate deploy` if you add it to your build script
2. Seed the database with initial users (optional)
3. Update ALLOWED_ORIGINS with your actual Render URL
