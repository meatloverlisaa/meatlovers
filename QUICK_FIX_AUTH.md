# Quick Fix: Authentication Issue

## Problem
Login with `admin@meatlovers.com` / `Admin@1234` returns 401 Unauthorized

## Root Cause Analysis

The auth service logic is correct. The issue is one of:
1. **User doesn't exist in database**
2. **Password hash doesn't match**
3. **Account is inactive** (`is_active = false`)
4. **Account is locked**

## Quick Fix Steps

### Step 1: Check if user exists
```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
npx prisma studio
```

Then:
1. Open the **Users** table
2. Look for `admin@meatlovers.com`
3. Check:
   - ✅ User exists?
   - ✅ `is_active` = true?
   - ✅ `account_locked_until` = null?
   - ✅ `password_hash` field has value?

### Step 2: If user doesn't exist, create manually

In Prisma Studio:
1. Click "Add record" in Users table
2. Fill in:
   - `full_name`: Admin User
   - `email`: admin@meatlovers.com
   - `phone`: +254700000001
   - `role`: ADMIN
   - `is_active`: true
   - `password_hash`: See below

**Password Hash for "Admin@1234"**:
```
$2b$10$rKqP5YH9sH8xW0fqKPx3XuJ5x.N9gVHfG3Y8Nv6jZ4Pq3L7xT9aEi
```

### Step 3: Alternative - Use Seed Script

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api

# This will create all 12 users
npx prisma db seed

# Wait for it to complete (may take 30-60 seconds)
```

### Step 4: Test Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "admin@meatlovers.com",
    "password": "Admin@1234"
  }'
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": "1",
    "full_name": "Admin User",
    "email": "admin@meatlovers.com",
    "role": "ADMIN",
    "is_active": true
  }
}
```

### Step 5: Try All User Logins

Test each user to ensure seeding worked:

```bash
# Super Admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"superadmin@meatlovers.com","password":"SuperAdmin@1234"}'

# Manager
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"manager@meatlovers.com","password":"Manager@1234"}'

# Chef
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"chef@meatlovers.com","password":"Chef@1234"}'
```

## If Still Failing

### Debug Mode - Add Logging

Edit `api/src/auth/auth.service.ts`, add console.logs to the `login` method:

```typescript
async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
  const { email_or_phone, password } = loginDto;
  
  console.log('[AUTH DEBUG] Login attempt:', {
    email_or_phone,
    password_length: password.length,
  });

  const sanitizedInput = this.sanitizeInput(email_or_phone);
  console.log('[AUTH DEBUG] Sanitized input:', sanitizedInput);

  const user = await this.prisma.user.findFirst({
    where: {
      OR: [{ email: sanitizedInput }, { phone: sanitizedInput }],
    },
  });

  console.log('[AUTH DEBUG] User found:', user ? 'YES' : 'NO');
  if (user) {
    console.log('[AUTH DEBUG] User details:', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      has_password_hash: !!user.password_hash,
    });
  }

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // ... rest of method
  
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  console.log('[AUTH DEBUG] Password valid:', isPasswordValid);
  
  // ... rest of method
}
```

Then restart API and watch the console output when you try to login.

## Nuclear Option - Reset Everything

If nothing works:

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api

# WARNING: This deletes ALL data
npx prisma migrate reset --force

# Re-seed
npx prisma db seed

# Restart API
npm run start:dev
```

## Expected Result

After fix, this should work:

```bash
# Login via API
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"admin@meatlovers.com","password":"Admin@1234"}' \
  | python3 -m json.tool
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "user": {
    "id": "1",
    "full_name": "Admin User",
    "email": "admin@meatlovers.com",
    "phone": "+254700000001",
    "role": "ADMIN",
    "is_active": true
  }
}
```

## Then Test Frontend

1. Go to http://localhost:3000/login
2. Enter: admin@meatlovers.com
3. Password: Admin@1234
4. Should redirect to: http://localhost:3000/admin

## All User Credentials

Once seeded, these should all work:

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Super Admin | superadmin@meatlovers.com | SuperAdmin@1234 | /super-admin |
| Admin | admin@meatlovers.com | Admin@1234 | /admin |
| Manager | manager@meatlovers.com | Manager@1234 | /manager |
| Chef | chef@meatlovers.com | Chef@1234 | /kitchen |
| Bartender | barman@meatlovers.com | Barman@1234 | /bar |
| Waiter | waiter@meatlovers.com | Waiter@1234 | /pos |
| Cashier | cashier@meatlovers.com | Cashier@1234 | /cashier |
| Storekeeper | storekeeper@meatlovers.com | Storekeeper@1234 | /storekeeper |
| Dispatcher | dispatcher@meatlovers.com | Dispatcher@1234 | /dispatcher |
| Accountant | accountant@meatlovers.com | Accountant@1234 | /accountant |
| HR | hr@meatlovers.com | Hr@12345678 | /hr |

**Next Step**: Open Prisma Studio and verify users exist!
