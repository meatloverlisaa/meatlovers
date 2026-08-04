# 🔐 Meat Lovers System - User Passwords

**Last Updated:** August 3, 2026  
**Purpose:** Complete list of all user credentials in the Meat Lovers CIMS system

---

## 📋 All User Credentials

| # | Role | Email | Phone | Password | Login Portal |
|---|------|-------|-------|----------|--------------|
| 1 | SUPER_ADMIN | superadmin@meatlovers.com | +254799999999 | SuperAdmin@1234 | /admin/login |
| 2 | ADMIN | admin@test.com | +254700000000 | Admin@1234 | /admin/login |
| 3 | MANAGER | manager@meatlovers.com | +254788888888 | Admin@1234 | /staff/login |
| 4 | CASHIER | cashier@meatlovers.com | +254766666666 | Cashier@1234 | /cashier/login |
| 5 | WAITER | waiter@meatlovers.com | +254755555555 | Waiter@1234 | /pos/login |
| 6 | CHEF | chef@meatlovers.com | +254744444444 | Chef@1234 | /kitchen/login |
| 7 | STOREKEEPER | storekeeper@meatlovers.com | +254733333333 | Storekeeper@1234 | /staff/login |
| 8 | BARMAN | barman@meatlovers.com | +254722222222 | Barman@1234 | /bar/login |
| 9 | DISPATCHER | dispatcher@meatlovers.com | +254711111111 | Dispatcher@1234 | /staff/login |
| 10 | ACCOUNTANT | accountant@meatlovers.com | N/A | Admin@1234 | /staff/login |
| 11 | HR | hr@meatlovers.com | +254799000000 | Hr@12345678 | /staff/login |
| 12 | MANAGER | kevin254@gmail.com | 017862861 | Admin@1234 | /staff/login |

---

## 🔑 Quick Reference

### Admin Portal (/admin/login)
- **SUPER_ADMIN**: superadmin@meatlovers.com | SuperAdmin@1234 (or use passwordless login)
- **ADMIN**: admin@test.com | Admin@1234

### Staff Portal (/staff/login)
- **MANAGER**: manager@meatlovers.com | Admin@1234
- **MANAGER**: kevin254@gmail.com | Admin@1234
- **STOREKEEPER**: storekeeper@meatlovers.com | Storekeeper@1234
- **DISPATCHER**: dispatcher@meatlovers.com | Dispatcher@1234
- **ACCOUNTANT**: accountant@meatlovers.com | Admin@1234
- **HR**: hr@meatlovers.com | Hr@12345678

### POS Portal (/pos/login)
- **WAITER**: waiter@meatlovers.com | Waiter@1234

### Kitchen Portal (/kitchen/login)
- **CHEF**: chef@meatlovers.com | Chef@1234

### Bar Portal (/bar/login)
- **BARMAN**: barman@meatlovers.com | Barman@1234

### Cashier Portal (/cashier/login)
- **CASHIER**: cashier@meatlovers.com | Cashier@1234

---

## ⚠️ Security Notes

1. **Default Passwords**: All users have default passwords as shown above
2. **Password Requirements**: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character
3. **Super Admin Passwordless Login**: Super admin can login without entering password (special feature)
4. **Password Hashing**: All passwords are hashed using bcrypt with 12 rounds
5. **Account Lockout**: 5 failed login attempts locks account for 30 minutes

---

## 🔄 Password Reset

If you need to reset any user's password, run the appropriate script:

```bash
# Reset specific user
cd api
npm run script:create-superadmin
npm run script:create-admin
npm run script:create-manager-user
npm run script:create-accountant-user
# ... etc

# Reset all users at once
npm run script:seed-all-users
```

---

## 📝 Notes

- The SUPER_ADMIN has a special passwordless login feature for quick access
- All passwords can be changed by running the respective user creation scripts
- The `seed-all-users.ts` script will update all users to the passwords listed above
- Phone numbers can also be used for login in place of email

---

**Generated:** August 3, 2026  
**System:** Meat Lovers CIMS  
**Total Users:** 11
