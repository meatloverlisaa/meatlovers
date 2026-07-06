# Shared Modules Status Report
**Meat Lovers CIMS - Current Implementation Status of Shared Pages**

**Generated:** June 30, 2026  
**Purpose:** Document which shared modules exist and which need to be created for proper role isolation

---

## Legend

- ✅ **EXISTS** - Page implemented and working
- ❌ **MISSING** - Needs to be created
- ⚠️ **NEEDS SPLIT** - Exists but shared, needs role-specific copies
- 🔄 **IN PROGRESS** - Partially implemented

---

## 1. Website CMS Module

**Shared By:** SUPER_ADMIN, ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/super-admin/cms` | SUPER_ADMIN | ✅ EXISTS | Created - Full access |
| `/admin/cms` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared with MANAGER |
| `/manager/cms` | MANAGER | ❌ MISSING | Need view-only version |

**Actions Required:**
1. Keep `/super-admin/cms` as is
2. Keep `/admin/cms` for ADMIN role only
3. Create `/manager/cms` for MANAGER (view-only)

---

## 2. Product Management Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/products` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared with MANAGER |
| `/admin/products/new` | ADMIN | ✅ EXISTS | Create new product |
| `/manager/products` | MANAGER | ❌ MISSING | Need view-only version |

**Actions Required:**
1. Keep `/admin/products` for ADMIN only (full access)
2. Create `/manager/products` for MANAGER (view-only)

---

## 3. Pricing Control Module

**Shared By:** SUPER_ADMIN, ADMIN, ACCOUNTANT

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/super-admin/pricing` | SUPER_ADMIN | ❌ MISSING | Full access to pricing rules |
| `/admin/pricing-control` | ADMIN | ⚠️ NEEDS SPLIT | Currently at /admin/pricing-control |
| `/accountant/pricing` | ACCOUNTANT | ❌ MISSING | View + margin alert review |

**Actions Required:**
1. Create `/super-admin/pricing` 
2. Rename or keep `/admin/pricing-control` for ADMIN
3. Create `/accountant/pricing` for ACCOUNTANT

---

## 4. Supplier Management Module

**Shared By:** ADMIN, MANAGER (full), STOREKEEPER, ACCOUNTANT (view)

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/suppliers` | ADMIN | ⚠️ NEEDS SPLIT | Full management |
| `/admin/suppliers/new` | ADMIN | ✅ EXISTS | Create new supplier |
| `/manager/suppliers` | MANAGER | ❌ MISSING | Full management access |
| `/staff/suppliers` | STOREKEEPER, ACCOUNTANT | ⚠️ NEEDS SPLIT | Shared view-only |
| `/storekeeper/suppliers` | STOREKEEPER | ❌ MISSING | View-only for orders |
| `/accountant/suppliers` | ACCOUNTANT | ❌ MISSING | View-only for finance |

**Actions Required:**
1. Keep `/admin/suppliers` for ADMIN only
2. Create `/manager/suppliers` for MANAGER
3. Create `/storekeeper/suppliers` for STOREKEEPER (view-only)
4. Create `/accountant/suppliers` for ACCOUNTANT (view-only)
5. Deprecate `/staff/suppliers`

---

## 5. Stock Control Module

**Shared By:** ADMIN, MANAGER, STOREKEEPER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/stock` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/stock` | MANAGER | ❌ MISSING | View-only oversight |
| `/storekeeper/stock` | STOREKEEPER | ❌ MISSING | Full inventory management |
| `/kitchen/stock` | CHEF | ✅ EXISTS | Kitchen stock only |
| `/bar/stock` | BARMAN | ✅ EXISTS | Bar stock only |

**Actions Required:**
1. Keep `/admin/stock` for ADMIN only
2. Create `/manager/stock` for MANAGER (view-only)
3. Create `/storekeeper/stock` for STOREKEEPER (full access)

---

## 6. Order Management Module

**Shared By:** CASHIER, ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/cashier/orders` | CASHIER | ❌ MISSING | Settlement focus |
| `/admin/orders` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/orders` | MANAGER | ❌ MISSING | Oversight view |
| `/pos/orders` | WAITER | ✅ EXISTS | Waiter's own orders |

**Actions Required:**
1. Create `/cashier/orders` for CASHIER (unsettled orders)
2. Keep `/admin/orders` for ADMIN only
3. Create `/manager/orders` for MANAGER (oversight)

---

## 7. Payment Management Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/payments` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/payments` | MANAGER | ❌ MISSING | View-only |

**Actions Required:**
1. Keep `/admin/payments` for ADMIN only
2. Create `/manager/payments` for MANAGER (view-only)

---

## 8. Dispatch Operations Module

**Shared By:** DISPATCHER, ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/dispatcher` | DISPATCHER | ✅ EXISTS | Full dispatch control |
| `/admin/dispatch` | ADMIN | ⚠️ SHARED | Currently accessible |
| `/manager/dispatch` | MANAGER | ❌ MISSING | Oversight only |

**Actions Required:**
1. Keep `/dispatcher` for DISPATCHER only
2. Keep `/admin/dispatch` for ADMIN (oversight)
3. Create `/manager/dispatch` for MANAGER (oversight)
4. OR redirect `/admin/dispatch` → `/dispatcher` for all roles

---

## 9. Production Plans Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/production-plans` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/production-plans` | MANAGER | ❌ MISSING | View + approve |

**Actions Required:**
1. Keep `/admin/production-plans` for ADMIN only
2. Create `/manager/production-plans` for MANAGER

---

## 10. Kitchen Oversight Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/kitchen` | ADMIN | ⚠️ NEEDS SPLIT | Kitchen oversight |
| `/manager/kitchen` | MANAGER | ❌ MISSING | Kitchen oversight |
| `/kitchen` | CHEF | ✅ EXISTS | Chef's workspace |
| `/kitchen/queue` | CHEF | ✅ EXISTS | Kitchen queue board |

**Actions Required:**
1. Keep `/admin/kitchen` for ADMIN only
2. Create `/manager/kitchen` for MANAGER

---

## 11. Bar Oversight Module

**Shared By:** ADMIN, MANAGER, STOREKEEPER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/bar` | ADMIN | ⚠️ NEEDS SPLIT | Full oversight |
| `/manager/bar` | MANAGER | ❌ MISSING | Oversight |
| `/storekeeper/bar` | STOREKEEPER | ❌ MISSING | Stock transfer view |
| `/bar` | BARMAN | ✅ EXISTS | Barman's workspace |

**Actions Required:**
1. Keep `/admin/bar` for ADMIN only
2. Create `/manager/bar` for MANAGER
3. Create `/storekeeper/bar` for STOREKEEPER (stock focus)

---

## 12. Waste Management Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/waste` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/waste` | MANAGER | ❌ MISSING | View + review |

**Actions Required:**
1. Keep `/admin/waste` for ADMIN only
2. Create `/manager/waste` for MANAGER

---

## 13. Delivery Tracking Module

**Shared By:** ADMIN, MANAGER

### Current Status

| Route | Role | Status | Notes |
|-------|------|--------|-------|
| `/admin/delivery-tracking` | ADMIN | ⚠️ NEEDS SPLIT | Currently shared |
| `/manager/delivery-tracking` | MANAGER | ❌ MISSING | View tracking |

**Actions Required:**
1. Keep `/admin/delivery-tracking` for ADMIN only
2. Create `/manager/delivery-tracking` for MANAGER

---

## Dashboard Pages Status

### ✅ Existing Dashboards (11/11 - 100%)

| Route | Role | Status |
|-------|------|--------|
| `/super-admin` | SUPER_ADMIN | ✅ EXISTS |
| `/admin` | ADMIN | ✅ EXISTS |
| `/manager` | MANAGER | ✅ EXISTS |
| `/cashier` | CASHIER | ✅ EXISTS |
| `/pos` | WAITER | ✅ EXISTS |
| `/kitchen` | CHEF | ✅ EXISTS |
| `/bar` | BARMAN | ✅ EXISTS |
| `/storekeeper` | STOREKEEPER | ✅ EXISTS |
| `/accountant` | ACCOUNTANT | ✅ EXISTS |
| `/hr` | HR | ✅ EXISTS |
| `/dispatcher` | DISPATCHER | ✅ EXISTS |

---

## Summary Statistics

### Overall Module Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Fully Isolated (Correct) | 8 | 19% |
| ⚠️ Needs Splitting | 13 | 30% |
| ❌ Missing | 22 | 51% |
| **Total Routes** | **43** | **100%** |

### Breakdown by Role

#### SUPER_ADMIN
- ✅ Dashboard: EXISTS
- ✅ CMS: EXISTS (role-specific)
- ❌ Missing: 5 routes (pricing, stock, orders, etc.)

#### ADMIN
- ✅ Dashboard: EXISTS
- ⚠️ Shared: 13 routes need to stop sharing
- ✅ Working: All functional

#### MANAGER
- ✅ Dashboard: EXISTS
- ❌ Missing: 13 role-specific routes
- Current: Shares all with ADMIN

#### STOREKEEPER
- ✅ Dashboard: EXISTS
- ❌ Missing: Stock, Suppliers, Bar oversight

#### ACCOUNTANT
- ✅ Dashboard: EXISTS
- ❌ Missing: Pricing, Suppliers views

#### DISPATCHER
- ✅ Dashboard: EXISTS
- ✅ Fully isolated: No sharing needed

#### HR, CASHIER, WAITER, CHEF, BARMAN
- ✅ Fully isolated: Each has exclusive routes

---

## Priority Implementation Plan

### Phase 1: Critical Splits (High Priority)

1. **Stock Control** - Most shared module
   - Create `/manager/stock` (view-only)
   - Create `/storekeeper/stock` (full access)

2. **Order Management** - Security critical
   - Create `/cashier/orders` (settlement)
   - Create `/manager/orders` (oversight)

3. **Supplier Management**
   - Create `/manager/suppliers`
   - Create `/storekeeper/suppliers` (view)
   - Create `/accountant/suppliers` (view)

### Phase 2: Management Views (Medium Priority)

4. **CMS** - Already started
   - Create `/manager/cms` (view-only)

5. **Product Management**
   - Create `/manager/products` (view-only)

6. **Kitchen & Bar Oversight**
   - Create `/manager/kitchen`
   - Create `/manager/bar`
   - Create `/storekeeper/bar` (stock focus)

### Phase 3: Financial & Reporting (Medium Priority)

7. **Pricing Control**
   - Create `/super-admin/pricing`
   - Create `/accountant/pricing` (margin alerts)

8. **Payment Management**
   - Create `/manager/payments` (view-only)

9. **Waste Management**
   - Create `/manager/waste`

### Phase 4: Operational Support (Low Priority)

10. **Production Plans**
    - Create `/manager/production-plans`

11. **Delivery Tracking**
    - Create `/manager/delivery-tracking`

12. **Dispatch Operations**
    - Decide: Keep shared or create `/manager/dispatch`

---

## Implementation Template

For each missing route, use this structure:

```typescript
// {role}/{module}/page.tsx

import { ModuleComponent } from '@/shared/{module}/ModuleComponent';
import { Role } from '@/types';

export default function RoleModulePage() {
  return (
    <div>
      <Breadcrumb>
        <Link href="/{role}">Dashboard</Link>
        <span>/</span>
        <span>Module Name</span>
      </Breadcrumb>
      
      <ModuleComponent
        role={Role.ROLE_NAME}
        permissions={{
          canView: true,
          canEdit: boolean,
          canDelete: boolean,
          canCreate: boolean,
        }}
      />
    </div>
  );
}
```

---

## Testing Checklist

For each newly created route:

### Functional Tests
- [ ] Page loads without errors
- [ ] Data fetches correctly for role
- [ ] Actions respect permissions
- [ ] Navigation works correctly

### Security Tests
- [ ] Other roles cannot access route
- [ ] API enforces role permissions
- [ ] No data leakage across roles
- [ ] Audit logs capture access

### UX Tests
- [ ] Breadcrumbs show correct path
- [ ] Back button returns to own dashboard
- [ ] Links only go to own routes
- [ ] Help text mentions correct role

---

## Deprecation Plan

### Routes to Deprecate (After Role-Specific Created)

1. `/staff` - Replace with:
   - STOREKEEPER → `/storekeeper`
   - ACCOUNTANT → `/accountant`
   - HR → `/hr`

2. `/staff/suppliers` - Replace with:
   - STOREKEEPER → `/storekeeper/suppliers`
   - ACCOUNTANT → `/accountant/suppliers`

3. Shared `/admin/*` routes - After manager-specific created:
   - Add role check: If MANAGER, redirect to `/manager/*`

---

## Quick Reference: What Needs Creating

### For SUPER_ADMIN
```
/super-admin/pricing        ❌ MISSING
/super-admin/stock          ❌ MISSING
/super-admin/orders         ❌ MISSING
/super-admin/finance        ❌ MISSING
/super-admin/hrm            ❌ MISSING
```

### For MANAGER (Highest Priority - 13 routes)
```
/manager/cms                ❌ MISSING
/manager/products           ❌ MISSING
/manager/suppliers          ❌ MISSING
/manager/stock              ❌ MISSING
/manager/orders             ❌ MISSING
/manager/payments           ❌ MISSING
/manager/dispatch           ❌ MISSING
/manager/production-plans   ❌ MISSING
/manager/kitchen            ❌ MISSING
/manager/bar                ❌ MISSING
/manager/waste              ❌ MISSING
/manager/delivery-tracking  ❌ MISSING
/manager/finance            ❌ MISSING
```

### For STOREKEEPER
```
/storekeeper/stock          ❌ MISSING
/storekeeper/suppliers      ❌ MISSING
/storekeeper/bar            ❌ MISSING
```

### For ACCOUNTANT
```
/accountant/pricing         ❌ MISSING
/accountant/suppliers       ❌ MISSING
```

### For CASHIER
```
/cashier/orders             ❌ MISSING
```

---

## Recommendation

**Start with MANAGER routes** as they are the most critical:
- MANAGER currently shares all with ADMIN (security risk)
- 13 routes needed
- Most complex role hierarchy
- Once MANAGER is done, SUPER_ADMIN routes are similar

**Estimated Effort:**
- Per route: 1-2 hours (using shared components)
- MANAGER (13 routes): ~20 hours
- STOREKEEPER (3 routes): ~4 hours
- Others (7 routes): ~10 hours
- **Total: ~34 hours** for complete role isolation

---

**Status:** 📋 Audit Complete  
**Next Action:** Begin Phase 1 - Create MANAGER routes  
**Last Updated:** June 30, 2026  
**Version:** 1.0
