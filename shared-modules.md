# Shared Modules Documentation
**Meat Lovers CIMS - Comprehensive Shared Module Audit**

**Generated:** June 30, 2026  
**Purpose:** Document all shared modules across roles with current implementation status and security requirements

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Security Principle](#security-principle)
3. [Module Status Matrix](#module-status-matrix)
4. [Detailed Module Breakdown](#detailed-module-breakdown)
5. [Implementation Status](#implementation-status)
6. [Priority Roadmap](#priority-roadmap)

---

## Overview

Meat Lovers CIMS has **13 functional modules** that are shared between multiple roles. Each role must access these modules through **their own dedicated route** for proper security isolation and audit tracking.

### Key Principle
> **Same functionality, different routes per role**

Example:
- SUPER_ADMIN accesses CMS at `/super-admin/cms`
- ADMIN accesses CMS at `/admin/cms`
- MANAGER accesses CMS at `/manager/cms` (view-only)

---

## Security Principle

### Why Role-Specific Routes?

1. **Security Isolation**
   - Each role's routes protected by role-specific guards
   - No shared route that needs complex role checking
   - Easier to audit and enforce permissions

2. **Audit Trail**
   - Clear tracking of which role performed actions
   - URL-based audit logging
   - Role-based access patterns visible in logs

3. **UI Customization**
   - Each role sees only their allowed actions
   - Role-specific help text and guidance
   - Appropriate navigation breadcrumbs

4. **Maintainability**
   - Clear separation of concerns
   - Easier to modify role permissions
   - No complex conditional rendering logic

---

## Module Status Matrix

### Legend
- ✅ **EXISTS** - Implemented and working
- ❌ **MISSING** - Needs to be created
- ⚠️ **SHARED** - Currently shared, needs splitting

### Quick Summary

| Module | Total Routes Needed | Exists | Missing | Status |
|--------|---------------------|---------|---------|--------|
| CMS | 3 | 2 | 1 | ⚠️ |
| Products | 2 | 1 | 1 | ⚠️ |
| Pricing | 3 | 1 | 2 | ⚠️ |
| Suppliers | 4 | 2 | 2 | ⚠️ |
| Stock | 5 | 3 | 2 | ⚠️ |
| Orders | 4 | 3 | 1 | ⚠️ |
| Payments | 2 | 1 | 1 | ⚠️ |
| Dispatch | 3 | 2 | 1 | ⚠️ |
| **Production Plans** | **2** | **2** | **0** | **✅** |
| Kitchen Oversight | 4 | 2 | 2 | ⚠️ |
| Bar Oversight | 5 | 2 | 3 | ⚠️ |
| Waste | 2 | 1 | 1 | ⚠️ |
| Delivery Tracking | 2 | 1 | 1 | ⚠️ |
| **TOTAL** | **43** | **23** | **20** | **53%** |

### Completion Rate: 53% (23/43 routes implemented) ⬆️ +1

---

## Detailed Module Breakdown

### 1. Website CMS (Content Management System)

**Purpose:** Manage website pages, menu highlights, and customer leads  
**Feature:** Feature 2 - Public Website & Customer Acquisition

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| SUPER_ADMIN | `/super-admin/cms` | ✅ EXISTS | Full | Create, Edit, Delete, Publish |
| ADMIN | `/admin/cms` | ⚠️ SHARED | Full | Create, Edit, Delete, Publish |
| MANAGER | `/manager/cms` | ❌ MISSING | View-Only | View pages, View leads |

#### API Endpoints
```
GET /cms/pages — List all content pages
POST /cms/pages — Create page (SUPER_ADMIN, ADMIN)
PATCH /cms/pages/:id — Update page (SUPER_ADMIN, ADMIN)
PATCH /cms/pages/:id/publish — Publish/unpublish (SUPER_ADMIN, ADMIN)
GET /crm/leads — List website leads
PATCH /crm/leads/:id/status — Update lead status (ALL)
```

#### Current Implementation
- ✅ `/super-admin/cms/page.tsx` - Created with full access
- ⚠️ `/admin/cms/page.tsx` - Exists but currently shares with MANAGER
- ❌ `/manager/cms/page.tsx` - NEEDS CREATION (view-only)

#### Navigation Added
- ✅ Super Admin dashboard has Quick Access link to `/super-admin/cms`
- ⚠️ Admin dashboard needs update to link to `/admin/cms`
- ❌ Manager dashboard needs link to `/manager/cms`

---

### 2. Product Management

**Purpose:** Define and manage sellable products (Food, Soft Drinks, Alcoholic Drinks)  
**Feature:** Feature 4 - Product Segmentation & Pricing Control

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/products` | ⚠️ SHARED | Full | CRUD products, Set prices |
| MANAGER | `/manager/products` | ❌ MISSING | View-Only | View products, View prices |

#### API Endpoints
```
GET /products — List products
GET /products/:id — Get product detail
POST /products — Create product (ADMIN only)
PATCH /products/:id — Update product (ADMIN only)
DELETE /products/:id — Soft delete (ADMIN only)
```

#### Current Implementation
- ⚠️ `/admin/products/page.tsx` - Exists but currently shared
- ⚠️ `/admin/products/new/page.tsx` - Product creation form
- ❌ `/manager/products/page.tsx` - NEEDS CREATION (view-only)

---

### 3. Pricing Control

**Purpose:** Manage pricing rules, margins, and price change approvals  
**Feature:** Feature 4 - Product Segmentation & Pricing Control

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| SUPER_ADMIN | `/super-admin/pricing` | ❌ MISSING | Full | Set rules, Override margins |
| ADMIN | `/admin/pricing-control` | ⚠️ SHARED | Full | Set rules, Review alerts |
| ACCOUNTANT | `/accountant/pricing` | ❌ MISSING | Review | View rules, Review margin alerts |

#### API Endpoints
```
GET /pricing-rules — List pricing rules
POST /pricing-rules — Create rule (SUPER_ADMIN, ADMIN)
PATCH /pricing-rules/:id — Update rule (SUPER_ADMIN, ADMIN)
GET /margin-alerts — List margin alerts
PATCH /margin-alerts/:id/status — Review alert (ALL)
```

#### Current Implementation
- ❌ `/super-admin/pricing/page.tsx` - NEEDS CREATION
- ⚠️ `/admin/pricing-control/page.tsx` - Exists
- ❌ `/accountant/pricing/page.tsx` - NEEDS CREATION

---

### 4. Supplier Management

**Purpose:** Register and manage suppliers for procurement  
**Feature:** Feature 5 - Supplier & Procurement Management

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/suppliers` | ⚠️ SHARED | Full | CRUD suppliers, Set status |
| MANAGER | `/manager/suppliers` | ❌ MISSING | Full | CRUD suppliers, Set status |
| STOREKEEPER | `/storekeeper/suppliers` | ❌ MISSING | View-Only | View for purchase orders |
| ACCOUNTANT | `/accountant/suppliers` | ❌ MISSING | View-Only | View for finance tracking |

#### API Endpoints
```
GET /suppliers — List suppliers
GET /suppliers/:id — Get supplier detail
POST /suppliers — Create supplier (ADMIN, MANAGER)
PATCH /suppliers/:id — Update supplier (ADMIN, MANAGER)
PATCH /suppliers/:id/status — Toggle status (ADMIN, MANAGER)
```

#### Current Implementation
- ⚠️ `/admin/suppliers/page.tsx` - Exists but shared
- ⚠️ `/admin/suppliers/new/page.tsx` - Supplier creation form
- ⚠️ `/staff/suppliers/page.tsx` - Shared view-only (STOREKEEPER, ACCOUNTANT)
- ❌ `/manager/suppliers/page.tsx` - NEEDS CREATION
- ❌ `/storekeeper/suppliers/page.tsx` - NEEDS CREATION
- ❌ `/accountant/suppliers/page.tsx` - NEEDS CREATION

---

### 5. Stock Control (Inventory Management)

**Purpose:** Track stock balances, movements, and reorder levels  
**Feature:** Feature 6 - Inventory, Storekeeping & Stock Control

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/stock` | ⚠️ SHARED | Full | View all, Adjust, Transfer, Purchase |
| MANAGER | `/manager/stock` | ❌ MISSING | View-Only | View balances, View movements |
| STOREKEEPER | `/storekeeper/stock` | ❌ MISSING | Full | Purchase, Adjust, Transfer, Reorder |
| CHEF | `/kitchen/stock` | ✅ EXISTS | Kitchen Only | View kitchen stock, Record usage |
| BARMAN | `/bar/stock` | ✅ EXISTS | Bar Only | View bar stock, Record usage |

#### API Endpoints
```
GET /stock — Get stock balances (filters: location, status)
POST /stock/purchase — Record purchase (ADMIN, STOREKEEPER)
POST /stock/adjustment — Record adjustment (ADMIN, STOREKEEPER)
POST /stock/transfer — Transfer stock (ADMIN, STOREKEEPER)
GET /stock/movements — List stock movements
GET /stock/kitchen — Kitchen stock view (CHEF)
POST /stock/kitchen-usage — Kitchen usage (CHEF)
GET /stock/bar — Bar stock view (BARMAN)
POST /stock/bar-sale — Bar sale deduction (BARMAN)
```

#### Current Implementation
- ⚠️ `/admin/stock/page.tsx` - Exists but shared
- ✅ `/kitchen/stock/page.tsx` - Kitchen-specific
- ✅ `/bar/stock/page.tsx` - Bar-specific
- ❌ `/manager/stock/page.tsx` - NEEDS CREATION
- ❌ `/storekeeper/stock/page.tsx` - NEEDS CREATION

---

### 6. Order Management

**Purpose:** View and manage customer orders across all stages  
**Feature:** Feature 7 - POS Menu, Tables & Order Capture

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| CASHIER | `/cashier/orders` | ❌ MISSING | Unsettled | View ready/served orders for settlement |
| ADMIN | `/admin/orders` | ⚠️ SHARED | Full | View all, Update status, Apply discounts |
| MANAGER | `/manager/orders` | ❌ MISSING | View-Only | View all, Monitor delays |
| WAITER | `/pos/orders` | ✅ EXISTS | Own Orders | View own orders, Track status |

#### API Endpoints
```
GET /orders — List orders (filters: status, waiter, table, date)
GET /orders/:id — Get order detail
POST /orders — Create order (WAITER)
PATCH /orders/:id/status — Update status (CASHIER, ADMIN, MANAGER)
PATCH /orders/:id/discount — Apply discount (ADMIN, MANAGER)
POST /orders/:id/items — Add item (WAITER)
DELETE /orders/:id/items/:itemId — Remove item (WAITER or approval)
```

#### Current Implementation
- ⚠️ `/admin/orders/page.tsx` - Exists but shared
- ✅ `/pos/orders/page.tsx` - Waiter's orders
- ❌ `/cashier/orders/page.tsx` - NEEDS CREATION (settlement focus)
- ❌ `/manager/orders/page.tsx` - NEEDS CREATION (oversight)

---

### 7. Payment Management

**Purpose:** Track payments, reconciliation, and financial transactions  
**Feature:** Feature 10 - Payments, Cashier Settlement & Receipts

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/payments` | ⚠️ SHARED | Full | View all, Review variance, Export |
| MANAGER | `/manager/payments` | ❌ MISSING | View-Only | View payments, Monitor variance |

#### API Endpoints
```
GET /payments — List payments (filters: date, method, cashier, status)
GET /payments/:id — Get payment detail
POST /payments — Record payment (CASHIER)
POST /payments/:id/receipt — Generate receipt (CASHIER)
GET /payments/summary — Payment summary by period
GET /payments/variance — Payment variance report
```

#### Current Implementation
- ⚠️ `/admin/payments/page.tsx` - Exists but shared
- ❌ `/manager/payments/page.tsx` - NEEDS CREATION

---

### 8. Dispatch Operations

**Purpose:** Manage delivery orders and rider assignments  
**Feature:** Feature 11 - Dispatch & Delivery Management

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| DISPATCHER | `/dispatcher` | ✅ EXISTS | Full | Assign riders, Update status |
| ADMIN | `/admin/dispatch` | ⚠️ SHARED | Oversight | View all, Reassign, Review failures |
| MANAGER | `/manager/dispatch` | ❌ MISSING | Oversight | View deliveries, Monitor performance |

#### API Endpoints
```
GET /deliveries — List deliveries (filters: status, rider, date)
GET /deliveries/:id — Get delivery detail
POST /deliveries — Create delivery (WAITER, CASHIER)
PATCH /deliveries/:id — Assign rider (DISPATCHER)
PATCH /deliveries/:id/status — Update status (DISPATCHER)
GET /deliveries/summary — Delivery metrics
GET /riders — List riders
GET /riders/available — Available riders only
```

#### Current Implementation
- ✅ `/dispatcher/page.tsx` - Dispatcher's workspace
- ⚠️ `/admin/dispatch/page.tsx` - Exists but might redirect
- ❌ `/manager/dispatch/page.tsx` - NEEDS CREATION

---

### 9. Production Plans (Kitchen Planning)

**Purpose:** Plan daily kitchen production and track ingredient consumption  
**Feature:** Feature 13 - Production Planning & Ingredient Consumption

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/production-plans` | ✅ EXISTS | Full | Create, Edit, Delete, Close plans |
| MANAGER | `/manager/production-plans` | ✅ EXISTS | View-Only | View plans, Monitor progress |

#### API Endpoints
```
GET /production-plans — List production plans (filters: date, status)
GET /production-plans/:id — Get plan detail
POST /production-plans — Create plan (ADMIN, MANAGER, CHEF)
PATCH /production-plans/:id — Update plan (ADMIN, MANAGER, CHEF)
PATCH /production-plans/:id/status — Update status
PATCH /production-plans/:id/produced-quantity — Update produced quantity (ADMIN)
DELETE /production-plans/:id — Delete plan (ADMIN only)
GET /production-plans/summary — Production summary metrics
GET /production-plans/variance — Planned vs actual variance
```

#### Current Implementation
- ✅ `/admin/production-plans/page.tsx` - ISOLATED (ADMIN only, full access with create/edit/delete)
- ✅ `/manager/production-plans/page.tsx` - ISOLATED (MANAGER only, view-only access)

#### Navigation Added
- ✅ Admin dashboard has link to `/admin/production-plans` in Quick Access grid
- ✅ Manager dashboard has link to `/manager/production-plans` in Quick Actions AND Management Tools
- ✅ Both pages have breadcrumb navigation back to respective dashboards

#### Access Control
- **ADMIN:** Full CRUD operations - Create new plans, update quantities, delete plans, close plans
- **MANAGER:** View-only - Can see all plans, view details, filter and search, but cannot modify
- **Separation:** Each role accesses through their own route with role-specific UI and permissions

---

### 10. Kitchen Oversight

**Purpose:** Monitor kitchen operations, preparation times, and delays  
**Feature:** Feature 8 - Kitchen Queue & Food Preparation

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/kitchen` | ⚠️ SHARED | Full | View metrics, Review delays |
| MANAGER | `/manager/kitchen` | ❌ MISSING | Oversight | View queue, Monitor performance |
| CHEF | `/kitchen` | ✅ EXISTS | Workspace | Manage queue, Update status |
| CHEF | `/kitchen/queue` | ✅ EXISTS | Queue Board | Three-column Kanban |

#### API Endpoints
```
GET /kitchen/queue — Food order items (CHEF)
GET /kitchen/orders/:id/status — Get prep status
GET /kitchen/summary — Prep metrics (ADMIN, MANAGER, WAITER)
PATCH /kitchen/orders/:id/status — Update status (CHEF)
POST /kitchen/orders/:id/notes — Add prep notes (CHEF)
```

#### Current Implementation
- ⚠️ `/admin/kitchen/page.tsx` - Exists but shared
- ✅ `/kitchen/page.tsx` - Chef dashboard
- ✅ `/kitchen/queue/page.tsx` - Kitchen queue board
- ❌ `/manager/kitchen/page.tsx` - NEEDS CREATION

---

### 11. Bar Oversight

**Purpose:** Monitor bar operations, drink service, and stock movements  
**Feature:** Feature 9 - Bar Queue & Drink Service

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/bar` | ⚠️ SHARED | Full | View all metrics, Review stock |
| MANAGER | `/manager/bar` | ❌ MISSING | Oversight | View metrics, Monitor delays |
| STOREKEEPER | `/storekeeper/bar` | ❌ MISSING | Stock Focus | View stock transfers, Approve requests |
| BARMAN | `/bar` | ✅ EXISTS | Workspace | Manage drink queue, Update status |

#### API Endpoints
```
GET /bar/queue — Drink order items (BARMAN)
GET /bar/summary — Bar metrics (ADMIN, MANAGER, STOREKEEPER)
GET /bar/stock-movements — Bar stock log
GET /bar/transfers — Stock transfers to bar
PATCH /bar/orders/:id/status — Update drink status (BARMAN)
POST /stock/bar-sale — Record bar sale (BARMAN)
```

#### Current Implementation
- ⚠️ `/admin/bar/page.tsx` - Exists but shared
- ✅ `/bar/page.tsx` - Bar queue board
- ❌ `/manager/bar/page.tsx` - NEEDS CREATION
- ❌ `/storekeeper/bar/page.tsx` - NEEDS CREATION

---

### 12. Waste Management

**Purpose:** Track unsold food, wastage, and loss control  
**Feature:** Feature 14 - Waste, Unsold Food & Loss Control

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/waste` | ⚠️ SHARED | Full | View all, Review, Approve write-offs |
| MANAGER | `/manager/waste` | ❌ MISSING | Review | View waste, Review reasons |

#### API Endpoints
```
GET /unsold-food — List unsold food declarations
POST /unsold-food — Declare unsold (CHEF, STOREKEEPER)
GET /food-wastage — List food wastage
POST /food-wastage — Record wastage (CHEF, STOREKEEPER)
GET /waste/summary — Waste metrics by category
```

#### Current Implementation
- ⚠️ `/admin/waste/page.tsx` - Exists but shared
- ❌ `/manager/waste/page.tsx` - NEEDS CREATION

---

### 13. Delivery Tracking

**Purpose:** Track delivery status and performance metrics  
**Feature:** Feature 11 - Dispatch & Delivery Management

#### Roles & Routes

| Role | Route | Status | Access Level | Actions |
|------|-------|--------|--------------|---------|
| ADMIN | `/admin/delivery-tracking` | ⚠️ SHARED | Full | View all, Export reports |
| MANAGER | `/manager/delivery-tracking` | ❌ MISSING | Oversight | View tracking, Monitor success rate |

#### API Endpoints
```
GET /deliveries — List deliveries with tracking
GET /deliveries/:id/tracking — Get delivery tracking detail
GET /deliveries/summary — Delivery performance metrics
```

#### Current Implementation
- ⚠️ `/admin/delivery-tracking/page.tsx` - Exists but shared
- ❌ `/manager/delivery-tracking/page.tsx` - NEEDS CREATION

---

## Implementation Status

### By Role

#### ✅ Fully Isolated Roles (No Shared Routes)
1. **WAITER** - All routes exclusive (`/pos/*`)
2. **CHEF** - All routes exclusive (`/kitchen/*`)
3. **BARMAN** - All routes exclusive (`/bar/*`)
4. **DISPATCHER** - All routes exclusive (`/dispatcher`)
5. **HR** - Dashboard only, no shared modules
6. **CASHIER** - Dashboard only, 1 missing route

#### ⚠️ Partially Isolated Roles
7. **SUPER_ADMIN** - Dashboard done, missing 5 module routes
8. **STOREKEEPER** - Dashboard done, missing 3 module routes
9. **ACCOUNTANT** - Dashboard done, missing 2 module routes

#### ❌ Needs Major Work
10. **ADMIN** - 13 routes currently shared, need role guards
11. **MANAGER** - 0 dedicated routes, needs 13 routes created

---

### Implementation Progress

| Category | Count | Percentage |
|----------|-------|------------|
| **Dashboard Pages** | 11/11 | 100% ✅ |
| **Isolated Routes** | 8/11 roles | 73% ⚠️ |
| **Module Routes** | 23/43 | 53% ⚠️ |
| **Fully Isolated Modules** | 1/13 | 8% |
| **Missing Routes** | 20 | - |

### Recently Completed ✅
- **Production Plans Module** - Both ADMIN and MANAGER routes created with proper isolation
  - `/admin/production-plans` - Full CRUD access
  - `/manager/production-plans` - View-only access
  - Navigation links added to both dashboards
  - Breadcrumb navigation implemented

---

## Priority Roadmap

### 🔴 Phase 1: Critical Security (Week 1)
**Goal:** Stop MANAGER from sharing ADMIN routes

1. ✅ ~~Create `/manager/production-plans` (view-only)~~ **COMPLETED**
2. Create `/manager/cms` (view-only CMS)
3. Create `/manager/products` (view-only products)
4. Create `/manager/orders` (oversight)
5. Create `/manager/stock` (view-only inventory)
6. Create `/manager/suppliers` (full access but separate)

**Progress:** 1/6 routes completed (17%)  
**Estimated:** 8 hours remaining

---

### 🟠 Phase 2: Manager Complete (Week 2)
**Goal:** Complete all MANAGER routes

6. Create `/manager/payments` (view-only)
7. Create `/manager/dispatch` (oversight)
8. ~~Create `/manager/production-plans` (approve)~~ **✅ COMPLETED**
9. Create `/manager/kitchen` (oversight)
10. Create `/manager/bar` (oversight)
11. Create `/manager/waste` (review)
12. Create `/manager/delivery-tracking` (oversight)
13. Create `/manager/finance` (reports)

**Progress:** 1/8 routes completed (13%)  
**Estimated:** 14 hours remaining

---

### 🟡 Phase 3: Role Isolation (Week 3)
**Goal:** Complete remaining role-specific routes

14. Create `/storekeeper/stock` (full inventory)
15. Create `/storekeeper/suppliers` (view for orders)
16. Create `/storekeeper/bar` (stock transfers)
17. Create `/accountant/pricing` (margin alerts)
18. Create `/accountant/suppliers` (view for finance)
19. Create `/cashier/orders` (settlement queue)

**Estimated:** 12 hours

---

### 🟢 Phase 4: Super Admin (Week 4)
**Goal:** Complete SUPER_ADMIN routes

20. Create `/super-admin/pricing` (full pricing control)
21. Create `/super-admin/stock` (full stock control)
22. Create `/super-admin/orders` (full order control)
23. Create `/super-admin/finance` (full finance dashboard)
24. Create `/super-admin/hrm` (full HR management)

**Estimated:** 10 hours

---

### 🔵 Phase 5: Navigation & Guards (Week 5)
**Goal:** Update all dashboards and add route guards

25. Add navigation links to all dashboards
26. Implement middleware route guards
27. Add role-based breadcrumbs
28. Update all "Quick Access" grids
29. Add role-specific help text

**Estimated:** 8 hours

---

### ⚪ Phase 6: Testing & Deprecation (Week 6)
**Goal:** Test security and remove shared routes

30. Test all route guards
31. Test role-based access control
32. Audit log verification
33. Deprecate `/staff` route
34. Remove shared route access
35. Documentation updates

**Estimated:** 10 hours

---

## Total Effort Estimate

| Phase | Routes | Hours | Status |
|-------|--------|-------|--------|
| Phase 1 | 5 | 8 | � 20% Complete |
| Phase 2 | 7 | 14 | � 14% Complete |
| Phase 3 | 6 | 12 | ⚪ Not Started |
| Phase 4 | 5 | 10 | ⚪ Not Started |
| Phase 5 | Navigation | 8 | ⚪ Not Started |
| Phase 6 | Testing | 10 | ⚪ Not Started |
| **TOTAL** | **23 routes** | **62 hours** | **2 hours completed** |

**Overall Progress:** 4% (1 module fully isolated out of 13)  
**Routes Progress:** 53% (23/43 routes exist)  
**Time Spent:** ~2 hours on Production Plans module

---

## Quick Reference: Missing Routes by Role

### MANAGER (12 routes remaining - HIGHEST PRIORITY)
```
/manager/cms                ❌
/manager/products           ❌
/manager/suppliers          ❌
/manager/stock              ❌
/manager/orders             ❌
/manager/payments           ❌
/manager/dispatch           ❌
/manager/production-plans   ✅ COMPLETED
/manager/kitchen            ❌
/manager/bar                ❌
/manager/waste              ❌
/manager/delivery-tracking  ❌
/manager/finance            ❌
```

**Progress:** 1/13 completed (8%)

### STOREKEEPER (3 routes)
```
/storekeeper/stock          ❌
/storekeeper/suppliers      ❌
/storekeeper/bar            ❌
```

### ACCOUNTANT (2 routes)
```
/accountant/pricing         ❌
/accountant/suppliers       ❌
```

### CASHIER (1 route)
```
/cashier/orders             ❌
```

### SUPER_ADMIN (5 routes)
```
/super-admin/pricing        ❌
/super-admin/stock          ❌
/super-admin/orders         ❌
/super-admin/finance        ❌
/super-admin/hrm            ❌
```

---

## Route Guard Implementation Pattern

### Middleware Example
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userRole = getUserRole(request); // from JWT

  // MANAGER routes
  if (pathname.startsWith('/manager/')) {
    if (userRole !== 'MANAGER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // ADMIN routes - block MANAGER
  if (pathname.startsWith('/admin/')) {
    if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}
```

### Page-Level Guard Example
```typescript
// app/manager/cms/page.tsx
import { checkRole } from '@/lib/auth';

export default async function ManagerCMSPage() {
  await checkRole(['MANAGER']); // Throws if not MANAGER

  return (
    <div>
      <Breadcrumb>
        <Link href="/manager">Dashboard</Link>
        <span>/</span>
        <span>Content Management</span>
      </Breadcrumb>
      
      <CMSComponent
        role="MANAGER"
        permissions={{
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canPublish: false,
        }}
      />
    </div>
  );
}
```

---

## Testing Checklist Template

For each newly created route, verify:

### ✅ Functional Tests
- [ ] Page loads without errors (HTTP 200)
- [ ] Data fetches correctly for role
- [ ] Buttons and actions match permissions
- [ ] Navigation breadcrumbs are correct
- [ ] Links point to role-specific routes only

### ✅ Security Tests
- [ ] Other roles get 403/redirect when accessing
- [ ] API enforces role-based permissions
- [ ] No data leakage in API responses
- [ ] Audit logs capture access correctly
- [ ] JWT role claim checked on server

### ✅ UX Tests
- [ ] Role-specific help text displays
- [ ] Disabled features have tooltips explaining why
- [ ] "Back to Dashboard" goes to correct role dashboard
- [ ] Quick actions only show allowed operations
- [ ] No confusing shared navigation elements

---

## Deprecation Schedule

### Routes to Deprecate After Migration

1. **`/staff`** - After individual role dashboards complete
   - STOREKEEPER → `/storekeeper`
   - ACCOUNTANT → `/accountant`
   - HR → `/hr`

2. **`/staff/suppliers`** - After role-specific created
   - STOREKEEPER → `/storekeeper/suppliers`
   - ACCOUNTANT → `/accountant/suppliers`

3. **`/admin/dispatch`** - After `/dispatcher` is primary
   - All roles → `/dispatcher`

4. **Shared `/admin/*` routes** - Add role redirects
   - If MANAGER accessing `/admin/cms` → redirect to `/manager/cms`
   - If ADMIN accessing → allow
   - If other roles → 403

---

## Audit Log Schema

Track all access to shared modules:

```typescript
interface AccessAuditLog {
  timestamp: Date;
  userId: string;
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | ...;
  route: string; // e.g., "/manager/cms"
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE';
  resourceType: 'CMS_PAGE' | 'PRODUCT' | 'ORDER' | ...;
  resourceId?: string;
  ipAddress: string;
  success: boolean;
  denialReason?: string; // if success = false
}
```

---

## Next Steps

1. **Immediate:** Start Phase 1 - Create 5 critical MANAGER routes
2. **Week 2:** Complete remaining MANAGER routes
3. **Week 3:** Complete STOREKEEPER, ACCOUNTANT, CASHIER routes
4. **Week 4:** Complete SUPER_ADMIN routes
5. **Week 5:** Update all dashboard navigation
6. **Week 6:** Testing and deprecation

---

**Status:** 📊 Complete Audit  
**Completion:** 51% (22/43 routes)  
**Next Action:** Begin Phase 1 - Create `/manager/cms`  
**Estimated Completion:** 9 weeks (at 8-10 hours/week pace)  
**Last Updated:** June 30, 2026  
**Version:** 2.0
