# 🔄 Quick User Switch Guide

## Problem: Keep Getting Redirected to /kitchen?

**You're probably logged in as CHEF or another restricted role!**

---

## ⚡ Quick Fix (30 seconds)

### Option 1: Login as Super Admin (Full Access)

1. **Open DevTools** (Press F12)
2. **Go to Console tab**
3. **Paste this and press Enter:**
   ```javascript
   localStorage.clear(); window.location.href = '/super-admin/login';
   ```
4. **Login with:**
   - Email: `superadmin@meatlovers.com`
   - Password: `SuperAdmin@1234`
5. **Done!** Now you can access ANY dashboard

### Option 2: Logout Button (If Available)

1. Click your profile/name in top right
2. Click **Logout**
3. Choose which user to login as from `LOGIN_CREDENTIALS.md`
4. Login with those credentials

---

## 🎭 Quick Access Links

Copy these links to switch users quickly:

### Super Admin (All Access)
```
http://localhost:3000/super-admin/login
Email: superadmin@meatlovers.com
Password: SuperAdmin@1234
```

### Admin
```
http://localhost:3000/admin/login
Email: admin@test.com
Password: Admin@1234
```

### Manager
```
http://localhost:3000/manager/login
Email: manager@meatlovers.com
Password: Admin@1234
```

### Bar Staff
```
http://localhost:3000/bar/login
Email: barman@meatlovers.com
Password: Barman@1234
```

### Kitchen Staff (Current User?)
```
http://localhost:3000/kitchen/login
Email: chef@meatlovers.com
Password: Chef@1234
```

---

## 🔍 Check Current User

Paste this in browser console (F12 > Console):

```javascript
const user = JSON.parse(localStorage.getItem('user_data'));
console.log('Current User:', user?.full_name);
console.log('Role:', user?.role);
console.log('Email:', user?.email);
```

---

## 🚀 One-Click User Switch

### Method 1: Browser Console (Fastest)

**Switch to Super Admin:**
```javascript
localStorage.clear(); window.location.href = '/super-admin/login';
```

**Switch to Admin:**
```javascript
localStorage.clear(); window.location.href = '/admin/login';
```

**Switch to Bar:**
```javascript
localStorage.clear(); window.location.href = '/bar/login';
```

### Method 2: Manual Clear

1. Press **F12**
2. Go to **Application** tab
3. Click **Local Storage** > `http://localhost:3000`
4. Click **Clear All** button
5. Refresh page (F5)
6. Go to desired login page

---

## 📊 Access Level Comparison

| User | Access Level | Dashboards Available |
|------|--------------|----------------------|
| **Super Admin** | 🌟 FULL | All 10 dashboards |
| **Admin** | 🔑 HIGH | Most dashboards (8-9) |
| **Manager** | 📈 MEDIUM | 4-5 dashboards |
| **Chef** | 🔒 LIMITED | Kitchen only (1) |
| **Barman** | 🔒 LIMITED | Bar only (1) |
| **Others** | 🔒 LIMITED | Their department only |

**Recommendation:** Use Super Admin for testing/development!

---

## 🎯 Best Practice for Testing

### During Development:

1. **Use Super Admin account** for general testing
   - Has access to everything
   - No redirect issues
   - Can test all features

2. **Use specific roles** only when testing role-specific features
   - Test CHEF when testing kitchen features
   - Test BARMAN when testing bar features
   - etc.

3. **Use multiple browser windows/profiles**
   - Normal browser: Super Admin
   - Incognito window: Specific role
   - Different browser: Another role

---

## 🛠️ Developer Tips

### Tip 1: Bookmark Login Pages
Bookmark these for quick access:
- `http://localhost:3000/super-admin/login` (Most Important!)
- `http://localhost:3000/admin/login`
- `http://localhost:3000/manager/login`

### Tip 2: Browser Profiles
Create browser profiles for each role:
- Profile 1: Super Admin
- Profile 2: Manager
- Profile 3: Kitchen Staff
etc.

### Tip 3: Incognito Windows
- Normal window: Your main testing user
- Incognito: Different user for comparison

---

## ❓ FAQ

### Q: Why can't CHEF access /admin?
**A:** Security! Each role only accesses what they need.

### Q: How do I test all features?
**A:** Login as Super Admin - has access to everything.

### Q: Can I have multiple roles at once?
**A:** No, one user = one role. Use different browser windows.

### Q: How do I give CHEF access to /admin?
**A:** You don't. That would be a security issue. Login as Admin instead.

### Q: Will this always redirect me?
**A:** Yes, as long as you're logged in as a restricted role trying to access unauthorized areas.

---

## ✅ Solution Summary

**Problem:** Redirecting to /kitchen when accessing other dashboards

**Cause:** You're logged in as CHEF (or similar restricted role)

**Solution:**
1. Open browser console (F12)
2. Run: `localStorage.clear(); window.location.href = '/super-admin/login';`
3. Login as: `superadmin@meatlovers.com` / `SuperAdmin@1234`
4. Now you can access all dashboards!

**Prevention:** Always use Super Admin account for general testing/development.

---

**Remember:** This redirect behavior is a **security feature**, not a bug! 🔐
