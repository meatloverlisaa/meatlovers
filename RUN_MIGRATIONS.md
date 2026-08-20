# 🔧 Run Database Migrations on Production

## Problem

Your API is getting this error:
```
The table `public.leave_requests` does not exist in the current database.
```

This means the database tables haven't been created yet.

---

## ✅ Solution: Run Migrations

### Prerequisites

1. **Have a production database** (Neon, Supabase, or other PostgreSQL)
2. **Know your DATABASE_URL**
3. **Have Node.js and npm installed**

---

## Method 1: Using Your Production Database URL Directly

### Step 1: Get Your Database URL

From one of these sources:
- **Neon**: Dashboard → Connection String → Copy
- **Supabase**: Settings → Database → Connection String → URI
- **Vercel**: Settings → Environment Variables → DATABASE_URL

Example format:
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Step 2: Run Migrations

```bash
# Navigate to API folder
cd /home/the-macharias/MeatLovers/meetlovers/api

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Run migrations
npm run prisma:migrate:deploy
```

### Step 3: Verify

You should see output like:
```
✔ Generated Prisma Client
✔ Applied migration: 20260626000000_dashboard_indexes
✔ Applied migration: 20260819000000_postgresql_baseline
Database migrations completed successfully!
```

---

## Method 2: Using Prisma db push (Simpler)

If migrations fail, you can push the schema directly:

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api

# Set DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Push schema to database
npx prisma db push

# This will:
# - Create all tables
# - Create all columns
# - Create all indexes
# - But won't create migration history
```

---

## Method 3: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to API folder
cd /home/the-macharias/MeatLovers/meetlovers/api

# Link to your Vercel project (one-time setup)
vercel link

# Pull production environment variables
vercel env pull .env.production

# Now DATABASE_URL is in .env.production
# Run migrations using it
npm run prisma:migrate:deploy
```

---

## Method 4: Create Migration Script

Create a file `scripts/migrate.sh`:

```bash
#!/bin/bash

# Get DATABASE_URL from Vercel or user input
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    echo "Usage: DATABASE_URL='postgresql://...' ./scripts/migrate.sh"
    exit 1
fi

echo "Running migrations on database..."
cd "$(dirname "$0")/.."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
```

Make it executable and run:
```bash
chmod +x scripts/migrate.sh
DATABASE_URL="your-url" ./scripts/migrate.sh
```

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Problem**: Database is not accessible

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify SSL mode: add `?sslmode=require` at the end
3. Check database is online (Neon/Supabase dashboard)
4. Verify firewall/IP allowlist (should allow 0.0.0.0/0 for Vercel)

### Error: "Authentication failed"

**Problem**: Wrong credentials

**Solutions**:
1. Copy DATABASE_URL again from your database provider
2. Check for special characters in password (may need URL encoding)
3. Verify database user has proper permissions

### Error: "Migration failed"

**Problem**: SQL errors in migrations

**Solutions**:
1. Check migration files in `prisma/migrations/`
2. Try `npx prisma db push` instead (skips migration history)
3. Manually fix SQL if needed

### Error: "P1001: Can't reach database server"

**Problem**: Connection timeout

**Solutions**:
1. Add `?connect_timeout=60` to DATABASE_URL
2. Check database region (should be close to your location)
3. Try from different network

---

## 🎯 Quick Command Reference

```bash
# Check if database is accessible
npx prisma db execute --stdin <<< "SELECT 1;"

# View current schema
npx prisma db pull

# Reset database (DANGER: Deletes all data!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name add_new_feature

# Deploy migrations
npx prisma migrate deploy

# Push schema without migrations
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

---

## ✅ After Running Migrations

### Test Your API:

```bash
# Should work now!
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/hrm/leave/summary
```

### Expected Response:
```json
{
  "totalRequests": 0,
  "pending": 0,
  "approved": 0,
  "rejected": 0
}
```

Or something similar (not a 500 error!)

---

## 🔐 Security Note

**Never commit your DATABASE_URL to Git!**

- ✅ Use environment variables
- ✅ Add `.env*` to `.gitignore`
- ✅ Use Vercel environment variables for production
- ❌ Don't put DATABASE_URL in source code

---

## 📋 Checklist

After running migrations, verify:

- [ ] Migrations completed without errors
- [ ] API endpoint `/hrm/leave/summary` works
- [ ] No more "table does not exist" errors
- [ ] Other endpoints work (try `/products`, `/orders`, etc.)
- [ ] Prisma Studio can connect (optional check)

---

## 🎉 Success!

Once migrations are complete:
- ✅ All database tables created
- ✅ API can query data
- ✅ No more 500 errors
- ✅ Ready for production use

---

**Run the migrations now and your API will work perfectly!** 🚀
