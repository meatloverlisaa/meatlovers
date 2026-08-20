# 🚀 Meat Lovers API - Available Endpoints

**Base URL**: `https://meatlovers-6seidk48k-meatlovers.vercel.app`

---

## 📋 Quick Reference

### ✅ Working Endpoints (Use These!)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/` | GET | No | API welcome & documentation |
| `/health` | GET | No | Health check |
| `/auth/login` | POST | No | User login |
| `/auth/register` | POST | No | User registration |
| `/products` | GET | Yes | List all products |
| `/orders` | GET | Yes | List all orders |
| `/kitchen` | GET | Yes | Kitchen operations |
| `/stock` | GET | Yes | Stock management |
| `/suppliers` | GET | Yes | Supplier list |
| `/website/menu` | GET | No | Public menu |
| `/recipes` | GET | No | Recipe list |
| `/pos` | GET | Yes | Point of Sale |
| `/monitoring/health` | GET | No | Monitoring health |

---

## ❌ Common Mistakes

### Wrong URLs (Will Show 404):
```
❌ https://meatlovers-6seidk48k-meatlovers.vercel.app/api/...
❌ https://meatlovers-6seidk48k-meatlovers.vercel.app/api/products
❌ https://meatlovers-6seidk48k-meatlovers.vercel.app/api/auth/login
```

### Correct URLs:
```
✅ https://meatlovers-6seidk48k-meatlovers.vercel.app/
✅ https://meatlovers-6seidk48k-meatlovers.vercel.app/products
✅ https://meatlovers-6seidk48k-meatlovers.vercel.app/auth/login
```

**Note:** Your API routes DO NOT have `/api` prefix!

---

## 🔓 Public Endpoints (No Authentication)

### 1. Root / Welcome
```bash
GET /
```
**Example:**
```bash
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/
```
**Response:**
```json
{
  "message": "Welcome to Meat Lovers Restaurant Management API",
  "version": "1.0.0",
  "status": "operational",
  "endpoints": { ... }
}
```

### 2. Health Check
```bash
GET /health
```
**Example:**
```bash
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-20T...",
  "service": "Meat Lovers CIMS API",
  "uptime": 123.45,
  "memory": {
    "used": "50MB",
    "total": "100MB"
  }
}
```

### 3. Login
```bash
POST /auth/login
```
**Example:**
```bash
curl -X POST https://meatlovers-6seidk48k-meatlovers.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 4. Register
```bash
POST /auth/register
```
**Example:**
```bash
curl -X POST https://meatlovers-6seidk48k-meatlovers.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 5. Public Menu
```bash
GET /website/menu
```
**Example:**
```bash
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/website/menu
```

### 6. Recipes
```bash
GET /recipes
```
**Example:**
```bash
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/recipes
```

### 7. Monitoring Health
```bash
GET /monitoring/health
```
**Example:**
```bash
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/monitoring/health
```

---

## 🔒 Protected Endpoints (Requires Authentication)

These endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Admin Dashboard
```bash
GET /admin/dashboard
```

### Staff Dashboard
```bash
GET /staff/dashboard
```

### Products
```bash
GET    /products           # List all products
GET    /products/:id       # Get single product
POST   /products           # Create product
PUT    /products/:id       # Update product
DELETE /products/:id       # Delete product
```

### Orders
```bash
GET    /orders             # List all orders
GET    /orders/:id         # Get single order
POST   /orders             # Create order
PUT    /orders/:id         # Update order
DELETE /orders/:id         # Delete order
```

### Kitchen
```bash
GET  /kitchen/queue        # Kitchen queue
GET  /kitchen/orders       # Kitchen orders
POST /kitchen/complete     # Complete order
```

### Stock
```bash
GET    /stock              # List stock
GET    /stock/:id          # Get stock item
POST   /stock              # Add stock
PUT    /stock/:id          # Update stock
DELETE /stock/:id          # Remove stock
```

### Suppliers
```bash
GET    /suppliers          # List suppliers
GET    /suppliers/:id      # Get supplier
POST   /suppliers          # Create supplier
PUT    /suppliers/:id      # Update supplier
DELETE /suppliers/:id      # Delete supplier
```

### Point of Sale (POS)
```bash
GET  /pos/products         # POS products
POST /pos/orders           # Create POS order
GET  /pos/orders           # POS orders list
```

### Finance Transactions
```bash
GET  /finance-transactions # List transactions
POST /finance-transactions # Create transaction
```

### Payments
```bash
GET  /payments             # List payments
POST /payments             # Process payment
```

### CRM (Customer Relations)
```bash
GET    /crm/customers      # List customers
GET    /crm/customers/:id  # Get customer
POST   /crm/customers      # Create customer
PUT    /crm/customers/:id  # Update customer
DELETE /crm/customers/:id  # Delete customer
```

### Bar
```bash
GET  /bar/inventory        # Bar inventory
POST /bar/sales            # Bar sales
```

### HRM (Human Resources)
```bash
GET    /hrm/employees      # List employees
GET    /hrm/employees/:id  # Get employee
POST   /hrm/employees      # Create employee
PUT    /hrm/employees/:id  # Update employee
DELETE /hrm/employees/:id  # Delete employee
```

### Manager Routes
```bash
GET /manager/dashboard     # Manager dashboard
GET /manager/orders        # View orders
GET /manager/products      # View products
GET /manager/stock         # View stock
GET /manager/suppliers     # View suppliers
```

---

## 🧪 Testing Your API

### Option 1: Using Browser
Just paste these URLs in your browser:
```
https://meatlovers-6seidk48k-meatlovers.vercel.app/
https://meatlovers-6seidk48k-meatlovers.vercel.app/health
https://meatlovers-6seidk48k-meatlovers.vercel.app/website/menu
https://meatlovers-6seidk48k-meatlovers.vercel.app/recipes
```

### Option 2: Using curl
```bash
# Test root
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/

# Test health
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/health

# Test login (POST)
curl -X POST https://meatlovers-6seidk48k-meatlovers.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Option 3: Using Postman
1. Import URL: `https://meatlovers-6seidk48k-meatlovers.vercel.app`
2. Create requests for each endpoint
3. Add Authorization header for protected routes

---

## 🔍 Why You See 404

### Your URL:
```
https://meatlovers-6seidk48k-meatlovers.vercel.app/api/...
```

### The Problem:
- `/api/...` is literally trying to access a path called "..."
- Your API doesn't have an `/api` prefix
- The `...` is not a real endpoint

### The Solution:
Use actual endpoint paths without `/api` prefix:
```
✅ /
✅ /health
✅ /auth/login
✅ /products
✅ /orders
```

---

## 📱 For Your Frontend

When configuring your frontend, use:
```env
NEXT_PUBLIC_API_URL=https://meatlovers-6seidk48k-meatlovers.vercel.app
```

Then in your frontend code:
```javascript
// Correct usage
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);

// NOT this
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`); // ❌
```

---

## ✅ Quick Test Commands

Copy and paste these to test your API:

```bash
# 1. Test root (shows documentation)
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/

# 2. Test health
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/health

# 3. Test public menu
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/website/menu

# 4. Test recipes
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/recipes

# 5. Test monitoring
curl https://meatlovers-6seidk48k-meatlovers.vercel.app/monitoring/health
```

All of these should work! ✅

---

## 🎯 Summary

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `/products` | `/api/products` |
| `/auth/login` | `/api/auth/login` |
| `/orders` | `/api/orders` |
| `/health` | `/api/health` |

**Remember:** No `/api` prefix in your routes!

---

**Your API is working perfectly!** You just need to use the correct endpoint paths without the `/api` prefix. 🚀
