# Role Isolation Visual Map
**Meat Lovers CIMS - Shared Module Access Patterns**

**Last Updated:** June 30, 2026

---

## Current Role-Based Access Map

This document shows how each role accesses shared modules through their own dashboard routes.

---

## ✅ COMPLETED MODULES (1/13)

### Production Plans Module ✅

```
┌─────────────────────────────────────────────────────┐
│          PRODUCTION PLANS MODULE                    │
│              (Feature 13)                           │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                                  │
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│   ADMIN ROLE     │            │  MANAGER ROLE    │
└──────────────────┘            └──────────────────┘
        │                                  │
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│  /admin          │            │  /manager        │
│  Dashboard       │            │  Dashboard       │
│                  │            │                  │
│  Quick Access:   │            │  Quick Actions:  │
│  📅 Production   │            │  📅 Production   │
│     Plans        │            │     Plans        │
└──────────────────┘            └──────────────────┘
        │                                  │
        ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│  /admin/         │            │  /manager/       │
│  production-     │            │  production-     │
│  plans           │            │  plans           │
│                  │            │                  │
│  ACCESS:         │            │  ACCESS:         │
│  ✅ View All    │            │  ✅ View All    │
│  ✅ Create      │            │  ❌ Create      │
│  ✅ Update      │            │  ❌ Update      │
│  ✅ Delete      │            │  ❌ Delete      │
└──────────────────┘            └──────────────────┘
        │                                  │
        └────────────────┬─────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │   BACKEND API  │
                │                │
                │  GET /plans    │
                │  POST /plans   │
                │  PATCH /plans  │
                │  DELETE /plans │
                └────────────────┘
```

---

## ⚠️ PENDING MODULES (12/13)

### 1. CMS Module ⚠️

```
Currently: /admin/cms (shared by ADMIN, MANAGER)
         /super-admin/cms (isolated) ✅

Needed:   /manager/cms (view-only) ❌
```

### 2. Products Module ⚠️

```
Currently: /admin/products (shared by ADMIN, MANAGER)

Needed:   /manager/products (view-only) ❌
```

### 3. Pricing Control Module ⚠️

```
Currently: /admin/pricing-control (shared)

Needed:   /super-admin/pricing ❌
          /accountant/pricing ❌
```

### 4. Supplier Management Module ⚠️

```
Currently: /admin/suppliers (shared by ADMIN, MANAGER)
          /staff/suppliers (shared by STOREKEEPER, ACCOUNTANT)

Needed:   /manager/suppliers ❌
          /storekeeper/suppliers ❌
          /accountant/suppliers ❌
```

### 5. Stock Control Module ⚠️

```
Currently: /admin/stock (shared by ADMIN, MANAGER, STOREKEEPER)
          /kitchen/stock ✅ (CHEF isolated)
          /bar/stock ✅ (BARMAN isolated)

Needed:   /manager/stock (view-only) ❌
          /storekeeper/stock (full access) ❌
```

### 6. Order Management Module ⚠️

```
Currently: /admin/orders (shared by ADMIN, MANAGER, CASHIER)
          /pos/orders ✅ (WAITER isolated)

Needed:   /manager/orders (oversight) ❌
          /cashier/orders (settlement focus) ❌
```

### 7. Payment Management Module ⚠️

```
Currently: /admin/payments (shared by ADMIN, MANAGER)

Needed:   /manager/payments (view-only) ❌
```

### 8. Dispatch Operations Module ⚠️

```
Currently: /admin/dispatch (shared)
          /dispatcher ✅ (DISPATCHER isolated)

Needed:   /manager/dispatch (oversight) ❌
```

### 9. Kitchen Oversight Module ⚠️

```
Currently: /admin/kitchen (shared by ADMIN, MANAGER)
          /kitchen ✅ (CHEF isolated)
          /kitchen/queue ✅ (CHEF isolated)

Needed:   /manager/kitchen (oversight) ❌
```

### 10. Bar Oversight Module ⚠️

```
Currently: /admin/bar (shared by ADMIN, MANAGER, STOREKEEPER)
          /bar ✅ (BARMAN isolated)

Needed:   /manager/bar (oversight) ❌
          /storekeeper/bar (stock focus) ❌
```

### 11. Waste Management Module ⚠️

```
Currently: /admin/waste (shared by ADMIN, MANAGER)

Needed:   /manager/waste (review) ❌
```

### 12. Delivery Tracking Module ⚠️

```
Currently: /admin/delivery-tracking (shared by ADMIN, MANAGER)

Needed:   /manager/delivery-tracking (oversight) ❌
```

---

## Dashboard Navigation Summary

### SUPER_ADMIN Dashboard (`/super-admin`)
```
Links to:
  ✅ /super-admin/cms
  ❌ /super-admin/pricing (missing)
  ❌ /super-admin/stock (missing)
  ❌ /super-admin/orders (missing)
  ❌ /super-admin/finance (missing)
```

### ADMIN Dashboard (`/admin`)
```
Links to:
  ⚠️ /admin/cms (needs isolation from MANAGER)
  ⚠️ /admin/products (needs isolation)
  ⚠️ /admin/pricing-control (needs isolation)
  ⚠️ /admin/suppliers (needs isolation)
  ⚠️ /admin/stock (needs isolation)
  ⚠️ /admin/production-plans (isolated) ✅
  ⚠️ /admin/payments (needs isolation)
  ⚠️ /admin/dispatch (needs isolation)
  ⚠️ /admin/delivery-tracking (needs isolation)
  ⚠️ /admin/waste (needs isolation)
  ⚠️ /admin/kitchen (needs isolation)
  ⚠️ /admin/bar (needs isolation)
  /admin/orders
  /admin/reports
  /admin/users
```

### MANAGER Dashboard (`/manager`)
```
Links to:
  ⚠️ /admin/orders (should be /manager/orders) ❌
  ⚠️ /admin/stock (should be /manager/stock) ❌
  ⚠️ /admin/products (should be /manager/products) ❌
  ⚠️ /admin/suppliers (should be /manager/suppliers) ❌
  ⚠️ /admin/pricing-control (should be /manager/pricing) ❌
  ⚠️ /admin/waste (should be /manager/waste) ❌
  ⚠️ /admin/delivery-tracking (should be /manager/delivery-tracking) ❌
  ⚠️ /admin/cms (should be /manager/cms) ❌
  ⚠️ /admin/kitchen (should be /manager/kitchen) ❌
  ⚠️ /admin/bar (should be /manager/bar) ❌
  ✅ /manager/production-plans (isolated) ✅
  /admin/reports
  /admin/staff
```

### CASHIER Dashboard (`/cashier`)
```
Links to:
  ⚠️ /admin/orders (should be /cashier/orders) ❌
```

### STOREKEEPER Dashboard (`/storekeeper`)
```
Links to:
  ⚠️ /admin/stock (should be /storekeeper/stock) ❌
  ⚠️ /staff/suppliers (should be /storekeeper/suppliers) ❌
  ⚠️ /admin/bar (should be /storekeeper/bar) ❌
```

### ACCOUNTANT Dashboard (`/accountant`)
```
Links to:
  ⚠️ /admin/pricing-control (should be /accountant/pricing) ❌
  ⚠️ /staff/suppliers (should be /accountant/suppliers) ❌
```

### WAITER Dashboard (`/pos`)
```
Links to:
  ✅ /pos/menu (isolated)
  ✅ /pos/orders (isolated)
```

### CHEF Dashboard (`/kitchen`)
```
Links to:
  ✅ /kitchen/queue (isolated)
  ✅ /kitchen/stock (isolated)
```

### BARMAN Dashboard (`/bar`)
```
Links to:
  ✅ /bar (queue - isolated)
  ✅ /bar/stock (isolated)
```

### DISPATCHER Dashboard (`/dispatcher`)
```
Links to:
  ✅ /dispatcher (isolated)
```

### HR Dashboard (`/hr`)
```
Links to:
  (No shared modules)
```

---

## Access Pattern Comparison

### ❌ WRONG (Current - Shared Routes)

```
ADMIN    ────┐
             │
MANAGER  ────┼──────▶  /admin/stock
             │
STOREKEEPER ─┘

Problem: All three roles share the same route
         Security risk, unclear permissions
         Difficult to audit who did what
```

### ✅ RIGHT (Goal - Role-Specific Routes)

```
ADMIN       ────▶  /admin/stock       (Full CRUD)
                      │
                      ├─────▶ Backend API
                      │
MANAGER     ────▶  /manager/stock     (View-Only)
                      │
                      ├─────▶ Backend API
                      │
STOREKEEPER ────▶  /storekeeper/stock (Full CRUD)
                      │
                      └─────▶ Backend API

Benefits: Clear role separation
          Role-specific UI
          Easy to audit
          Better security
```

---

## Security Enforcement Layers

### Current Status

```
┌─────────────────────────────────────────────┐
│  LAYER 1: UI Route Display                 │
│  Status: ✅ Partially Implemented          │
│  - Dashboard shows role-specific links     │
│  - Pages render based on route             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  LAYER 2: Route Guards (Middleware)        │
│  Status: ❌ NOT IMPLEMENTED                │
│  - Block wrong roles from accessing routes │
│  - Redirect to unauthorized page           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  LAYER 3: API Authorization                │
│  Status: ❌ NOT IMPLEMENTED                │
│  - Validate JWT role on each request       │
│  - Reject unauthorized operations          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  LAYER 4: Audit Logging                    │
│  Status: ❌ NOT IMPLEMENTED                │
│  - Log all access by role and route        │
│  - Track all mutations                     │
└─────────────────────────────────────────────┘
```

---

## Priority Matrix

### 🔴 CRITICAL (Do Next)
These routes prevent MANAGER from sharing admin access:

1. `/manager/cms`
2. `/manager/products`
3. `/manager/orders`
4. `/manager/stock`
5. `/manager/suppliers`

### 🟠 HIGH (Week 2)
Complete all MANAGER routes:

6. `/manager/payments`
7. `/manager/dispatch`
8. `/manager/kitchen`
9. `/manager/bar`
10. `/manager/waste`
11. `/manager/delivery-tracking`
12. `/manager/finance`

### 🟡 MEDIUM (Week 3-4)
Complete other role-specific routes:

13. `/storekeeper/stock`
14. `/storekeeper/suppliers`
15. `/storekeeper/bar`
16. `/accountant/pricing`
17. `/accountant/suppliers`
18. `/cashier/orders`
19. `/super-admin/pricing`
20. `/super-admin/stock`
21. `/super-admin/orders`
22. `/super-admin/finance`
23. `/super-admin/hrm`

---

## Progress Tracking

```
Modules Status:
  ✅ Fully Isolated: 1/13 (8%)   [Production Plans]
  🟡 Partially Done: 4/13 (31%)  [CMS, Stock, Orders, Bar]
  ❌ Not Started:    8/13 (61%)

Routes Status:
  ✅ Exists:         23/43 (53%)
  ❌ Missing:        20/43 (47%)

Dashboard Status:
  ✅ All Created:    11/11 (100%)
  ⚠️ Links Updated:  3/11 (27%)  [Admin, Manager, SuperAdmin]
  ❌ Needs Update:   8/11 (73%)
```

---

## Template for Next Module

Use this checklist for each module:

```
Module: __________________

☐ 1. Create role-specific page file(s)
☐ 2. Implement view-only version for restricted roles
☐ 3. Add breadcrumb navigation
☐ 4. Update admin dashboard with link
☐ 5. Update manager dashboard with link (if applicable)
☐ 6. Update other role dashboards with links (if applicable)
☐ 7. Test page loads
☐ 8. Test permissions (view vs edit)
☐ 9. Test navigation links
☐ 10. Test breadcrumb navigation
☐ 11. Update shared-modules.md
☐ 12. Create completion report (optional)
```

---

**Last Updated:** June 30, 2026  
**Next Update:** After completing next module  
**Version:** 1.0
