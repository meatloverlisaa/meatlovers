# Errors to Fix - Based on System Diagnostic 6

**Date:** August 6, 2026  
**Source:** System Diagnostic Report 6  
**Total Errors:** 90 frontend build errors  
**Priority:** 🔴 **CRITICAL** - Blocking production deployment  
**Estimated Fix Time:** 4-6 hours

---

## Executive Summary

System Diagnostic 6 identified 90 critical errors in the frontend build that are blocking production deployment. The backend is production-ready with all tests passing. This document provides a detailed breakdown of all errors, their locations, and recommended fixes.

### Error Distribution by Category

| Category | Count | % of Total | Severity | Estimated Fix Time |
|----------|-------|------------|----------|-------------------|
| **setState in useEffect** | 25 | 28% | 🔴 Critical | 2 hours |
| **React Hooks Violations** | 20 | 22% | 🔴 Critical | 1.5 hours |
| **TypeScript any Types** | 30 | 33% | 🟡 High | 1.5 hours |
| **Impure Function Calls** | 10 | 11% | 🟡 High | 30 min |
| **Other Issues** | 5 | 6% | 🟢 Low | 30 min |
| **TOTAL** | **90** | **100%** | - | **6 hours** |

### Error Distribution by Module

| Module | Error Count | % of Total | Priority |
|--------|-------------|------------|----------|
| **Admin** | 35 | 39% | 🔴 Critical |
| **Kitchen** | 20 | 22% | 🔴 Critical |
| **Manager** | 10 | 11% | 🟡 High |
| **HR** | 10 | 11% | 🟡 High |
| **Cashier** | 5 | 6% | 🟢 Medium |
| **Dispatcher** | 5 | 6% | 🟢 Medium |
| **Super-admin** | 3 | 3% | 🟢 Low |
| **Bar** | 2 | 2% | 🟢 Low |

---

## 🔴 Category 1: setState in useEffect Errors (25 errors)

### Problem Description
Calling `setState` synchronously within an effect causes cascading renders that can hurt performance. Effects should update external systems or subscribe to updates, not directly trigger state changes.

### Affected Files

#### Admin Module (10 errors)
1. `/ui/src/app/admin/approvals/page.tsx` - Line 98
2. `/ui/src/app/admin/assets/page.tsx` - Line 109
3. `/ui/src/app/admin/bar/page.tsx` - Line 99
4. `/ui/src/app/admin/cms/page.tsx` - Line 266
5. `/ui/src/app/admin/customers/page.tsx` - Line 95
6. `/ui/src/app/admin/inventory/page.tsx` - Line 1349
7. `/ui/src/app/admin/orders/page.tsx` - Line 2095
8. `/ui/src/app/admin/pricing-control/components/PriceAuditTimeline.tsx` - Line 90
9. `/ui/src/app/admin/production/page.tsx` - Line 96
10. `/ui/src/app/admin/staff/page.tsx` - Lines 129, 159

#### Kitchen Module (5 errors)
11. `/ui/src/app/kitchen/page.tsx` - Line 288
12. `/ui/src/app/kitchen/production-plans/page.tsx` - Line 179
13. `/ui/src/app/kitchen/stock/page.tsx` - (line TBD)
14. `/ui/src/app/kitchen/waste/page.tsx` - Line 266
15. `/ui/src/app/kitchen/recipes/page.tsx` - (line TBD)

#### Manager Module (3 errors)
16. `/ui/src/app/manager/bar/page.tsx` - Line 99
17. `/ui/src/app/manager/reports/page.tsx` - (line TBD)
18. `/ui/src/app/manager/sales/page.tsx` - Line 58

#### Other Modules (7 errors)
19. `/ui/src/app/hr/dashboard/page.tsx` - (line TBD)
20. `/ui/src/app/cashier/orders/page.tsx` - Line 104
21. `/ui/src/app/dispatcher/page.tsx` - (line TBD)
22. `/ui/src/app/super-admin/pricing/page.tsx` - Line 91
23. `/ui/src/components/stock/StockControlModule.tsx` - Line 209
24. `/ui/src/components/hr/RosterPlanning.tsx` - Line 43
25. `/ui/src/components/ThemeToggle.tsx` - Line 14

### Solution Pattern

**❌ BEFORE (BROKEN):**
```typescript
useEffect(() => {
  fetchData(); // Directly calls setState inside
}, []);
```

**✅ AFTER (FIXED):**
```typescript
useEffect(() => {
  let mounted = true;
  const loadData = async () => {
    if (!mounted) return;
    await fetchData();
  };
  loadData();
  return () => { mounted = false; };
}, []);
```

### Fix Strategy
1. Wrap `setState` calls in async IIFE pattern
2. Add mounted check to prevent state updates on unmounted components
3. Add cleanup function to set mounted = false

**Priority:** 🔴 **CRITICAL**  
**Estimated Time:** 2 hours (5 min per file)


---

## 🔴 Category 2: React Hooks Violations (20 errors)

### Problem Description
Functions are accessed before they are declared, which prevents React from properly tracking dependencies and can cause the component to not re-render when the function changes.

### Affected Files

#### Admin Module (8 errors)
1. `/ui/src/app/admin/cms/page.tsx` - Lines 139, 176
   - Error: `loadData` accessed before declaration
   
2. `/ui/src/app/admin/pricing-control/page.tsx` - Line 222
   - Error: `loadData` accessed before declaration

3. `/ui/src/app/admin/production/components/ProductionScheduler.tsx` - Line 42
   - Error: `fetchProfile` accessed before declaration

4. `/ui/src/app/admin/staff/page.tsx` - (line TBD)
   - Error: Function accessed before declaration

#### Kitchen Module (5 errors)
5. `/ui/src/app/kitchen/recipes/page.tsx` - (line TBD)
   - Error: `fetchRecipes` accessed before declaration

6. `/ui/src/app/kitchen/production-plans/page.tsx` - (line TBD)
   - Error: `loadPlans` accessed before declaration

7. `/ui/src/app/kitchen/reports/page.tsx` - Line 62
   - Error: `loadReportData` accessed before declaration

#### Cashier Module (2 errors)
8. `/ui/src/app/cashier/profile/page.tsx` - Line 42
   - Error: `fetchProfile` accessed before declaration

#### Dispatcher Module (2 errors)
9. `/ui/src/app/dispatcher/profile/page.tsx` - Line 42
   - Error: `fetchProfile` accessed before declaration

#### Bar Module (1 error)
10. `/ui/src/app/bar/profile/page.tsx` - Line 42
    - Error: `fetchProfile` accessed before declaration

#### Manager Module (2 errors)
11. `/ui/src/app/manager/profile/page.tsx` - Lines 40, 44
    - Error: `fetchProfile` accessed before declaration (appears twice)

### Solution Pattern

**❌ BEFORE (BROKEN):**
```typescript
export default function Page() {
  useEffect(() => {
    fetchData(); // ERROR: accessed before declaration
  }, []);

  const fetchData = async () => {
    // implementation
  };
}
```

**✅ AFTER (FIXED - Option 1: Move function up):**
```typescript
export default function Page() {
  const fetchData = async () => {
    // implementation
  };

  useEffect(() => {
    fetchData(); // Now works correctly
  }, []);
}
```

**✅ AFTER (FIXED - Option 2: Use useCallback):**
```typescript
export default function Page() {
  const fetchData = useCallback(async () => {
    // implementation
  }, [dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

### Fix Strategy
1. Move function declaration before useEffect, OR
2. Use `useCallback` hook with proper dependencies
3. Preferred: useCallback for better performance and dependency tracking

**Priority:** 🔴 **CRITICAL**  
**Estimated Time:** 1.5 hours (4-5 min per file)

---

## 🟡 Category 3: TypeScript any Types (30 errors)

### Problem Description
Using `any` type defeats TypeScript's type safety and can lead to runtime errors. Proper typing is required for production code.

### Affected Files

#### Admin Module (15 errors)
1. `/ui/src/app/admin/bar/page.tsx` - Lines 20, 21, 22
   - Error: Unexpected any in type definitions

2. `/ui/src/app/admin/inventory/page.tsx` - Lines 333, 387, 812, 980, 1484, 1629
   - Error: Multiple `any` types in interfaces and parameters

3. `/ui/src/app/admin/payments/page.tsx` - Lines 67, 87, 112, 221, 481
   - Error: Unexpected any in function parameters

4. `/ui/src/app/admin/customers/page.tsx` - (lines TBD)
   - Error: Any types in data mapping

#### Kitchen Module (8 errors)
5. `/ui/src/app/kitchen/page.tsx` - Line 51
   - Error: Unexpected any type

6. `/ui/src/app/kitchen/recipes/page.tsx` - (line TBD)
   - Error: Any type in recipe data

7. `/ui/src/app/kitchen/reports/page.tsx` - Lines 109, 117, 122, 131, 133, 142, 156, 159, 182, 184, 209, 234, 240, 246, 266, 269
   - Error: Multiple any types in report generation

8. `/ui/src/app/kitchen/stock/page.tsx` - Line 63
   - Error: Any type in stock data

9. `/ui/src/app/kitchen/waste/page.tsx` - Lines 67, 93
   - Error: Any types in waste tracking

#### Manager Module (3 errors)
10. `/ui/src/app/manager/bar/page.tsx` - Lines 20, 21, 22
    - Error: Any types (same as admin/bar)

11. `/ui/src/app/manager/sales/page.tsx` - Line 17
    - Error: Any type in sales data

#### Cashier Module (2 errors)
12. `/ui/src/app/cashier/dashboard/page.tsx` - Lines 48-57
    - Error: Multiple any types in dashboard data

13. `/ui/src/app/cashier/payments/page.tsx` - Lines 65, 85, 110, 220, 534
    - Error: Multiple any types (same as admin/payments)

#### Dispatcher Module (2 errors)
14. `/ui/src/app/dispatcher/page.tsx` - Lines 76, 77
    - Error: Any types in delivery data

### Solution Pattern

**❌ BEFORE (BROKEN):**
```typescript
const data: any = response.data;
const items = data.map((item: any) => ({
  id: item.id,
  name: item.name
}));
```

**✅ AFTER (FIXED):**
```typescript
interface DataItem {
  id: string;
  name: string;
  // ... other properties
}

const data: DataItem[] = response.data;
const items = data.map((item: DataItem) => ({
  id: item.id,
  name: item.name
}));
```

### Fix Strategy
1. Create proper TypeScript interfaces for data structures
2. Replace `any` with specific types
3. Use type assertions with `as` when necessary
4. For arrays: Use `const` assertions or proper array types

**Priority:** 🟡 **HIGH**  
**Estimated Time:** 1.5 hours (3 min per error)


---

## 🟡 Category 4: Impure Function Calls in Render (10 errors)

### Problem Description
Calling impure functions like `Date.now()` or `Math.random()` during render produces unstable results that update unpredictably when the component re-renders, violating React's purity rules.

### Affected Files

1. `/ui/src/app/admin/inventory/page.tsx` - Lines 1120, 1230
   - Error: `Date.now()` called during render

2. `/ui/src/app/admin/deliveries/page.tsx` - Line 75
   - Error: `Date.now()` called during render

3. `/ui/src/app/kitchen/production-plans/page.tsx` - (line TBD)
   - Error: `Date.now()` called during render

4. `/ui/src/app/super-admin/reports/page.tsx` - Line 42
   - Error: `Date.now()` called during render

5. `/ui/src/components/admin/bar/PendingDrinkList.tsx` - Line 59
   - Error: `Date.now()` called during render

6. `/ui/src/components/hr/TrainingTracking.tsx` - Line 138
   - Error: `Math.random()` called during render

### Solution Pattern

**❌ BEFORE (BROKEN):**
```typescript
export default function Component() {
  const currentTime = Date.now(); // Impure function in render
  const randomId = Math.random(); // Impure function in render
  
  return <div>Time: {currentTime}</div>;
}
```

**✅ AFTER (FIXED - Option 1: Use state):**
```typescript
export default function Component() {
  const [currentTime] = useState(() => Date.now());
  const [randomId] = useState(() => Math.random());
  
  return <div>Time: {currentTime}</div>;
}
```

**✅ AFTER (FIXED - Option 2: Use useMemo):**
```typescript
export default function Component() {
  const currentTime = useMemo(() => Date.now(), []);
  const randomId = useMemo(() => Math.random(), []);
  
  return <div>Time: {currentTime}</div>;
}
```

**✅ AFTER (FIXED - Option 3: Use useEffect for updating values):**
```typescript
export default function Component() {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <div>Time: {currentTime}</div>;
}
```

### Fix Strategy
1. Move impure function calls to `useState` initializer
2. Use `useMemo` to memoize the result
3. Or use `useEffect` if the value needs to update over time

**Priority:** 🟡 **HIGH**  
**Estimated Time:** 30 minutes (3 min per error)

---

## 🟢 Category 5: Other Issues (5 errors)

### 5.1 Unescaped Entities (3 errors)

**Files Affected:**
1. `/ui/src/app/admin/inventory/page.tsx` - Lines 560, 742
2. `/ui/src/app/admin/deliveries/page.tsx` - Line 465 (2 instances)
3. `/ui/src/app/cashier/profile/page.tsx` - Line 111
4. `/ui/src/app/dispatcher/login/page.tsx` - Line 4
5. `/ui/src/app/kitchen/page.tsx` - Line 402
6. `/ui/src/app/kitchen/recipes/page.tsx` - Lines 449 (2 instances)
7. `/ui/src/app/kitchen/stock/page.tsx` - Line 320
8. `/ui/src/app/super-admin/login/page.tsx` - Line 99
9. `/ui/src/app/super-admin/reports/page.tsx` - Line 448

**Problem:**
Apostrophes and quotes not properly escaped in JSX.

**Solution:**
```typescript
// ❌ BEFORE
<div>Don't do this</div>

// ✅ AFTER (Option 1)
<div>Don&apos;t do this</div>

// ✅ AFTER (Option 2)
<div>{"Don't do this"}</div>
```

### 5.2 Unused Variables (warnings, non-blocking)

**Files Affected:**
1. `/ui/src/app/admin/inventory/page.tsx` - Lines 639 (onApprove, onReject), 1539, 1556
2. `/ui/src/app/kitchen/recipes/upload/page.tsx` - Lines 71 (user, authLoading)
3. `/ui/src/app/kitchen/stock/page.tsx` - Line 79 (loading)

**Solution:** Remove or use the variables

### 5.3 Const Instead of Let (1 error)

**Files Affected:**
1. `/ui/src/app/admin/bar/page.tsx` - Line 34 (endDate)
2. `/ui/src/app/admin/production/components/ProductionScheduler.tsx` - Line 130 (queryParams)
3. `/ui/src/app/manager/bar/page.tsx` - Line 34 (endDate)
4. `/ui/src/app/manager/sales/page.tsx` - Line 27 (endDate)

**Solution:** Change `let` to `const` if variable is never reassigned

### 5.4 Wrong HTML Element (1 error)

**Files Affected:**
1. `/ui/src/app/super-admin/reports/page.tsx` - Line 800
   - Using `<a>` instead of Next.js `<Link>`

**Solution:**
```typescript
// ❌ BEFORE
<a href="/kitchen/recipes/">View</a>

// ✅ AFTER
<Link href="/kitchen/recipes/">View</Link>
```

**Priority:** 🟢 **LOW**  
**Estimated Time:** 30 minutes

---

## 📊 Fix Priority Matrix

### Critical Path (Must Fix for Production)

| Priority | Category | Errors | Time | Impact |
|----------|----------|--------|------|--------|
| **1** | setState in useEffect | 25 | 2h | 🔴 Blocks build |
| **2** | React Hooks Violations | 20 | 1.5h | 🔴 Blocks build |
| **3** | TypeScript any Types | 30 | 1.5h | 🟡 Build warnings |
| **4** | Impure Functions | 10 | 0.5h | 🟡 Build warnings |
| **5** | Other Issues | 5 | 0.5h | 🟢 Minor issues |

### Recommended Fix Order

#### Phase 1: Critical Errors (3.5 hours)
1. **Fix setState in useEffect** (2 hours)
   - Start with Admin module (10 errors)
   - Then Kitchen module (5 errors)
   - Then remaining modules (10 errors)

2. **Fix React Hooks Violations** (1.5 hours)
   - Start with Admin module (8 errors)
   - Then Kitchen module (5 errors)
   - Then profile pages (7 errors)

#### Phase 2: High Priority (2 hours)
3. **Fix TypeScript any Types** (1.5 hours)
   - Create interfaces for common data structures
   - Fix Admin module (15 errors)
   - Fix Kitchen module (8 errors)
   - Fix remaining modules (7 errors)

4. **Fix Impure Function Calls** (0.5 hours)
   - Quick fixes using useState or useMemo

#### Phase 3: Cleanup (0.5 hours)
5. **Fix Other Issues** (0.5 hours)
   - Escape entities
   - Remove unused variables
   - Change let to const

**Total Estimated Time:** 6 hours


---

## 🔧 Module-by-Module Breakdown

### Admin Module (35 errors - 39% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| approvals/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| assets/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| bar/page.tsx | 1 | 0 | 3 | 0 | 1 | 5 |
| cms/page.tsx | 1 | 2 | 0 | 0 | 0 | 3 |
| customers/page.tsx | 1 | 0 | 2 | 0 | 0 | 3 |
| deliveries/page.tsx | 0 | 0 | 0 | 1 | 2 | 3 |
| inventory/page.tsx | 1 | 0 | 6 | 2 | 3 | 12 |
| orders/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| payments/page.tsx | 0 | 0 | 5 | 0 | 0 | 5 |
| pricing-control/* | 2 | 1 | 0 | 0 | 0 | 3 |
| production/* | 1 | 1 | 0 | 0 | 1 | 3 |
| staff/page.tsx | 2 | 1 | 0 | 0 | 0 | 3 |
| **ADMIN TOTAL** | **12** | **5** | **16** | **3** | **7** | **35** |

**Priority:** 🔴 **HIGHEST** - Most errors concentrated here  
**Estimated Fix Time:** 3 hours

---

### Kitchen Module (20 errors - 22% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| page.tsx | 1 | 0 | 1 | 0 | 1 | 3 |
| production-plans/page.tsx | 1 | 1 | 0 | 1 | 0 | 3 |
| recipes/page.tsx | 1 | 1 | 1 | 0 | 2 | 5 |
| recipes/upload/page.tsx | 0 | 0 | 0 | 0 | 2 | 2 |
| reports/page.tsx | 0 | 1 | 16 | 0 | 0 | 17 |
| stock/page.tsx | 1 | 0 | 1 | 0 | 2 | 4 |
| waste/page.tsx | 1 | 0 | 2 | 0 | 0 | 3 |
| **KITCHEN TOTAL** | **5** | **3** | **21** | **1** | **7** | **20** |

**Priority:** 🔴 **HIGH**  
**Estimated Fix Time:** 1.5 hours

**Note:** Kitchen reports page has 16 any type errors - needs significant refactoring

---

### Manager Module (10 errors - 11% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| bar/page.tsx | 1 | 0 | 3 | 0 | 1 | 5 |
| profile/page.tsx | 0 | 2 | 0 | 0 | 0 | 2 |
| reports/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| sales/page.tsx | 1 | 0 | 1 | 0 | 1 | 3 |
| **MANAGER TOTAL** | **3** | **2** | **4** | **0** | **2** | **10** |

**Priority:** 🟡 **MEDIUM**  
**Estimated Fix Time:** 45 minutes

---

### HR Module (10 errors - 11% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| dashboard/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| components/* | 2 | 0 | 4 | 1 | 0 | 7 |
| **HR TOTAL** | **3** | **0** | **4** | **1** | **0** | **10** |

**Priority:** 🟡 **MEDIUM**  
**Estimated Fix Time:** 45 minutes

---

### Cashier Module (5 errors - 6% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| dashboard/page.tsx | 0 | 0 | 7 | 0 | 0 | 7 |
| orders/page.tsx | 1 | 0 | 0 | 0 | 0 | 1 |
| payments/page.tsx | 0 | 0 | 5 | 0 | 0 | 5 |
| profile/page.tsx | 0 | 1 | 0 | 0 | 1 | 2 |
| **CASHIER TOTAL** | **1** | **1** | **12** | **0** | **1** | **5** |

**Priority:** 🟢 **MEDIUM**  
**Estimated Fix Time:** 30 minutes

---

### Dispatcher Module (5 errors - 6% of total)

| File | setState | Hooks | any Types | Impure | Other | Total |
|------|----------|-------|-----------|--------|-------|-------|
| page.tsx | 1 | 0 | 2 | 0 | 0 | 3 |
| login/page.tsx | 0 | 0 | 0 | 0 | 1 | 1 |
| profile/page.tsx | 0 | 1 | 0 | 0 | 0 | 1 |
| **DISPATCHER TOTAL** | **1** | **1** | **2** | **0** | **1** | **5** |

**Priority:** 🟢 **MEDIUM**  
**Estimated Fix Time:** 30 minutes

---

### Other Modules (5 errors - 6% of total)

| Module | File | Errors | Priority |
|--------|------|--------|----------|
| Super-admin | pricing/page.tsx | 1 | 🟢 Low |
| Super-admin | reports/page.tsx | 2 | 🟢 Low |
| Super-admin | login/page.tsx | 1 | 🟢 Low |
| Bar | profile/page.tsx | 1 | 🟢 Low |
| Components | Various | 5 | 🟢 Low |

**Priority:** 🟢 **LOW**  
**Estimated Fix Time:** 30 minutes

---

## 📋 Quick Reference Checklist

### Pre-Fix Preparation
- [ ] Create feature branch: `git checkout -b fix/frontend-build-errors`
- [ ] Backup current code: `git commit -am "Backup before error fixes"`
- [ ] Review error patterns in this document
- [ ] Set up test environment for verification

### Phase 1: Critical Errors (Must Fix)
- [ ] Fix 25 setState in useEffect errors (2 hours)
  - [ ] Admin module (12 errors)
  - [ ] Kitchen module (5 errors)
  - [ ] Other modules (8 errors)
- [ ] Fix 20 React Hooks violations (1.5 hours)
  - [ ] Admin module (5 errors)
  - [ ] Kitchen module (3 errors)
  - [ ] Profile pages (7 errors)
  - [ ] Other (5 errors)

### Phase 2: High Priority (Should Fix)
- [ ] Fix 30 TypeScript any types (1.5 hours)
  - [ ] Create common interfaces
  - [ ] Admin module (16 errors)
  - [ ] Kitchen module (21 errors)
  - [ ] Other modules (12 errors)
- [ ] Fix 10 impure function calls (30 minutes)

### Phase 3: Cleanup (Nice to Have)
- [ ] Fix 5 other issues (30 minutes)
  - [ ] Escape entities
  - [ ] Remove unused variables
  - [ ] Fix const/let issues

### Verification
- [ ] Run `npm run build` - should pass
- [ ] Run `npm run lint` - check warnings
- [ ] Test critical pages manually
- [ ] Commit fixes: `git commit -am "Fix: Resolve 90 frontend build errors"`
- [ ] Push and create PR: `git push origin fix/frontend-build-errors`

---

## 🎯 Success Criteria

### Build Status
- ✅ `npm run build` completes without errors
- ✅ All TypeScript compilation errors resolved
- ✅ React hooks violations fixed
- ✅ No impure function calls in render

### Code Quality
- ✅ No `any` types in new/fixed code
- ✅ Proper error handling patterns
- ✅ Clean, maintainable code
- ✅ Consistent patterns across modules

### Testing
- ✅ All pages load without console errors
- ✅ Authentication flows work
- ✅ Role-based access functional
- ✅ No runtime errors in production build

---

## 📚 Resources

### Documentation
- **React Hooks Rules:** https://react.dev/reference/rules/rules-of-hooks
- **TypeScript Best Practices:** https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html
- **Next.js Build Errors:** https://nextjs.org/docs/messages

### Internal Documents
- **System Diagnostic 6:** `SYSTEM_DIAGNOSTIC_6.md`
- **Fix Patterns:** This document, sections 1-5
- **Backend Quality Guide:** `BACKEND_QUALITY_IMPROVEMENTS.md`

### Support
- **Questions?** Review System Diagnostic 6 for context
- **Need Help?** Check solution patterns in each category
- **Stuck?** Reference similar fixes in accountant module (already fixed)

---

## 📝 Notes

### Why These Errors Matter

1. **setState in useEffect:** Causes performance issues and can lead to memory leaks
2. **Hooks Violations:** Can cause components to not update properly
3. **TypeScript any:** Defeats type safety, can cause runtime errors
4. **Impure Functions:** Causes unpredictable re-renders and bugs
5. **Other Issues:** Code quality and best practices

### After Fixing

Once all 90 errors are fixed:
- Frontend will be production-ready
- Can proceed with load testing
- Can perform security testing
- Ready for UAT (User Acceptance Testing)
- Can deploy to production

**Current Status:** ❌ **90 errors blocking production**  
**Target Status:** ✅ **0 errors, production ready**  
**Estimated Time:** **6 hours of focused work**

---

**Document Version:** 1.0  
**Last Updated:** August 6, 2026  
**Status:** 📋 **READY FOR EXECUTION**
