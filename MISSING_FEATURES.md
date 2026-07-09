# Missing Features Report
**Meat Lovers CIMS - Routes and Features Still Needed**

**Generated:** July 8, 2026  
**Purpose:** Document all missing routes and features for complete role isolation

---

## Summary

- **Total Missing Routes:** 20 (was 22)
- **Total Routes Needing Split:** 9
- **Completion Status:** 42% (16/43 routes fully isolated)
- **Last Updated:** July 8, 2026 - ✅ Completed `/manager/cms` and `/manager/products`

---

## HIGH PRIORITY: MANAGER Routes (7 missing)

These are the most critical missing routes as MANAGER currently shares all ADMIN routes, which is a security risk.

### ✅ 1. /manager/cms - **COMPLETED**
- **Purpose:** View-only CMS oversight for MANAGER
- **Access:** MANAGER only
- **Features:**
  - ✅ View website content
  - ✅ View published pages
  - ✅ View page by ID or slug
  - ✅ View CMS statistics
  - ❌ NO editing capabilities (by design)
- **API Implementation:**
  - ✅ Created `/manager/cms` module with dedicated controller and service
  - ✅ GET `/manager/cms/pages` - List all pages with optional published filter
  - ✅ GET `/manager/cms/pages/:id` - View page by ID
  - ✅ GET `/manager/cms/pages/slug/:slug` - View page by slug
  - ✅ GET `/manager/cms/stats` - View CMS statistics
  - ✅ Role-based security with `@Roles(Role.MANAGER)`
- **Status:** ✅ **COMPLETED** - July 8, 2026
- **Location:** `/api/src/manager-cms/`
- **Documentation:** See `/api/src/manager-cms/README.md`

### ✅ 2. /manager/products - **COMPLETED**
- **Purpose:** View-only product catalog for MANAGER
- **Access:** MANAGER only
- **Features:**
  - ✅ View all products with category/status filters
  - ✅ View detailed product information
  - ✅ View inventory levels across locations
  - ✅ View price change history
  - ✅ View product statistics
  - ✅ View low stock alerts
  - ❌ NO create/edit/delete capabilities (by design)
- **API Implementation:**
  - ✅ Created `/manager/products` module with dedicated controller and service
  - ✅ GET `/manager/products` - List all products with filters
  - ✅ GET `/manager/products/:id` - View product details
  - ✅ GET `/manager/products/:id/inventory` - View inventory levels
  - ✅ GET `/manager/products/:id/price-history` - View price changes
  - ✅ GET `/manager/products/stats/overview` - View statistics
  - ✅ GET `/manager/products/stats/low-stock` - View low stock items
  - ✅ Role-based security with `@Roles(Role.MANAGER)`
- **Status:** ✅ **COMPLETED** - July 8, 2026
- **Location:** `/api/src/manager-products/`
- **Documentation:** See `/api/src/manager-products/README.md`
- **Tests:** 10/10 passing

### 3. /manager/suppliers
- **Purpose:** Full supplier management for MANAGER
- **Access:** MANAGER only
- **Features:**
  - View all suppliers
  - Create new suppliers
  - Edit supplier details
  - View supplier orders
  - Manage supplier relationships
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER)` to supplier endpoints
- **Estimated Effort:** 2 hours

### 4. /manager/stock
- **Purpose:** View-only inventory oversight for MANAGER
- **Access:** MANAGER only
- **Features:**
  - View stock levels across all locations
  - View stock movements
  - View low stock alerts
  - NO stock adjustment capabilities
- **API Requirements:**
  - Already has `@Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)` on stock endpoints
- **Estimated Effort:** 2 hours

### 5. /manager/orders
- **Purpose:** Order oversight view for MANAGER
- **Access:** MANAGER only
- **Features:**
  - View all orders
  - View order details
  - View order status
  - View order history
  - NO order modification capabilities
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER)` to order read endpoints
- **Estimated Effort:** 2 hours

### 6. /manager/payments
- **Purpose:** Payment oversight view for MANAGER
- **Access:** MANAGER only
- **Features:**
  - View all payments
  - View payment methods
  - View payment status
  - View payment history
  - NO payment processing capabilities
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER)` to payment read endpoints
- **Estimated Effort:** 2 hours

### 7. /manager/finance
- **Purpose:** Financial oversight view for MANAGER
- **Access:** MANAGER only
- **Features:**
  - View revenue reports
  - View expense reports
  - View profit/loss summaries
  - View financial trends
  - NO financial transaction capabilities
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER)` to finance read endpoints
- **Estimated Effort:** 2 hours

---

## MEDIUM PRIORITY: Other Role Routes (5 missing)

### 8. /storekeeper/suppliers
- **Purpose:** Supplier order view for STOREKEEPER
- **Access:** STOREKEEPER only
- **Features:**
  - View supplier list
  - View supplier contact info
  - View supplier orders
  - NO supplier management capabilities
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER)` to supplier read endpoints
- **Estimated Effort:** 2 hours

### 9. /accountant/pricing
- **Purpose:** Margin alert review for ACCOUNTANT
- **Access:** ACCOUNTANT only
- **Features:**
  - View pricing rules
  - View margin alerts
  - Review price changes
  - NO pricing rule modification capabilities
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT)` to pricing read endpoints
- **Estimated Effort:** 2 hours

### 10. /accountant/suppliers
- **Purpose:** Supplier finance view for ACCOUNTANT
- **Access:** ACCOUNTANT only
- **Features:**
  - View supplier list
  - View supplier payment terms
  - View supplier invoices
  - NO supplier management capabilities
- **API Requirements:**
  - Add `@Roles(Role.ADMIN, Role.MANAGER, Role.STOREKEEPER, Role.ACCOUNTANT)` to supplier read endpoints
- **Estimated Effort:** 2 hours

### 11. /cashier/orders
- **Purpose:** Unsettled orders settlement for CASHIER
- **Access:** CASHIER only
- **Features:**
  - View unsettled orders
  - Process payments
  - Generate receipts
  - Close orders
- **API Requirements:**
  - Add `@Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER)` to order payment endpoints
- **Estimated Effort:** 2 hours

### 12. /super-admin/pricing
- **Purpose:** Full pricing control for SUPER_ADMIN
- **Access:** SUPER_ADMIN only
- **Features:**
  - Create pricing rules
  - Edit pricing rules
  - Delete pricing rules
  - View margin alerts
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN)` to pricing write endpoints
- **Estimated Effort:** 2 hours

---

## LOW PRIORITY: SUPER_ADMIN Routes (4 missing)

### 13. /super-admin/stock
- **Purpose:** Full inventory control for SUPER_ADMIN
- **Access:** SUPER_ADMIN only
- **Features:**
  - View all stock across locations
  - Adjust stock levels
  - Manage stock movements
  - View stock reports
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN)` to stock write endpoints
- **Estimated Effort:** 2 hours

### 14. /super-admin/orders
- **Purpose:** Full order management for SUPER_ADMIN
- **Access:** SUPER_ADMIN only
- **Features:**
  - View all orders
  - Modify any order
  - Cancel any order
  - View order analytics
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN)` to order write endpoints
- **Estimated Effort:** 2 hours

### 15. /super-admin/finance
- **Purpose:** Full financial control for SUPER_ADMIN
- **Access:** SUPER_ADMIN only
- **Features:**
  - View all financial data
  - Process transactions
  - Manage accounts
  - View financial reports
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN)` to finance write endpoints
- **Estimated Effort:** 2 hours

### 16. /super-admin/hrm
- **Purpose:** HR management for SUPER_ADMIN
- **Access:** SUPER_ADMIN only
- **Features:**
  - Manage employees
  - View payroll
  - Manage permissions
  - View HR reports
- **API Requirements:**
  - Add `@Roles(Role.SUPER_ADMIN)` to HR endpoints
- **Estimated Effort:** 2 hours

---

## ROUTES NEEDING SPLIT (9 routes)

These routes exist but are shared between roles and need to be separated:

### 17. /admin/cms → Split from MANAGER
- **Current:** Shared with MANAGER
- **Action:** Keep for ADMIN only, create `/manager/cms`
- **Estimated Effort:** 2 hours

### 18. /admin/products → Split from MANAGER
- **Current:** Shared with MANAGER
- **Action:** Keep for ADMIN only, create `/manager/products`
- **Estimated Effort:** 2 hours

### 19. /admin/suppliers → Split from MANAGER
- **Current:** Shared with MANAGER
- **Action:** Keep for ADMIN only, create `/manager/suppliers`
- **Estimated Effort:** 2 hours

### 20. /admin/orders → Split from MANAGER
- **Current:** Shared with MANAGER
- **Action:** Keep for ADMIN only, create `/manager/orders`
- **Estimated Effort:** 2 hours

### 21. /admin/payments → Split from MANAGER
- **Current:** Shared with MANAGER
- **Action:** Keep for ADMIN only, create `/manager/payments`
- **Estimated Effort:** 2 hours

### 22. /admin/pricing-control → Split from ACCOUNTANT
- **Current:** Shared with ACCOUNTANT
- **Action:** Keep for ADMIN only, create `/accountant/pricing`
- **Estimated Effort:** 2 hours

### 23. /staff/suppliers → Split from STOREKEEPER and ACCOUNTANT
- **Current:** Shared between STOREKEEPER and ACCOUNTANT
- **Action:** Deprecate, create `/storekeeper/suppliers` and `/accountant/suppliers`
- **Estimated Effort:** 2 hours

### 24. /admin/stock → Verify isolation
- **Current:** May be shared
- **Action:** Ensure ADMIN-only access, verify `/manager/stock` exists
- **Estimated Effort:** 1 hour

### 25. /admin/delivery-tracking → Verify isolation
- **Current:** May be shared
- **Action:** Ensure ADMIN-only access, verify `/manager/delivery-tracking` exists
- **Estimated Effort:** 1 hour

---

## API Controllers Needing Role-Based Access Control

### HIGH PRIORITY (Core business logic)
1. **cms.controller.ts** - Add `@Roles()` decorators
2. **product.controller.ts** - Add `@Roles()` decorators
3. **supplier.controller.ts** - Add `@Roles()` decorators
4. **orders.controller.ts** - Add `@Roles()` decorators
5. **payments.controller.ts** - Add `@Roles()` decorators

### MEDIUM PRIORITY (Financial and operational)
6. **finance.controller.ts** - Add `@Roles()` decorators
7. **pricing-rule.controller.ts** - Add `@Roles()` decorators
8. **stock.controller.ts** - Review and enhance existing `@Roles()` decorators

---

## Implementation Priority Order

### Phase 1: Critical MANAGER Routes (7 routes)
**Timeline:** Week 1-2
**Effort:** ~14 hours
1. /manager/cms
2. /manager/products
3. /manager/suppliers
4. /manager/stock
5. /manager/orders
6. /manager/payments
7. /manager/finance

### Phase 2: Role-Specific Routes (5 routes)
**Timeline:** Week 3
**Effort:** ~10 hours
1. /storekeeper/suppliers
2. /accountant/pricing
3. /accountant/suppliers
4. /cashier/orders
5. /super-admin/pricing

### Phase 3: SUPER_ADMIN Routes (4 routes)
**Timeline:** Week 4
**Effort:** ~8 hours
1. /super-admin/stock
2. /super-admin/orders
3. /super-admin/finance
4. /super-admin/hrm

### Phase 4: Route Splits (9 routes)
**Timeline:** Week 5
**Effort:** ~15 hours
Split shared routes and ensure proper role isolation

---

## Total Estimated Effort

- **Phase 1:** 14 hours
- **Phase 2:** 10 hours
- **Phase 3:** 8 hours
- **Phase 4:** 15 hours
- **Total:** ~47 hours

**Note:** This assumes using existing shared components and following the established pattern for role-specific pages.

---

## Testing Requirements

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

## Dependencies

### Required Components
- Shared UI components for each module (already exist for most)
- Role-based navigation components
- API controllers with `@Roles()` decorators
- JWT authentication middleware

### Required Services
- PrismaService for database access
- JwtAuthGuard for authentication
- RolesGuard for authorization

---

## Notes

- All MANAGER routes should be view-only oversight pages
- All ADMIN routes should maintain full control capabilities
- All SUPER_ADMIN routes should have system-wide access
- API endpoints should enforce the same role restrictions as UI
- Use existing admin pages as templates for manager pages (remove action buttons)
