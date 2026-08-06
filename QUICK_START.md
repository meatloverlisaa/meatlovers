# 🚀 Meat Lovers CIMS - Quick Start Guide

## System Status: ✅ READY TO USE

### 🌐 URLs
- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Health:** http://localhost:3001/health

---

## 🔐 Quick Login (Most Common)

### Admin Account
```
URL: http://localhost:3000/admin/login
Email: admin@test.com
Password: Admin@1234
```

### Manager Account
```
URL: http://localhost:3000/manager/login
Email: manager@meatlovers.com
Password: Admin@1234
```

### Storekeeper Account
```
URL: http://localhost:3000/storekeeper/login
Email: storekeeper@meatlovers.com
Password: Storekeeper@1234
```

📖 **See `LOGIN_CREDENTIALS.md` for all 12 user accounts**

---

## ⚡ Start/Stop Commands

### Start API Server
```bash
cd ~/MeatLovers/meetlovers/api
npm start
```

### Start Frontend
```bash
cd ~/MeatLovers/meetlovers/ui
npm run dev
```

### Stop Servers
```bash
# Press Ctrl+C in each terminal
```

---

## 🔍 Quick Checks

### Is API Running?
```bash
curl http://localhost:3001/health
```
✅ Should return: `{"status":"ok",...}`

### Is Frontend Running?
```bash
curl -I http://localhost:3000
```
✅ Should return: `HTTP/1.1 200 OK`

### Test Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"admin@test.com","password":"Admin@1234"}'
```
✅ Should return access_token and user data

---

## 🐛 Seeing 401 Errors?

### Quick Fix:
1. **Clear browser cache** (F12 > Application > Local Storage > Clear)
2. **Go to login page** (e.g., `/admin/login`)
3. **Login again**
4. **Check localStorage** has `auth_token`

### Still Having Issues?
📖 See `FIX_401_ERRORS_GUIDE.md` for detailed troubleshooting

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `LOGIN_CREDENTIALS.md` | All user accounts and passwords |
| `FIX_401_ERRORS_GUIDE.md` | Detailed troubleshooting guide |
| `AUTHENTICATION_FIX_SUMMARY.md` | What was fixed and current status |
| `QUICK_START.md` | This file - quick reference |

---

## 🎯 Common Tasks

### Reseed Database
```bash
cd ~/MeatLovers/meetlovers/api
npx prisma db seed
```

### Regenerate Prisma Client
```bash
cd ~/MeatLovers/meetlovers/api
npx prisma generate
```

### View Database
```bash
cd ~/MeatLovers/meetlovers/api
npx prisma studio
# Opens at http://localhost:5555
```

### Rebuild Frontend
```bash
cd ~/MeatLovers/meetlovers/ui
npm run build
```

---

## 🏗️ Architecture

```
Frontend (Next.js)     →  API (NestJS)      →  Database (PostgreSQL/Neon)
http://localhost:3000     http://localhost:3001  Cloud-hosted
```

### Authentication Flow:
1. User logs in via frontend
2. Frontend sends credentials to `/auth/login`
3. API validates and returns JWT token
4. Frontend stores token in localStorage
5. All subsequent requests include token in Authorization header
6. API validates token and allows/denies access

---

## 🎭 User Roles

| Role | Login URL | Example Email |
|------|-----------|---------------|
| Super Admin | `/super-admin/login` | superadmin@meatlovers.com |
| Admin | `/admin/login` | admin@test.com |
| Manager | `/manager/login` | manager@meatlovers.com |
| Storekeeper | `/storekeeper/login` | storekeeper@meatlovers.com |
| Accountant | `/accountant/login` | accountant@meatlovers.com |
| HR | `/hr/login` | hr@meatlovers.com |
| Waiter | `/pos/login` | waiter@meatlovers.com |
| Chef | `/kitchen/login` | chef@meatlovers.com |
| Barman | `/bar/login` | barman@meatlovers.com |
| Cashier | `/cashier/login` | cashier@meatlovers.com |

---

## ⚙️ Environment Variables

### API (`.env`)
```bash
DATABASE_URL="postgresql://..."
PORT=3001
JWT_SECRET="..."
NODE_ENV="development"
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="Meat Lovers CIMS"
```

---

## 🆘 Emergency Reset

If everything is broken:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Reset API
cd ~/MeatLovers/meetlovers/api
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
npm start

# 3. Reset Frontend (new terminal)
cd ~/MeatLovers/meetlovers/ui
rm -rf .next
npm run dev

# 4. Clear browser cache
# F12 > Application > Local Storage > Clear All > Refresh

# 5. Login again
```

---

## ✅ Success Checklist

- [ ] API health check returns 200 OK
- [ ] Frontend loads at localhost:3000
- [ ] Can access login page
- [ ] Login succeeds and redirects to dashboard
- [ ] Dashboard loads without 401 errors
- [ ] Can navigate between pages
- [ ] Auth token visible in localStorage

---

## 🎉 You're Ready!

The system is fully functional. Just:
1. Open http://localhost:3000
2. Go to your role's login page
3. Login with your credentials
4. Start using the system!

**Need help?** Check the other documentation files listed above.
