# Database Errors Report

**Date:** August 7, 2026  
**Report ID:** DB-ERROR-001  
**System:** Meat Lovers CIMS  
**Database:** PostgreSQL (Neon)  
**Status:** 🟡 **2 Critical Issues Found**

---

## Executive Summary

A comprehensive database diagnostic has been completed on the Meat Lovers CIMS system. The database connection is healthy and most tables are functioning correctly. However, **2 critical data integrity issues** have been identified that require immediate attention:

1. **10 staff users missing employee profiles** (Data Integrity Issue)
2. **8 expired refresh tokens not properly revoked** (Security & Cleanup Issue)

Additionally, 1 configuration mismatch was detected in the migration system.

---

## ✅ Database Health Check - PASSED

### Connection Status
- ✅ **Database Connection:** Successful
- ✅ **Prisma Client:** Generated successfully (v5.22.0)
- ✅ **Schema Validation:** Valid
- ✅ **Database Sync:** Schema in sync with database

### Database Configuration
- **Provider:** PostgreSQL
- **Host:** ep-little-dust-axitggkv-pooler.c-4.us-east-2.aws.neon.tech
- **Database:** neondb
- **Connection:** SSL enabled with channel binding

### Table Counts
| Table | Record Count | Status |
|-------|--------------|--------|
| Users | 13 | ✅ OK |
| Products | 7 | ✅ OK |
| Orders | 0 | ✅ OK (New system) |
| Stock Items | 42 | ✅ OK |

### Data Integrity Checks - PASSED ✅
1. ✅ **Orphaned OrderItems:** 0 records
2. ✅ **Invalid StockMovements:** 0 records
3. ✅ **Products without Stock:** 0 active products missing stock
4. ✅ **Duplicate Stock Items:** 0 duplicates found
5. ✅ **Order Query Performance:** Working correctly

---

## 🔴 Critical Issue #1: Missing Employee Profiles

### Problem Description
**10 staff users** (excluding SUPER_ADMIN and ADMIN roles) do not have associated `employee_profile` records. This violates the data model's integrity requirements and will cause issues when:
- Viewing staff details in HR module
- Processing payroll
- Managing attendance and schedules
- Generating performance reviews
- Managing leave requests

### Severity: 🔴 **HIGH**
- **Impact:** HR module functionality degraded
- **Risk:** Data inconsistency, potential application crashes
- **Urgency:** Should be fixed before HR module usage

### Affected Users

| ID | Role | Name | Email | Phone | Active | Created |
|----|------|------|-------|-------|--------|---------|
| 4 | MANAGER | Kevin Macharia | kevin254@gmail.com | +254700000002 | ✅ Yes | 2026-08-06 |
| 7 | ACCOUNTANT | Accountant | accountant@meatlovers.com | +254700000005 | ✅ Yes | 2026-08-06 |
| 8 | HR | HR Manager | hr@meatlovers.com | +254700000006 | ✅ Yes | 2026-08-06 |
| 9 | WAITER | Waiter | waiter@meatlovers.com | +254700000007 | ✅ Yes | 2026-08-06 |
| 6 | DISPATCHER | Dispatcher | dispatcher@meatlovers.com | +254700000004 | ✅ Yes | 2026-08-06 |
| 12 | CASHIER | Cashier | cashier@meatlovers.com | +254700000010 | ✅ Yes | 2026-08-06 |
| 5 | STOREKEEPER | Store Keeper | storekeeper@meatlovers.com | +254700000003 | ✅ Yes | 2026-08-06 |
| 10 | CHEF | Head Chef | chef@meatlovers.com | +254700000008 | ✅ Yes | 2026-08-06 |
| 11 | BARMAN | Barman | barman@meatlovers.com | +254700000009 | ✅ Yes | 2026-08-06 |
| 3 | MANAGER | Restaurant Manager | manager@meatlovers.com | +254788888888 | ✅ Yes | 2026-08-06 |

### Root Cause
Users were created during initial system setup/seeding but the corresponding `employee_profile` records were not created. The `employee_profiles` table has a 1:1 relationship with `users` via `user_id` foreign key.

### Required Fields in EmployeeProfile
According to the schema, the following fields are required:
- `user_id` (BigInt, unique)
- `employment_start_date` (DateTime, required)
- Additional optional fields for complete profile

### Recommended Fix

**Option 1: Create Basic Employee Profiles (Recommended)**
```sql
-- Create minimal employee profiles for all staff without profiles
INSERT INTO employee_profiles (
  user_id,
  employment_start_date,
  employment_type,
  employment_status,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  u.created_at::date as employment_start_date,
  'PERMANENT' as employment_type,
  'ACTIVE' as employment_status,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
LEFT JOIN employee_profiles ep ON u.user_id = ep.user_id
WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
  AND ep.id IS NULL;
```

**Option 2: Update Seed Script**
Update `/api/prisma/seed.ts` to ensure all non-admin users get employee profiles.

**Priority:** 🔴 **HIGH** - Fix before HR module goes live  
**Estimated Fix Time:** 15 minutes

---

## 🟡 Critical Issue #2: Expired Refresh Tokens Not Revoked

### Problem Description
**8 refresh tokens** have expired but have not been marked as revoked (`is_revoked = false`). This is a security and database cleanup issue. Expired tokens should be automatically revoked to:
- Prevent potential security vulnerabilities
- Keep the database clean
- Maintain accurate audit trails

### Severity: 🟡 **MEDIUM**
- **Impact:** Database bloat, potential security risk
- **Risk:** Minor (tokens are expired so cannot be used)
- **Urgency:** Should be addressed soon

### Affected Tokens

| Token ID | User | Role | Expired | Days Expired | IP Address |
|----------|------|------|---------|--------------|------------|
| 32 | Admin User | ADMIN | 2026-08-06 14:01 | <1 day | ::1 (localhost) |
| 29 | Admin User | ADMIN | 2026-08-06 14:00 | <1 day | ::1 (localhost) |
| 26 | Admin User | ADMIN | 2026-08-06 13:59 | <1 day | ::1 (localhost) |
| 25 | Admin User | ADMIN | 2026-08-06 13:59 | <1 day | ::1 (localhost) |
| 24 | System Admin | ADMIN | 2026-08-06 13:58 | <1 day | ::1 (localhost) |
| 19 | Super Administrator | SUPER_ADMIN | 2026-08-06 13:26 | <1 day | ::1 (localhost) |
| 12 | Super Administrator | SUPER_ADMIN | 2026-08-06 12:34 | <1 day | ::1 (localhost) |
| 1 | System Admin | ADMIN | 2026-08-06 12:16 | <1 day | ::1 (localhost) |

### Root Cause
The system's token cleanup mechanism is not automatically revoking expired tokens. This suggests:
1. No automated cleanup job/cron is running
2. The logout/token refresh logic may not be revoking old tokens
3. Token expiration is very short (minutes), causing rapid accumulation

### Recommended Fix

**Option 1: Manual Cleanup (Immediate)**
```sql
-- Revoke all expired tokens
UPDATE refresh_tokens
SET is_revoked = true,
    revoked_at = NOW()
WHERE expires_at < NOW()
  AND is_revoked = false;
```

**Option 2: Automated Cleanup (Long-term)**
Create a scheduled task/cron job to clean up expired tokens:

```typescript
// In a service or scheduled task
async cleanupExpiredTokens() {
  await prisma.refreshToken.updateMany({
    where: {
      expires_at: { lt: new Date() },
      is_revoked: false
    },
    data: {
      is_revoked: true,
      revoked_at: new Date()
    }
  });
}
```

**Option 3: Delete Very Old Tokens**
```sql
-- Delete tokens expired for more than 30 days
DELETE FROM refresh_tokens
WHERE expires_at < NOW() - INTERVAL '30 days';
```

**Priority:** 🟡 **MEDIUM** - Implement automated cleanup  
**Estimated Fix Time:** 30 minutes

---

## ⚠️ Configuration Issue: Migration Lock Provider Mismatch

### Problem Description
The `migration_lock.toml` file specifies `provider = "mysql"` but the actual database is PostgreSQL. This causes the `prisma migrate status` command to fail with error **P3019**.

### Severity: 🟢 **LOW**
- **Impact:** Cannot use `prisma migrate` commands
- **Risk:** Low (db push works fine)
- **Urgency:** Fix when convenient

### Error Message
```
Error: P3019
The datasource provider `postgresql` specified in your schema does not 
match the one specified in the migration_lock.toml, `mysql`.
```

### Location
`/api/prisma/migrations/migration_lock.toml`

### Current Content
```toml
# Please do not edit this file manually
provider = "mysql"
```

### Root Cause
The project was likely migrated from MySQL to PostgreSQL, but the migration lock file was not updated.

### Recommended Fix

**Option 1: Fix Migration Lock (Simple)**
```toml
# /api/prisma/migrations/migration_lock.toml
provider = "postgresql"
```

**Option 2: Reset Migrations (Clean Slate)**
If migrations are causing issues:
1. Backup current database
2. Delete `/api/prisma/migrations/` folder
3. Run `npx prisma migrate dev --name init`

**Priority:** 🟢 **LOW** - Optional fix  
**Estimated Fix Time:** 2 minutes

---

## 📋 Summary of Findings

### Critical Issues
| # | Issue | Severity | Impact | Records Affected | Status |
|---|-------|----------|--------|------------------|--------|
| 1 | Missing Employee Profiles | 🔴 HIGH | HR module degraded | 10 users | ❌ Not Fixed |
| 2 | Expired Tokens Not Revoked | 🟡 MEDIUM | DB cleanup needed | 8 tokens | ❌ Not Fixed |
| 3 | Migration Lock Mismatch | 🟢 LOW | Migrate command fails | Config only | ❌ Not Fixed |

### Database Statistics
- **Total Tables:** 40+ (all schema tables created)
- **Total Users:** 13
- **Total Products:** 7
- **Total Stock Items:** 42
- **Total Orders:** 0 (new system)
- **Active Refresh Tokens:** ~24 (8 expired)

---

## 🔧 Recommended Fix Order

### Phase 1: Immediate Fixes (30 minutes)
1. **Create Employee Profiles** (15 min)
   - Run SQL script to create basic profiles for 10 users
   - Verify HR module can now access staff data
   
2. **Clean Up Expired Tokens** (10 min)
   - Run SQL to revoke 8 expired tokens
   - Verify cleanup worked
   
3. **Fix Migration Lock** (5 min)
   - Update `migration_lock.toml` to use `postgresql`
   - Test `prisma migrate status`

### Phase 2: Long-term Solutions (1 hour)
1. **Implement Token Cleanup Cron** (30 min)
   - Create scheduled task to auto-revoke expired tokens
   - Run daily at off-peak hours
   
2. **Update Seed Script** (15 min)
   - Ensure all future users get employee profiles
   - Add validation checks
   
3. **Add Database Monitoring** (15 min)
   - Set up alerts for data integrity issues
   - Monitor orphaned records

---

## 🧪 Verification Steps

After applying fixes, run these checks:

### 1. Verify Employee Profiles Created
```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count({
  where: {
    role: { notIn: ['SUPER_ADMIN', 'ADMIN'] },
    employee_profile: null
  }
}).then(count => {
  console.log('Users without profiles:', count);
  console.log(count === 0 ? '✅ FIXED' : '❌ STILL HAS ISSUES');
  prisma.\$disconnect();
});
"
```

### 2. Verify Tokens Revoked
```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.refreshToken.count({
  where: {
    expires_at: { lt: new Date() },
    is_revoked: false
  }
}).then(count => {
  console.log('Expired tokens not revoked:', count);
  console.log(count === 0 ? '✅ FIXED' : '❌ STILL HAS ISSUES');
  prisma.\$disconnect();
});
"
```

### 3. Verify Migration Lock
```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
npx prisma migrate status
# Should not show P3019 error
```

---

## 📊 Database Performance Notes

### Positive Indicators
- ✅ All foreign key relationships intact
- ✅ No orphaned records in order/stock systems
- ✅ No duplicate stock items
- ✅ Indexes properly created on frequently queried fields
- ✅ Query performance is good

### Areas for Monitoring
- ⚠️ Refresh token table will grow over time (needs periodic cleanup)
- ⚠️ Employee profiles should be created automatically for new staff
- ⚠️ Consider adding cascading deletes where appropriate

---

## 📝 SQL Fix Scripts

### Script 1: Create Missing Employee Profiles
```sql
-- File: fix_missing_employee_profiles.sql
-- Description: Creates basic employee profiles for staff users

BEGIN;

-- Create employee profiles for users without them
INSERT INTO employee_profiles (
  user_id,
  employment_start_date,
  employment_type,
  employment_status,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  u.created_at::date as employment_start_date,
  'PERMANENT'::employment_type as employment_type,
  'ACTIVE'::employment_status as employment_status,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
  AND ep.id IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as users_without_profiles
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
  AND ep.id IS NULL;

COMMIT;
```

### Script 2: Clean Up Expired Tokens
```sql
-- File: cleanup_expired_tokens.sql
-- Description: Revokes all expired refresh tokens

BEGIN;

-- Update expired tokens to revoked
UPDATE refresh_tokens
SET 
  is_revoked = true,
  revoked_at = NOW()
WHERE expires_at < NOW()
  AND is_revoked = false;

-- Show summary
SELECT 
  COUNT(*) as total_tokens,
  SUM(CASE WHEN is_revoked THEN 1 ELSE 0 END) as revoked_tokens,
  SUM(CASE WHEN expires_at < NOW() AND NOT is_revoked THEN 1 ELSE 0 END) as expired_not_revoked
FROM refresh_tokens;

COMMIT;
```

### Script 3: Fix Migration Lock
```bash
# File: fix_migration_lock.sh
# Description: Updates migration lock to PostgreSQL

cd /home/the-macharias/MeatLovers/meetlovers/api
cat > prisma/migrations/migration_lock.toml << 'EOF'
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
EOF

echo "✅ Migration lock file updated to PostgreSQL"
npx prisma migrate status
```

---

## 🎯 Success Criteria

After all fixes are applied:

- [ ] ✅ All 10 users have employee profiles
- [ ] ✅ All 8 expired tokens are revoked
- [ ] ✅ Migration lock shows `postgresql` provider
- [ ] ✅ `prisma migrate status` runs without P3019 error
- [ ] ✅ HR module can display all staff profiles
- [ ] ✅ No data integrity errors in database check
- [ ] ✅ Automated token cleanup job scheduled

---

## 📚 Related Documentation

- **Prisma Schema:** `/api/prisma/schema.prisma`
- **Database Seeding:** `/api/prisma/seed.ts`
- **Authentication Module:** `/api/src/auth/`
- **Employee Profile Service:** `/api/src/*/employee-profile.service.ts`

---

## 🔗 Quick Links

### Running Database Checks
```bash
# Full database integrity check
cd /home/the-macharias/MeatLovers/meetlovers/api
node check_database_integrity.js  # (Create this script from diagnostic code)

# Prisma validation
npx prisma validate

# Database connection test
npx prisma db push --skip-generate
```

### Applying Fixes
```bash
# Method 1: Using Prisma Client
node fix_employee_profiles.js
node cleanup_tokens.js

# Method 2: Using SQL directly
npx prisma db execute --file fix_missing_employee_profiles.sql
npx prisma db execute --file cleanup_expired_tokens.sql
```

---

**Report Generated:** August 7, 2026  
**Report Status:** 📋 **READY FOR EXECUTION**  
**Total Issues Found:** 3 (1 High, 1 Medium, 1 Low)  
**Estimated Total Fix Time:** 1.5 hours  
**Next Steps:** Apply Phase 1 fixes immediately

