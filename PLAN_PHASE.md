# Meat Lovers CIMS — Implementation Plan (Phased Approach)

**Plan Version:** 1.0  
**Created:** July 8, 2026  
**Current System Grade:** D+ (49.75%)  
**Target Grade:** A (95%+) Production Ready  
**Total Estimated Time:** 9 weeks (525 hours)  
**Resource Assumption:** 1-2 developers

---

## 📋 Executive Summary

This phased implementation plan transforms the Meat Lovers CIMS from its current **49.75%
completion** to a **production-ready system** in **9 weeks**. The plan prioritizes critical
security blockers, then feature completion, and finally quality improvements.

### Plan Overview

| Phase | Focus | Duration | Hours | Priority |
|-------|-------|----------|-------|----------|
| **Phase 1** | Critical Blockers | 3 weeks | 191h | 🔴 CRITICAL |
| **Phase 2** | Feature Completion | 4 weeks | 205h | 🟡 HIGH |
| **Phase 3** | Quality & DevOps | 2 weeks | 129h | 🟢 MEDIUM |
| **TOTAL** | | **9 weeks** | **525h** | |

### Success Criteria

**Phase 1 Complete:** System secure, builds pass, tests pass (75% target)  
**Phase 2 Complete:** All 16 features at 80%+ completion  
**Phase 3 Complete:** Production deployment ready with monitoring

---

## 🎯 Overall Goals

### Phase 1 Goals (Weeks 1-3)
- ✅ Authentication system functional for all 10 roles
- ✅ Role-based authorization on all 180+ endpoints
- ✅ Next.js build passing without errors
- ✅ Test suite at 80%+ pass rate
- ✅ Basic security hardening complete

### Phase 2 Goals (Weeks 4-7)
- ✅ All 16 features at 80%+ completion
- ✅ Manager routes complete (7 routes)
- ✅ Staff routes complete (8 routes)
- ✅ HRM module functional
- ✅ Reporting dashboard operational


### Phase 3 Goals (Weeks 8-9)
- ✅ 80%+ test coverage achieved
- ✅ Docker containers created
- ✅ CI/CD pipeline operational
- ✅ Monitoring and logging active
- ✅ Performance optimized

---

## 🔴 PHASE 1: Critical Blockers (Weeks 1-3)

**Goal:** Make system functional, secure, and buildable  
**Duration:** 3 weeks (191 hours)  
**Priority:** CRITICAL - Cannot proceed to production without this

### Week 1: Authentication Foundation (65 hours)

#### Day 1-2: Authentication API (20 hours)
**Tasks:**
1. Create `AuthController` with login/logout endpoints
2. Implement JWT token generation and validation
3. Add password hashing (bcrypt)
4. Create refresh token mechanism
5. Build password reset workflow

**Deliverables:**
- `POST /auth/login` - Returns JWT token
- `POST /auth/logout` - Invalidates token
- `POST /auth/refresh` - Refreshes access token
- `GET /auth/profile` - Returns current user
- `POST /auth/forgot-password` - Initiates reset
- `POST /auth/reset-password` - Completes reset

**Files to Create:**
```
api/src/auth/auth.controller.ts
api/src/auth/auth.service.ts
api/src/auth/dto/login.dto.ts
api/src/auth/dto/reset-password.dto.ts
api/src/auth/strategies/jwt.strategy.ts
```

**Success Criteria:**
- [ ] Login returns valid JWT for correct credentials
- [ ] Login returns 401 for incorrect credentials
- [ ] JWT expires after configured time
- [ ] Refresh token extends session
- [ ] Password reset email sent (or logged in dev)

---

#### Day 3-4: Login UI Pages (25 hours)
**Tasks:**
1. Create admin login page (`/admin/login`)
2. Create cashier login page (`/cashier/login`)
3. Create POS login page (`/pos/login`)
4. Create kitchen login page (`/kitchen/login`)
5. Create bar login page (`/bar/login`)
6. Create staff login page (`/staff/login`)
7. Implement form validation
8. Add error handling and display
9. Store JWT in secure cookies/localStorage

**Deliverables:**
- 6 role-specific login pages
- Shared `LoginForm` component
- JWT storage mechanism
- Automatic redirect after login
- "Remember me" functionality
- Password visibility toggle

**Files to Create:**
```
ui/src/app/admin/login/page.tsx
ui/src/app/cashier/login/page.tsx
ui/src/app/pos/login/page.tsx
ui/src/app/kitchen/login/page.tsx
ui/src/app/bar/login/page.tsx
ui/src/app/staff/login/page.tsx
ui/src/components/auth/LoginForm.tsx
ui/src/lib/auth.ts (JWT helpers)
ui/src/contexts/AuthContext.tsx
```

**Success Criteria:**
- [ ] Each role can login through their page
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to role dashboard
- [ ] JWT stored securely
- [ ] Logout clears JWT and redirects to login

---

#### Day 5: Authentication Integration & Testing (20 hours)
**Tasks:**
1. Add authentication guards to all pages
2. Create protected route wrappers
3. Implement auto-redirect for unauthenticated users
4. Add role-based page access control
5. Write authentication unit tests
6. Write authentication E2E tests
7. Test all login workflows end-to-end

**Deliverables:**
- Protected route middleware
- Role-based redirect logic
- 20+ authentication tests
- Integration with existing features

**Success Criteria:**
- [ ] Unauthenticated users redirected to login
- [ ] Users see only their role's pages
- [ ] Session persists across page refreshes
- [ ] Logout works from any page
- [ ] All auth tests passing


---

### Week 2: Authorization & Security (70 hours)

#### Day 1-3: Apply Role Guards (40 hours)
**Tasks:**
1. Audit all 180+ endpoints for required roles
2. Add `@Roles()` decorators to controllers
3. Implement `RolesGuard` middleware
4. Test each endpoint with different roles
5. Document role requirements per endpoint

**Endpoint Categories to Guard:**

**SUPER_ADMIN Only:**
- System configuration endpoints
- User management (create, delete)
- Pricing rules (create, modify)
- Sensitive reports

**ADMIN + MANAGER:**
- Product management
- Supplier management
- Order oversight
- Payment oversight
- Stock oversight

**MANAGER (Read-Only):**
- `/manager/*` routes
- View-only access to operational data

**STOREKEEPER:**
- Stock movements
- Purchase recording
- Inventory management

**CHEF:**
- Kitchen queue
- Recipe management
- Production execution

**BARMAN:**
- Bar queue
- Bar stock management

**WAITER:**
- POS menu
- Order creation
- Order status

**CASHIER:**
- Payment settlement
- Receipt generation

**ACCOUNTANT:**
- Financial reports
- Pricing oversight (read-only)
- Margin alerts

**DISPATCHER:**
- Delivery management
- Rider assignment

**Success Criteria:**
- [ ] All endpoints have role guards
- [ ] Unauthorized access returns 403
- [ ] Role matrix documented
- [ ] Integration tests verify access control

---

#### Day 4-5: Security Hardening (30 hours)
**Tasks:**
1. Implement soft delete across all models
2. Add audit logging for critical actions
3. Implement input validation (class-validator)
4. Add rate limiting (Throttler)
5. Implement CSRF protection
6. Add security headers (Helmet)
7. Sanitize user inputs
8. Add SQL injection protection checks
9. Implement XSS prevention

**Models Requiring Soft Delete:**
- Supplier
- Product
- StockItem
- Order
- Payment
- Customer
- Delivery
- Recipe
- ProductionPlan
- User

**Critical Actions Requiring Audit:**
- User login/logout
- Product price changes
- Order cancellations
- Payment refunds
- Stock adjustments
- Supplier status changes
- Delivery status changes

**Deliverables:**
- `deleted_at` field added to all models
- Migration script for soft delete
- `AuditLog` model and service
- Rate limiting configured
- Security middleware active
- Input validation on all DTOs

**Files to Modify:**
```
api/prisma/schema.prisma (add deleted_at fields)
api/prisma/migrations/[timestamp]_add_soft_delete.sql
api/src/common/decorators/audit-log.decorator.ts
api/src/common/guards/throttler.guard.ts
api/src/common/interceptors/logging.interceptor.ts
```

**Success Criteria:**
- [ ] Soft delete prevents data loss
- [ ] Audit log captures critical actions
- [ ] Rate limiting blocks rapid requests
- [ ] Security headers present in responses
- [ ] Input validation rejects malformed data


---

### Week 3: Fix Build & Tests (56 hours)

#### Day 1: Fix Next.js Build Errors (6 hours)
**Tasks:**
1. Fix `admin/cms/page.tsx` - Move setState out of useEffect
2. Fix `admin/delivery-tracking/page.tsx` - Move loadData declaration
3. Fix `admin/dispatch/page.tsx` - Move loadData declaration
4. Fix `admin/production-plans/page.tsx` - Move loadData declaration
5. Fix `admin/payments/page.tsx` - Remove any types
6. Fix `bar/page.tsx` - Remove any types, escape quotes

**Before:**
```typescript
useEffect(() => {
  const fetchData = async () => { ... }
  fetchData();
}, []);
```

**After:**
```typescript
const fetchData = useCallback(async () => { ... }, []);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Success Criteria:**
- [ ] `npm run build` succeeds with no errors
- [ ] All TypeScript types properly defined
- [ ] ESLint passes with no errors
- [ ] Build output optimized

---

#### Day 2-3: Fix Failing Unit Tests (25 hours)
**Tasks:**
1. Fix OrdersService tests - Mock RecipesService
2. Fix ProductionPlansService tests - Update expectations
3. Add missing service mocks across test suite
4. Write tests for authentication module
5. Write tests for authorization guards
6. Achieve 80% unit test coverage

**Specific Fixes:**

**OrdersService Tests:**
```typescript
// In orders.service.spec.ts
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrdersService,
      {
        provide: RecipesService,
        useValue: {
          findOne: jest.fn(),
          validateIngredients: jest.fn(),
        },
      },
      // ... other providers
    ],
  }).compile();
});
```

**ProductionPlansService Tests:**
```typescript
// Update expectations to match actual implementation
expect(result.stockMovementReason).toBe('PRODUCTION_CONSUMPTION');
// instead of
expect(result.reason).toBe('production');
```

**Success Criteria:**
- [ ] All 65 unit tests passing
- [ ] No mocking errors
- [ ] Test coverage at 80%+
- [ ] Fast test execution (<30 seconds)

---

#### Day 4-5: Fix E2E Tests (25 hours)
**Tasks:**
1. Fix database cleanup script
2. Rewrite cleanup to handle FK constraints
3. Add proper test data seeding
4. Fix 137 failing E2E tests
5. Add E2E tests for authentication
6. Add E2E tests for authorization
7. Ensure all E2E tests pass consistently

**Database Cleanup Fix:**
```typescript
// In test setup
async function cleanDatabase() {
  // Disable FK checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
  
  // Delete in correct order
  await prisma.priceChangeAuditTrail.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.stockMovement.deleteMany();
  // ... other tables
  await prisma.user.deleteMany();
  
  // Re-enable FK checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
}
```

**Success Criteria:**
- [ ] All 166 E2E tests passing
- [ ] Database cleanup works consistently
- [ ] Tests run in isolation
- [ ] No flaky tests
- [ ] E2E test coverage at 70%+

---

### Phase 1 Completion Checklist

**Authentication:**
- [ ] Login works for all 10 roles
- [ ] JWT tokens issued and validated
- [ ] Session management functional
- [ ] Password reset working

**Authorization:**
- [ ] Role guards on all 180+ endpoints
- [ ] Unauthorized access blocked
- [ ] Role matrix documented

**Security:**
- [ ] Soft delete implemented
- [ ] Audit logging active
- [ ] Input validation working
- [ ] Rate limiting configured
- [ ] Security headers present

**Build & Tests:**
- [ ] Next.js build passes
- [ ] All 65 unit tests pass
- [ ] All 166 E2E tests pass
- [ ] 80% test coverage achieved

**Metrics:**
- System Completion: 59% → 75%
- Security Score: 15% → 85%
- Test Pass Rate: 33% → 95%
- Build Status: ❌ → ✅

---

## 🟡 PHASE 2: Feature Completion (Weeks 4-7)

**Goal:** Complete all 16 features to 80%+ and add missing routes  
**Duration:** 4 weeks (205 hours)  
**Priority:** HIGH - Required for full system functionality


### Week 4: Manager Routes (40 hours)

#### Manager Routes Implementation
**Status:** 2/7 complete (manager/cms ✅, manager/products ✅)

**Remaining Routes to Build:**

**1. /manager/suppliers (8 hours)**
- View supplier list and details
- View supplier orders history
- View supplier contact information
- Search and filter suppliers
- NO create/edit/delete capabilities

**2. /manager/stock (6 hours)**
- View stock levels across locations
- View stock movements
- View reorder alerts
- View stock valuation
- NO stock adjustment capabilities

**3. /manager/orders (8 hours)**
- View all orders
- View order details and history
- Filter by status, date, table
- View order statistics
- NO order modification

**4. /manager/payments (6 hours)**
- View payment logs
- View payment summaries
- Filter by method, date, status
- View payment analytics
- NO payment processing

**5. /manager/finance (8 hours)**
- View revenue reports
- View expense reports
- View P&L summary
- View financial trends
- NO transaction creation

**6. /manager Dashboard (4 hours)**
- Operational overview
- Key metrics display
- Alert notifications
- Quick navigation

**Implementation Pattern (each route):**
```typescript
// API Controller
@Controller('manager/[module]')
@UseGuards(JwtAuthGuard)
export class Manager[Module]Controller {
  @Get()
  @Roles(Role.MANAGER)
  async findAll() { /* read-only access */ }
  
  @Get(':id')
  @Roles(Role.MANAGER)
  async findOne() { /* view details */ }
}

// UI Page
export default function Manager[Module]Page() {
  // Reuse admin components but remove action buttons
  return <[Module]View readOnly={true} />;
}
```

**Success Criteria:**
- [ ] All 7 manager routes functional
- [ ] Read-only access enforced
- [ ] Manager cannot perform write operations
- [ ] Navigation shows only manager-accessible routes
- [ ] Breadcrumbs reflect manager context

---

### Week 5: Staff & Operational Routes (40 hours)

#### Staff-Specific Routes

**1. /storekeeper/suppliers (6 hours)**
- View supplier directory
- View supplier contact info
- View supplier order history
- Read-only access

**2. /accountant/pricing (8 hours)**
- View pricing rules
- View margin alerts
- Review price change history
- Read-only access

**3. /accountant/suppliers (4 hours)**
- View supplier financial info
- View payment terms
- View supplier invoices
- Read-only access

**4. /cashier/orders (6 hours)**
- View unsettled orders
- Process payments
- Generate receipts
- Close orders

**5. /staff Dashboard (4 hours)**
- Role-specific workspace
- Pending tasks
- Quick actions
- Contextual alerts

#### Operational Login Pages (12 hours)
- Super Admin login page
- Enhanced role detection
- Session management
- Auto-redirect to correct workspace

**Success Criteria:**
- [ ] All staff routes functional
- [ ] Role-specific data filtering
- [ ] Proper access controls
- [ ] Login pages for all roles
- [ ] Auto-redirect working

---

### Week 6: Missing Features - HRM Module (45 hours)

#### HRM Module Implementation (Feature 15)

**Database Models (8 hours):**
```prisma
model StaffShift {
  id         BigInt   @id @default(autoincrement())
  user_id    BigInt
  shift_date DateTime
  start_time DateTime
  end_time   DateTime
  status     ShiftStatus
  user       User     @relation(fields: [user_id], references: [id])
}

model StaffAttendance {
  id          BigInt   @id @default(autoincrement())
  user_id     BigInt
  date        DateTime
  clock_in    DateTime?
  clock_out   DateTime?
  status      AttendanceStatus
  user        User     @relation(fields: [user_id], references: [id])
}

model DutyRoster {
  id         BigInt   @id @default(autoincrement())
  week_start DateTime
  week_end   DateTime
  created_by BigInt
  status     RosterStatus
}
```

**API Implementation (20 hours):**
- Staff shift management endpoints
- Attendance tracking endpoints
- Duty roster endpoints
- Payroll placeholder endpoints
- Absence reporting endpoints

**UI Implementation (17 hours):**
- Shift scheduling calendar
- Attendance clock-in page
- Duty roster management
- Staff performance dashboard
- Absence reporting forms

**Success Criteria:**
- [ ] Staff can clock in/out
- [ ] Managers can create rosters
- [ ] Attendance tracked automatically
- [ ] Shift schedules visible
- [ ] Absence requests captured

---

### Week 7: Remaining Features (80 hours)

#### Asset Management Module (30 hours)

**Database Models:**
```prisma
model Asset {
  id               BigInt   @id @default(autoincrement())
  asset_name       String
  asset_type       AssetType
  purchase_date    DateTime
  purchase_cost    Decimal
  current_value    Decimal
  depreciation_rate Decimal
  status           AssetStatus
  location         String?
}

model AssetMaintenance {
  id             BigInt   @id @default(autoincrement())
  asset_id       BigInt
  maintenance_date DateTime
  cost           Decimal
  description    String
  performed_by   BigInt
}
```

**Features:**
- Asset registry
- Depreciation tracking
- Maintenance scheduling
- Asset valuation reports

#### Approvals & Enforcement (35 hours)

**Database Models:**
```prisma
model ApprovalRequest {
  id           BigInt   @id @default(autoincrement())
  request_type ApprovalType
  entity_type  String
  entity_id    BigInt
  requested_by BigInt
  approved_by  BigInt?
  status       ApprovalStatus
  reason       String?
  created_at   DateTime @default(now())
}

model StaffIncident {
  id          BigInt   @id @default(autoincrement())
  user_id     BigInt
  incident_type String
  severity    IncidentSeverity
  date        DateTime
  description String
  action_taken String?
}
```

**Features:**
- Multi-level approval workflows
- Security override logging
- Incident tracking
- Risk scoring system

#### Reporting Dashboard Enhancement (15 hours)

**Features:**
- Financial reports (P&L, Balance Sheet)
- Sales analytics (trends, patterns)
- Inventory reports (turnover, aging)
- Staff performance metrics
- Customer analytics
- Operational KPIs

**Success Criteria:**
- [ ] Asset management functional
- [ ] Approval workflows working
- [ ] Incident tracking active
- [ ] Comprehensive reports available
- [ ] All 16 features at 80%+

---

### Phase 2 Completion Checklist

**Manager Routes:**
- [ ] All 7 manager routes complete
- [ ] Read-only access enforced
- [ ] Manager dashboard functional

**Staff Routes:**
- [ ] 5 staff-specific routes complete
- [ ] Role-based data filtering
- [ ] All login pages functional

**HRM Module:**
- [ ] Shift management working
- [ ] Attendance tracking active
- [ ] Duty rosters functional
- [ ] Performance metrics tracked

**Asset Management:**
- [ ] Asset registry complete
- [ ] Depreciation tracking working
- [ ] Maintenance scheduling active

**Approvals:**
- [ ] Approval workflows functional
- [ ] Incident tracking working
- [ ] Risk scoring implemented

**Reporting:**
- [ ] Financial reports available
- [ ] Sales analytics working
- [ ] Operational KPIs displayed

**Metrics:**
- System Completion: 75% → 88%
- Feature Coverage: 12/16 → 16/16
- Route Coverage: 60% → 95%

---

## 🟢 PHASE 3: Quality & DevOps (Weeks 8-9)

**Goal:** Production deployment ready with quality assurance  
**Duration:** 2 weeks (129 hours)  
**Priority:** MEDIUM - Polish and operational readiness


### Week 8: Testing & Quality Assurance (70 hours)

#### Day 1-2: Unit Test Coverage (30 hours)

**Goal:** Achieve 80% unit test coverage

**Modules Requiring Tests:**
1. Authentication module (new)
2. Authorization guards (new)
3. HRM module (new)
4. Asset management (new)
5. Approvals system (new)
6. Manager routes (new)
7. Enhanced existing tests

**Testing Strategy:**
```typescript
// Example: HRM Module Tests
describe('ShiftService', () => {
  describe('createShift', () => {
    it('should create shift with valid data');
    it('should throw error for overlapping shifts');
    it('should enforce shift duration limits');
  });
  
  describe('findShifts', () => {
    it('should return user shifts');
    it('should filter by date range');
    it('should include attendance data');
  });
});
```

**Coverage Targets:**
- Services: 85%
- Controllers: 80%
- Guards: 90%
- Utilities: 75%

**Success Criteria:**
- [ ] 80%+ overall code coverage
- [ ] All critical paths tested
- [ ] Edge cases covered
- [ ] Mock dependencies properly
- [ ] Tests run in <60 seconds

---

#### Day 3-4: Integration Testing (20 hours)

**Goal:** Add comprehensive integration tests

**Test Scenarios:**
1. Complete order flow (creation → kitchen → bar → payment)
2. Stock purchase → transfer → usage workflow
3. Authentication → authorization → data access
4. Approval request → review → resolution
5. Shift creation → attendance → payroll data
6. Delivery creation → dispatch → completion

**Example Integration Test:**
```typescript
describe('Order Complete Flow (E2E)', () => {
  it('should handle full order lifecycle', async () => {
    // 1. Waiter creates order
    const order = await createOrder(waiterToken, orderData);
    
    // 2. Kitchen marks items preparing
    await updateKitchenStatus(chefToken, order.id, 'PREPARING');
    
    // 3. Bar marks drinks ready
    await updateBarStatus(barmanToken, order.id, 'READY');
    
    // 4. Waiter marks served
    await updateOrderStatus(waiterToken, order.id, 'SERVED');
    
    // 5. Cashier processes payment
    const payment = await processPayment(cashierToken, order.id);
    
    // 6. Verify order closed
    expect(payment.status).toBe('SUCCESS');
    expect(order.status).toBe('PAID');
  });
});
```

**Success Criteria:**
- [ ] 20+ integration test scenarios
- [ ] All major workflows tested
- [ ] Cross-module interactions verified
- [ ] Database transactions tested
- [ ] Tests pass consistently

---

#### Day 5: Performance Testing (20 hours)

**Goal:** Identify and fix performance bottlenecks

**Load Testing Scenarios:**
1. 100 concurrent users on POS
2. 1000 products in catalog
3. 10,000 orders in system
4. 50 concurrent kitchen queue updates
5. 20 concurrent payment settlements

**Performance Optimization Tasks:**
1. Add database query optimization
2. Implement pagination on all list endpoints
3. Add caching for static data
4. Optimize N+1 queries
5. Add database indexes
6. Compress API responses
7. Optimize bundle size

**Tools:**
- Artillery for load testing
- Lighthouse for UI performance
- Prisma query analysis
- React DevTools Profiler

**Performance Targets:**
- API response time: <200ms (p95)
- Page load time: <2s
- Time to interactive: <3s
- Database query time: <50ms
- Bundle size: <500KB

**Success Criteria:**
- [ ] All endpoints respond <200ms
- [ ] UI loads <2 seconds
- [ ] No N+1 query issues
- [ ] Pagination implemented
- [ ] Caching working

---

### Week 9: DevOps & Deployment (59 hours)

#### Day 1-2: Docker Containerization (20 hours)

**Containers to Create:**

**1. API Container (Dockerfile.api):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main"]
```

**2. UI Container (Dockerfile.ui):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3001
CMD ["npm", "start"]
```

**3. Docker Compose (docker-compose.yml):**
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: meatlovers
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: mysql://root:${DB_PASSWORD}@db:3306/meatlovers
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - db

  ui:
    build:
      context: ./ui
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:3000
    ports:
      - "3001:3001"
    depends_on:
      - api

volumes:
  db_data:
```

**Success Criteria:**
- [ ] API container builds successfully
- [ ] UI container builds successfully
- [ ] Docker compose brings up stack
- [ ] Containers communicate properly
- [ ] Environment variables configured

---

#### Day 3: CI/CD Pipeline (15 hours)

**GitHub Actions Workflow (.github/workflows/ci.yml):**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install API dependencies
        working-directory: ./api
        run: npm ci
      
      - name: Run API tests
        working-directory: ./api
        run: npm test
      
      - name: Run E2E tests
        working-directory: ./api
        run: npm run test:e2e
      
      - name: Install UI dependencies
        working-directory: ./ui
        run: npm ci
      
      - name: Build UI
        working-directory: ./ui
        run: npm run build

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t meatlovers-api ./api
          docker build -t meatlovers-ui ./ui
      
      - name: Push to registry
        run: |
          # Push to Docker Hub or AWS ECR
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # SSH to server and pull latest images
```

**Success Criteria:**
- [ ] Tests run on every push
- [ ] Build fails on test failure
- [ ] Docker images built automatically
- [ ] Deployment automated
- [ ] Rollback strategy defined

---

#### Day 4: Monitoring & Logging (12 hours)

**Monitoring Stack:**

**1. Application Logging:**
```typescript
// api/src/common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} ${responseTime}ms`);
      }),
    );
  }
}
```

**2. Error Tracking (Sentry):**
```typescript
// api/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**3. Health Checks:**
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }
  
  @Get('db')
  async checkDb() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { database: 'connected' };
  }
}
```

**4. Metrics Dashboard:**
- Request rate
- Error rate
- Response times (p50, p95, p99)
- Database query times
- Active users
- System resources (CPU, Memory)

**Success Criteria:**
- [ ] Application logs centralized
- [ ] Error tracking active
- [ ] Health endpoints working
- [ ] Metrics dashboard live
- [ ] Alerts configured

---

#### Day 5: Performance Optimization (12 hours)

**Optimization Tasks:**

**1. Database Optimization:**
- Add missing indexes
- Optimize slow queries
- Implement connection pooling
- Add query result caching

**2. API Optimization:**
- Enable gzip compression
- Implement response caching
- Add CDN for static assets
- Optimize payload sizes

**3. UI Optimization:**
- Code splitting by route
- Lazy load components
- Optimize images
- Reduce bundle size
- Enable service worker

**4. Infrastructure:**
- Enable horizontal scaling
- Configure load balancer
- Set up Redis cache
- Optimize database configuration

**Success Criteria:**
- [ ] All optimization tasks complete
- [ ] Performance targets met
- [ ] Load testing passes
- [ ] No performance regressions

---

### Phase 3 Completion Checklist

**Testing:**
- [ ] 80% unit test coverage
- [ ] 20+ integration tests
- [ ] Performance tests passing
- [ ] Load testing complete

**DevOps:**
- [ ] Docker containers working
- [ ] CI/CD pipeline operational
- [ ] Automated deployments
- [ ] Rollback procedure tested

**Monitoring:**
- [ ] Application logging active
- [ ] Error tracking configured
- [ ] Health checks working
- [ ] Metrics dashboard live

**Performance:**
- [ ] All targets met
- [ ] No bottlenecks
- [ ] Caching implemented
- [ ] Optimizations complete

**Metrics:**
- System Completion: 88% → 95%+
- Test Coverage: 80% → 85%
- Performance Score: C- → A
- Deployment Ready: ❌ → ✅

---

## 📊 Progress Tracking

### Weekly Milestones

| Week | Phase | Milestone | Success Metric |
|------|-------|-----------|----------------|
| 1 | Phase 1 | Authentication complete | All roles can login |
| 2 | Phase 1 | Authorization complete | All endpoints secured |
| 3 | Phase 1 | Build & tests fixed | 95% tests passing |
| 4 | Phase 2 | Manager routes complete | 7/7 routes working |
| 5 | Phase 2 | Staff routes complete | All staff access working |
| 6 | Phase 2 | HRM module complete | Staff management functional |
| 7 | Phase 2 | All features complete | 16/16 at 80%+ |
| 8 | Phase 3 | Testing complete | 85% coverage |
| 9 | Phase 3 | Deployment ready | Production deployed |


### Daily Standup Template

**What was completed yesterday:**
- Task 1
- Task 2

**What will be done today:**
- Task 1
- Task 2

**Blockers:**
- Issue 1
- Issue 2

**Risks:**
- Risk 1
- Risk 2

---

## 🎯 Success Metrics & KPIs

### System Health Metrics

| Metric | Current | Phase 1 | Phase 2 | Phase 3 | Target |
|--------|---------|---------|---------|---------|--------|
| **System Completion** | 49.75% | 75% | 88% | 95% | 95%+ |
| **Security Score** | 15% | 85% | 90% | 95% | 95%+ |
| **Test Coverage** | 20% | 80% | 82% | 85% | 85%+ |
| **Test Pass Rate** | 33% | 95% | 96% | 98% | 98%+ |
| **Feature Coverage** | 12/16 | 12/16 | 16/16 | 16/16 | 16/16 |
| **Route Coverage** | 60% | 70% | 95% | 98% | 98%+ |
| **Performance Score** | D+ | C+ | B+ | A | A |
| **Build Status** | ❌ Fail | ✅ Pass | ✅ Pass | ✅ Pass | ✅ Pass |
| **Deployment Ready** | ❌ No | ⚠️ Partial | ⚠️ Staging | ✅ Yes | ✅ Yes |

### Quality Gates

**Phase 1 Quality Gate:**
- [ ] All authentication tests passing
- [ ] All authorization tests passing
- [ ] Next.js build successful
- [ ] 95% tests passing
- [ ] Zero critical security issues

**Phase 2 Quality Gate:**
- [ ] All 16 features at 80%+
- [ ] All manager routes functional
- [ ] All staff routes functional
- [ ] Integration tests passing
- [ ] No regression bugs

**Phase 3 Quality Gate:**
- [ ] 85% test coverage
- [ ] Performance targets met
- [ ] Docker deployment working
- [ ] CI/CD pipeline operational
- [ ] Production ready

---

## 🚨 Risk Management

### Identified Risks

#### High-Risk Items

**1. Authentication Complexity (HIGH)**
- **Risk:** 10 different role workflows may have edge cases
- **Mitigation:** Thorough testing, progressive rollout per role
- **Contingency:** Rollback plan, emergency auth bypass for admin

**2. Data Migration (MEDIUM)**
- **Risk:** Soft delete migration may affect existing data
- **Mitigation:** Backup database before migration, test on staging
- **Contingency:** Rollback script prepared

**3. Performance Degradation (MEDIUM)**
- **Risk:** New features may slow down system
- **Mitigation:** Continuous performance monitoring, load testing
- **Contingency:** Feature flags to disable problematic features

**4. Timeline Slippage (MEDIUM)**
- **Risk:** 525 hours may be underestimated
- **Mitigation:** Daily progress tracking, early problem detection
- **Contingency:** Prioritize critical features, defer nice-to-haves

#### Risk Response Plan

| Risk | Probability | Impact | Response Strategy |
|------|-------------|--------|-------------------|
| Auth complexity | 60% | High | Extra testing time |
| Data migration | 40% | High | Staging environment testing |
| Performance issues | 50% | Medium | Performance budget tracking |
| Timeline slippage | 70% | Medium | Buffer time in Phase 3 |
| Third-party dependency | 30% | Low | Version pinning |

---

## 👥 Resource Allocation

### Recommended Team Structure

**Option 1: Single Developer (9 weeks)**
- Full-stack developer
- Must be proficient in NestJS, Next.js, Prisma
- Self-directed and experienced

**Option 2: Two Developers (5-6 weeks)**
- **Developer 1 (Backend Focus):**
  - Phase 1: Authentication API, Role guards
  - Phase 2: HRM module, Approvals
  - Phase 3: Testing, DevOps
  
- **Developer 2 (Frontend Focus):**
  - Phase 1: Login pages, Build fixes
  - Phase 2: Manager routes, Staff routes
  - Phase 3: UI optimization, Integration tests

**Option 3: Three Developers (4 weeks)**
- **Developer 1 (Backend):** APIs, Security
- **Developer 2 (Frontend):** UI, Routes
- **Developer 3 (DevOps):** Testing, CI/CD, Deployment

### Skill Requirements

**Must Have:**
- NestJS / Express.js
- Next.js / React
- Prisma ORM
- TypeScript
- MySQL
- Jest testing
- Docker

**Nice to Have:**
- CI/CD (GitHub Actions)
- AWS/Cloud deployment
- Security best practices
- Performance optimization

---

## 💡 Quick Wins (Optional Parallel Tasks)

These can be done alongside main phases for early value:

**Week 1-2:**
- [ ] Add loading skeletons to all pages (4h)
- [ ] Implement toast notifications (3h)
- [ ] Add error boundaries (4h)
- [ ] Create reusable UI components library (8h)

**Week 3-4:**
- [ ] Add data export (CSV/Excel) features (6h)
- [ ] Implement print-friendly views (4h)
- [ ] Add keyboard shortcuts (4h)
- [ ] Create user onboarding tour (6h)

**Week 5-6:**
- [ ] Add dark mode toggle (4h)
- [ ] Implement notifications system (8h)
- [ ] Add search suggestions (6h)
- [ ] Create mobile-responsive improvements (8h)

**Week 7-8:**
- [ ] Add data visualization charts (10h)
- [ ] Implement advanced filters (8h)
- [ ] Create PDF report generation (8h)
- [ ] Add email notifications (6h)

---

## 📝 Documentation Requirements

### Technical Documentation

**Phase 1:**
- [ ] Authentication flow diagrams
- [ ] Role permission matrix
- [ ] Security implementation guide
- [ ] API authentication guide

**Phase 2:**
- [ ] Feature documentation (all 16)
- [ ] Route access matrix
- [ ] Database schema documentation
- [ ] Business logic documentation

**Phase 3:**
- [ ] Deployment guide
- [ ] CI/CD pipeline documentation
- [ ] Monitoring setup guide
- [ ] Troubleshooting guide

### User Documentation

- [ ] Admin user guide
- [ ] Manager user guide
- [ ] Staff user guides (per role)
- [ ] POS training manual
- [ ] Kitchen/Bar operation guides
- [ ] FAQ document

---

## 🔄 Post-Phase 3 Roadmap

### Maintenance Phase (Ongoing)

**Week 10+:**
- [ ] Bug fixes and hot patches
- [ ] User feedback incorporation
- [ ] Performance monitoring
- [ ] Security updates
- [ ] Dependency updates

### Enhancement Phase (3-6 months)

**Future Features:**
- Mobile app (React Native / Flutter)
- Advanced analytics and BI
- Third-party integrations (payment gateways, delivery services)
- AI/ML features (demand forecasting, pricing optimization)
- Multi-location support
- Franchise management
- Customer loyalty program
- Online ordering system
- Reservation system
- Marketing automation

---

## 📞 Support & Escalation

### Issue Escalation Path

**Level 1 - Developer:**
- Code bugs
- Test failures
- Build issues
- Performance problems

**Level 2 - Tech Lead:**
- Architecture decisions
- Security concerns
- Complex integrations
- Timeline adjustments

**Level 3 - Project Manager:**
- Resource allocation
- Timeline conflicts
- Priority changes
- Stakeholder communication

### Communication Plan

**Daily:**
- Standup meeting (15 minutes)
- Progress updates in tracking system

**Weekly:**
- Phase review meeting (1 hour)
- Demo to stakeholders
- Planning next week's tasks

**Per Phase:**
- Phase completion review
- Quality gate assessment
- Go/No-go decision for next phase

---

## ✅ Final Checklist for Production Deployment

### Pre-Deployment Checklist

**Security:**
- [ ] All endpoints have role guards
- [ ] JWT tokens properly configured
- [ ] Passwords hashed with bcrypt
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled

**Testing:**
- [ ] 85% test coverage achieved
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Integration tests passing
- [ ] Load testing completed
- [ ] Security testing completed
- [ ] User acceptance testing done

**Performance:**
- [ ] API response time <200ms
- [ ] Page load time <2s
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] CDN configured
- [ ] Images optimized
- [ ] Bundle size <500KB

**Infrastructure:**
- [ ] Docker containers working
- [ ] CI/CD pipeline operational
- [ ] Monitoring active
- [ ] Logging centralized
- [ ] Backups configured
- [ ] Disaster recovery plan
- [ ] Rollback procedure tested

**Documentation:**
- [ ] API documentation complete
- [ ] User guides written
- [ ] Deployment guide ready
- [ ] Troubleshooting guide available
- [ ] Architecture documented

**Compliance:**
- [ ] Data privacy reviewed
- [ ] GDPR compliance checked
- [ ] Audit logging sufficient
- [ ] Access controls documented
- [ ] Terms of service ready
- [ ] Privacy policy ready

---

## 🎓 Lessons Learned (Post-Project)

**After Phase 1:**
- What worked well?
- What could be improved?
- Timeline accuracy?
- Resource allocation effectiveness?

**After Phase 2:**
- Feature development efficiency?
- Code quality maintained?
- Technical debt introduced?
- Team collaboration?

**After Phase 3:**
- Deployment smoothness?
- Performance in production?
- User feedback?
- Areas for improvement?

---

## 📊 Budget Breakdown

### Time-Based Cost Estimate

**Assumptions:**
- Developer rate: $50/hour (adjust as needed)
- QA/Testing: Included in developer time
- DevOps: Included in developer time

| Phase | Hours | Cost (1 dev) | Cost (2 devs) | Cost (3 devs) |
|-------|-------|--------------|---------------|---------------|
| Phase 1 | 191h | $9,550 | $9,550 | $9,550 |
| Phase 2 | 205h | $10,250 | $10,250 | $10,250 |
| Phase 3 | 129h | $6,450 | $6,450 | $6,450 |
| **Total** | **525h** | **$26,250** | **$26,250** | **$26,250** |

**Additional Costs:**
- Cloud hosting: $100-500/month
- Third-party services: $50-200/month
- Domain & SSL: $50/year
- Monitoring tools: $50-100/month
- Backup storage: $20-50/month

**Total First Year:** ~$27,000 - $30,000

---

## 🎯 Conclusion

This phased implementation plan provides a clear roadmap from the current 49.75% completion
to a production-ready system at 95%+ completion. By following this structured approach:

**Phase 1 (3 weeks)** addresses critical security blockers and makes the system functional.  
**Phase 2 (4 weeks)** completes all 16 features and adds missing functionality.  
**Phase 3 (2 weeks)** ensures quality, performance, and deployment readiness.

### Key Success Factors

1. **Focus on Security First** - No shortcuts on authentication/authorization
2. **Test Everything** - Maintain 85% coverage throughout
3. **Monitor Progress Daily** - Catch issues early
4. **Quality Gates** - Don't proceed without passing criteria
5. **Documentation** - Keep it current as you build

### Next Steps

1. **Review this plan** with stakeholders
2. **Allocate resources** (developers, infrastructure)
3. **Set up project tracking** (Jira, GitHub Projects, etc.)
4. **Begin Phase 1, Week 1** - Authentication foundation
5. **Daily standups** to track progress

**Good luck with the implementation!** 🚀

---

**Plan Created:** July 8, 2026  
**Plan Version:** 1.0  
**Next Review:** End of Phase 1 (Week 3)  
**Owner:** Development Team

