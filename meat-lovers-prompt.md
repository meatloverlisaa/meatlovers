# 🥩 Meat Lovers CIMS — Master Build Prompt
**Powered by YohPal | NestJS · Next.js · PostgreSQL · Prisma · Tailwind CSS**

---

## 📁 Context Files (Always Attach to Every Session)

| File | Purpose |
|---|---|
| `features.md` | Ordered, role-classified feature list — source of truth for what gets built |
| `db.md` | Complete database schema — all 32 models and fields for Meat Lovers CIMS |
| `prompt.md` | This file — governs all build procedures, branch strategy, and commit rules |
| `AI/` directory | Requirements reference only — **never committed, never modified** |

> ⚠️ The `AI/` directory contains zip files and PDFs for UI/UX inspiration and requirements scanning only. All implementation files live outside it. Ensure `AI/` is added to `.gitignore` immediately.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS (modular, with Guards, Pipes, Interceptors) |
| UI | Next.js 14+ (App Router) |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Styling | Tailwind CSS |
| Auth | JWT + Role-based Guards |

**Roles in this system:** `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `CASHIER`, `WAITER`, `CHEF`, `STOREKEEPER`, `BARMAN`, `DISPATCHER`, `ACCOUNTANT`, `HR`

---

## 📐 Project File System (Must Be Established Before Any Feature Work Begins)

Before any feature implementation is authorised, the following scaffolding must be in place and committed:

```
/
├── apps/
│   ├── api/              # NestJS backend
│   └── web/              # Next.js frontend
├── prisma/
│   ├── schema.prisma     # Single source of DB truth
│   └── seed.ts
├── docs/
│   ├── features.md       # Feature registry
│   ├── db.md             # Full schema reference
│   └── prompt.md         # This file
├── .gitignore            # Must include: AI/, .env*, node_modules/
└── README.md
```

> 🔴 **Delete all prior implementations before beginning. User must grant explicit greenlight before any feature implementation begins.**

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Protected. Never commit directly. |
| `stable` | Merge target. A feature lands here only after full DB → API → UI completion and user greenlight. |
| `feature/[N]-[slug]` | One branch per feature — e.g. `feature/1-auth-admin-login` |

**Branch lifecycle per feature:**
```
checkout -b feature/[N]-[slug] from stable
→ implement DB → API → UI
→ all steps pass + user greenlights
→ merge to stable
→ delete feature branch
```

---

## 🔢 Feature Build Order (Strict — No Skipping, No Mixing)

Features are implemented in the exact order listed in `features.md`. Each feature is broken into three layers, always in this sequence:

```
1. DATABASE  →  2. API  →  3. UI
```

No exceptions. Authentication follows the same order. UI must reflect the style and layout patterns from the zip/PDF inspirations in the `AI/` directory.

---

## 🔄 Per-Feature Workflow (Repeat for Every Feature)

```
STEP 1   Scaffold & migrate DB for Feature [N]
STEP 2   Commit all DB/migration files individually
STEP 3   Implement API layer for Feature [N]
STEP 4   Test API (unit + integration — curl, Postman, or Jest)
STEP 5   Commit all API files individually
STEP 6   Implement UI layer for Feature [N], guided by AI/ zip/PDF inspirations
STEP 7   Test UI (manual + component-level)
STEP 8   Full integration test (DB ↔ API ↔ UI end-to-end)
STEP 9   Commit all UI files individually
STEP 10  ✅ Await explicit user greenlight → then begin Feature [N+1]
```

After each step, output a **step summary**:
- ✅ What was done
- 📦 What was committed
- ➡️ What the next step is

---

## 📋 Git Commit Rules (Strictly Enforced)

**One file per commit.** Never batch files together.

**Conventional commit format, scoped to layer:**
```
feat(db): add users table migration
feat(db): seed default roles — SUPER_ADMIN through HR
feat(api): implement POST /auth/login endpoint
feat(api): add JWT auth guard middleware
feat(ui): add admin login page
feat(ui): add role-based redirect on auth
fix(api): handle missing refresh token on login
chore(db): add index on orders.order_number
```

**Additional rules:**
- Never commit files from two different features in one commit
- Never mix layers in one commit — no `db` + `api`, no `api` + `ui`
- A layer's files are only committed after the relevant test step passes
- A feature is only considered **done** when all three layers are committed and the user has issued a greenlight

---

## 🔐 Role-Based Access Classification

All features in `features.md` are classified by role and access layer. When a feature spans multiple roles, each role's implementation is treated as a sub-feature and taken to full DB → API → UI completion before moving to the next role.

**Example — Login (Feature 1):**
```
Feature 1.1 — Admin Login          [complete] → greenlight
Feature 1.2 — Manager Login        [complete] → greenlight
Feature 1.3 — Cashier Login        [complete] → greenlight
Feature 1.4 — Waiter / POS Login   [complete] → greenlight
Feature 1.5 — Chef Login           [complete] → greenlight
Feature 1.6 — Monitoring Login     [complete] → greenlight
```

---

## 🗂️ `features.md` Entry Format

Each feature in `features.md` follows this structure:

```markdown
## Feature [N] — [Feature Name]
**Branch:** feature/[N]-[slug]
**Roles:** [roles that interact with this feature]

### [N].1 — Database
- Tables: [list]
- Migrations: [list]
- Seeds: [if any]

### [N].2 — API ([Role])
- Endpoints: [Method + path]
- Auth guard: [role required]
- Request / Response shape

### [N].3 — UI ([Role])
- Page / Component
- Route
- Access guard

### [N].4 — API ([Next Role, if applicable])
...

### [N].5 — UI ([Next Role, if applicable])
...

**Test Criteria:**
- [ ] DB migration runs cleanly
- [ ] API returns correct data and status codes
- [ ] UI renders and responds correctly
- [ ] Role guard blocks unauthorised access
- [ ] Integration: data flows correctly DB → API → UI
```

---

## 📋 Full Feature Build Order

### Feature 1 — System Foundation & Authentication
**Branch:** `feature/1-auth`
**Roles:** SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, STOREKEEPER, BARMAN, DISPATCHER, ACCOUNTANT, HR

#### 1.1 — Database
- Tables: `users`
- Migrations: create users table with all roles enum
- Seeds: seed default SUPER_ADMIN and one user per role

#### 1.2 — API (All Roles — shared auth)
- `POST /auth/login` — email/phone + password, returns JWT
- `GET /auth/profile` — returns authenticated user profile
- `POST /auth/logout`
- Auth guard middleware — role-based access enforcement

#### 1.3 — UI (ADMIN / SUPER_ADMIN)
- Admin login page → `/admin/login`
- Role-based redirect on successful auth

#### 1.4 — UI (MANAGER)
- Manager login page → `/manager/login`

#### 1.5 — UI (CASHIER)
- Cashier login page → `/cashier/login`

#### 1.6 — UI (WAITER / POS)
- POS/Waiter login page → `/pos/login`

#### 1.7 — UI (CHEF / KITCHEN)
- Kitchen login page → `/kitchen/login`

#### 1.8 — UI (MONITORING — Owner view)
- Monitoring login page → `/monitoring/login`

**Test Criteria:**
- [ ] DB migration runs cleanly, all role seeds present
- [ ] JWT issued on valid login, rejected on invalid credentials
- [ ] Each role redirects to the correct dashboard post-login
- [ ] Role guard blocks access to unauthorised routes

---

### Feature 2 — Supplier Management
**Branch:** `feature/2-suppliers`
**Roles:** ADMIN, MANAGER, STOREKEEPER

#### 2.1 — Database
- Tables: `suppliers`
- Migrations: create suppliers table

#### 2.2 — API (ADMIN / MANAGER)
- `POST /suppliers` — register new supplier
- `GET /suppliers` — list all suppliers
- `PATCH /suppliers/:id` — update supplier details
- `PATCH /suppliers/:id/status` — toggle ACTIVE/SUSPENDED

#### 2.3 — UI (ADMIN / MANAGER)
- Supplier list page → `/admin/suppliers`
- Create supplier form (modal or page)
- Status toggle control

**Test Criteria:**
- [ ] Supplier creation succeeds with valid data
- [ ] Status toggle correctly switches ACTIVE ↔ SUSPENDED
- [ ] STOREKEEPER cannot access supplier management routes

---

### Feature 3 — Product Segmentation & Pricing Control
**Branch:** `feature/3-products-pricing`
**Roles:** ADMIN, MANAGER, ACCOUNTANT

#### 3.1 — Database
- Tables: `products`, `pricing_rules`, `price_change_audit`, `margin_alerts`
- Migrations: all four tables

#### 3.2 — API (ADMIN / MANAGER)
- `POST /products` — create product (FOOD / SOFT_DRINK / ALCOHOLIC_DRINK)
- `GET /products` — list with filters by category
- `PATCH /products/:id` — update product (triggers price_change_audit)
- `DELETE /products/:id` — soft delete (is_active = false)

#### 3.3 — API (ADMIN / ACCOUNTANT)
- `POST /pricing-rules` — set minimum margin and max discount per category
- `GET /pricing-rules` — list active rules
- `GET /margin-alerts` — list open margin alerts

#### 3.4 — UI (ADMIN)
- Product management page → `/admin/products`
- Create/edit product form with category selector
- Price change triggers audit trail automatically

#### 3.5 — UI (ADMIN / ACCOUNTANT)
- Pricing rules page → `/admin/pricing`
- Margin alerts dashboard → `/admin/pricing/alerts`

**Test Criteria:**
- [ ] Price change logged in price_change_audit on every update
- [ ] Margin alert auto-created when margin drops below rule threshold
- [ ] Pricing rule correctly blocks sales below minimum margin

---

### Feature 4 — Inventory & Stock Control
**Branch:** `feature/4-stock`
**Roles:** ADMIN, MANAGER, STOREKEEPER, BARMAN

#### 4.1 — Database
- Tables: `stock_items`, `stock_movements`
- Migrations: both tables

#### 4.2 — API (ADMIN / MANAGER / STOREKEEPER)
- `GET /stock` — current stock balances
- `POST /stock/purchase` — record PURCHASE movement
- `POST /stock/adjustment` — record ADJUSTMENT movement
- `POST /stock/transfer` — record STORE_TO_KITCHEN or STORE_TO_BAR movement

#### 4.3 — API (BARMAN)
- `POST /stock/bar-sale` — record BAR_SALE movement
- `GET /stock/bar` — bar-specific stock view

#### 4.4 — UI (ADMIN / STOREKEEPER)
- Stock control page → `/admin/stock`
- Stock-in form (purchase entry)
- Current balance table with reorder alerts

#### 4.5 — UI (BARMAN)
- Bar stock issue interface → `/bar/stock`
- Departmental transfer form

**Test Criteria:**
- [ ] Stock quantities update correctly on each movement type
- [ ] Reorder level breach triggers visible alert in UI
- [ ] BARMAN cannot access store stock management routes

---

### Feature 5 — POS & Ordering System
**Branch:** `feature/5-pos-orders`
**Roles:** WAITER, CASHIER, ADMIN

#### 5.1 — Database
- Tables: `orders`, `order_items`, `customers`
- Migrations: all three tables

#### 5.2 — API (WAITER)
- `POST /orders` — create new order (table number, waiter assignment)
- `POST /orders/:id/items` — add items to order
- `PATCH /orders/:id/items/:itemId` — update item quantity
- `DELETE /orders/:id/items/:itemId` — remove item (requires approval if order is PREPARING)

#### 5.3 — API (CASHIER / ADMIN)
- `GET /orders` — list orders with status filters
- `PATCH /orders/:id/status` — update order status

#### 5.4 — UI (WAITER / POS PWA)
- POS menu interface → `/pos/menu` (category browsing, item selection)
- Cart and order submission flow → `/pos/cart`
- Order status tracker → `/pos/orders`

#### 5.5 — UI (ADMIN)
- Order management view → `/admin/orders`

**Test Criteria:**
- [ ] Order number auto-generated (UNIQUE)
- [ ] Order items correctly calculate subtotal and total_amount
- [ ] Status transitions follow: PENDING → PREPARING → READY → SERVED → PAID
- [ ] Cancelled orders trigger approval_request

---

### Feature 6 — Payments & Cashier Settlement
**Branch:** `feature/6-payments`
**Roles:** CASHIER, ADMIN, ACCOUNTANT

#### 6.1 — Database
- Tables: `payments`
- Migrations: payments table

#### 6.2 — API (CASHIER)
- `POST /payments` — record payment (CASH / MPESA / CARD, supports multi-pay split)
- `GET /payments/:orderId` — get payments for an order
- `PATCH /payments/:id/status` — update payment status

#### 6.3 — API (ADMIN / ACCOUNTANT)
- `GET /payments` — full payment log with filters
- `GET /payments/summary` — daily/weekly/monthly summary

#### 6.4 — UI (CASHIER)
- Settlement screen → `/cashier/settle/:orderId`
- Payment method selection + transaction reference input
- Receipt generation (print/digital)

#### 6.5 — UI (ADMIN / ACCOUNTANT)
- Payment log view → `/admin/payments`

**Test Criteria:**
- [ ] Multi-payment split (e.g., partial MPESA + partial CASH) totals correctly
- [ ] Order status updates to PAID after successful payment
- [ ] Receipt renders correct order items, totals, and payment method

---

### Feature 7 — Kitchen & Bar Operations
**Branch:** `feature/7-kitchen-bar`
**Roles:** CHEF, BARMAN, ADMIN

#### 7.1 — Database
- No new tables (uses `orders`, `order_items`, `stock_movements`)
- Migration: add kitchen_queue view or status index if needed

#### 7.2 — API (CHEF)
- `GET /kitchen/queue` — orders in PENDING / PREPARING status (FOOD items only)
- `PATCH /kitchen/orders/:id/status` — update to PREPARING or READY

#### 7.3 — API (BARMAN)
- `GET /bar/queue` — orders with ALCOHOLIC_DRINK / SOFT_DRINK items
- `PATCH /bar/orders/:id/status` — mark bar items as READY
- `POST /stock/bar-sale` — record bar sale stock deduction

#### 7.4 — UI (CHEF)
- Kitchen monitoring screen → `/kitchen` (live order queue)

#### 7.5 — UI (BARMAN)
- Bar tracking screen → `/bar` (issue + sale tracking)

**Test Criteria:**
- [ ] Kitchen queue shows only FOOD order items
- [ ] Bar queue shows only drink order items
- [ ] Status update on kitchen/bar side reflects on POS order tracker

---

### Feature 8 — Production & Menu Engineering
**Branch:** `feature/8-production`
**Roles:** CHEF, ADMIN, MANAGER

#### 8.1 — Database
- Tables: `recipes`, `recipe_items`, `kitchen_production_plans`, `ingredient_consumption`, `food_wastage`
- Migrations: all five tables

#### 8.2 — API (ADMIN / MANAGER)
- `POST /recipes` — create recipe (Bill of Materials)
- `GET /recipes` — list recipes with ingredients
- `PATCH /recipes/:id` — update recipe
- `POST /production-plans` — create daily production plan
- `GET /production-plans` — list with status filters

#### 8.3 — API (CHEF)
- `PATCH /production-plans/:id/status` — update to IN_PROGRESS / COMPLETED
- `POST /ingredient-consumption` — log ingredient usage
- `POST /food-wastage` — declare waste with reason

#### 8.4 — UI (ADMIN / MANAGER)
- Recipe management → `/admin/recipes`
- Production planning → `/admin/production`

#### 8.5 — UI (CHEF)
- Production execution view → `/kitchen/production`
- Consumption and wastage logging

**Test Criteria:**
- [ ] Recipe ingredient quantities deducted from stock_items on production completion
- [ ] food_wastage records correctly reduce produced_quantity
- [ ] Production plan status follows: PLANNED → IN_PROGRESS → COMPLETED → CLOSED

---

### Feature 9 — Dispatch & Delivery Management
**Branch:** `feature/9-dispatch`
**Roles:** DISPATCHER, ADMIN, MANAGER

#### 9.1 — Database
- Tables: `deliveries`
- Migrations: deliveries table

#### 9.2 — API (DISPATCHER)
- `GET /deliveries` — list pending deliveries
- `PATCH /deliveries/:id` — assign rider (name, phone), update delivery status
- `PATCH /deliveries/:id/status` — DISPATCHED → DELIVERED / FAILED

#### 9.3 — API (ADMIN / MANAGER)
- `GET /deliveries` — full delivery log with filters

#### 9.4 — UI (DISPATCHER)
- Dispatch operational page → `/dispatch`
- Rider assignment form
- Delivery progress tracker

#### 9.5 — UI (ADMIN)
- Delivery log → `/admin/deliveries`

**Test Criteria:**
- [ ] Delivery record created automatically when order has DELIVERY customer_type
- [ ] Status transitions: PENDING → DISPATCHED → DELIVERED / FAILED
- [ ] Failed deliveries visible in admin review

---

### Feature 10 — Theft & Waste Control (Unsold Food)
**Branch:** `feature/10-unsold-food`
**Roles:** CHEF, ADMIN, MANAGER

#### 10.1 — Database
- Tables: `unsold_food`
- Migrations: unsold_food table

#### 10.2 — API (CHEF)
- `POST /unsold-food` — declare unsold cooked food (product, quantity, reason)
- `GET /unsold-food` — view own declarations

#### 10.3 — API (ADMIN / MANAGER)
- `GET /unsold-food` — full list with filters
- `GET /unsold-food/summary` — impact on P&L and wastage totals

#### 10.4 — UI (ADMIN)
- Unsold food declarations page → `/admin/unsold-food`
- Reason, quantity, declared_by fields

**Test Criteria:**
- [ ] Unsold food declaration reduces stock (WASTAGE movement recorded)
- [ ] Wastage cost correctly impacts finance P&L view
- [ ] CHEF can only view their own declarations; ADMIN sees all

---

### Feature 11 — Finance & P&L Reporting
**Branch:** `feature/11-finance`
**Roles:** ACCOUNTANT, ADMIN, SUPER_ADMIN

#### 11.1 — Database
- Tables: `finance_transactions`
- Migrations: finance_transactions table

#### 11.2 — API (ACCOUNTANT)
- `POST /finance/transactions` — record INCOME or EXPENSE entry
- `GET /finance/transactions` — list with date/type filters
- `GET /finance/pl` — P&L summary (Daily / Weekly / Monthly / Annual)

#### 11.3 — API (ADMIN / SUPER_ADMIN)
- `GET /finance/pl` — full P&L access

#### 11.4 — UI (ACCOUNTANT / ADMIN)
- Finance dashboard → `/admin/finance`
- Transaction log table
- P&L statement view with period selector

**Test Criteria:**
- [ ] P&L correctly aggregates: payments (income) vs finance_transactions (expenses)
- [ ] Wastage cost from unsold_food and food_wastage reflected in expense totals
- [ ] Period filter (daily/weekly/monthly/annual) returns correct date-bounded data

---

### Feature 12 — Asset Management
**Branch:** `feature/12-assets`
**Roles:** ADMIN, MANAGER

#### 12.1 — Database
- Tables: `assets`
- Migrations: assets table

#### 12.2 — API (ADMIN / MANAGER)
- `POST /assets` — register new asset
- `GET /assets` — list with status filters (ACTIVE / DAMAGED / DISPOSED)
- `PATCH /assets/:id` — update asset details or status
- `PATCH /assets/:id/status` — mark DAMAGED or DISPOSED

#### 12.3 — UI (ADMIN)
- Asset register page → `/admin/assets`
- Asset status tracking and lifecycle management

**Test Criteria:**
- [ ] Asset status transitions: ACTIVE → DAMAGED → DISPOSED
- [ ] Disposal records maintained in audit trail
- [ ] Purchase cost visible in asset inventory list

---

### Feature 13 — HRM & Staff Performance
**Branch:** `feature/13-hrm`
**Roles:** HR, ADMIN, MANAGER

#### 13.1 — Database
- Tables: `staff_shifts`, `duty_rosters`, `staff_attendance`, `absence_reports`, `payroll_placeholders`, `staff_performance`
- Migrations: all six tables

#### 13.2 — API (HR / ADMIN)
- `POST /shifts` — create shift definition
- `POST /rosters` — assign staff to shift and date
- `GET /rosters` — list duty roster by date/department

#### 13.3 — API (Any role — self clock-in)
- `POST /attendance/clock-in` — record clock-in (auto-detect lateness)
- `POST /attendance/clock-out` — record clock-out (auto-detect early leave)

#### 13.4 — API (HR / ADMIN)
- `GET /attendance` — full attendance log with filters
- `POST /absence-reports` — log absence with reason
- `GET /payroll` — list payroll placeholders
- `PATCH /payroll/:id/status` — DRAFT → REVIEWED → APPROVED → PAID

#### 13.5 — API (ADMIN / MANAGER)
- `GET /staff-performance` — performance metrics per staff per date

#### 13.6 — UI (HR / ADMIN)
- HRM dashboard → `/admin/hrm`
- Duty roster management and shift assignment
- Attendance log with lateness indicators

#### 13.7 — UI (ADMIN / MANAGER)
- Staff performance leaderboard → `/admin/hrm/performance`

**Test Criteria:**
- [ ] Lateness auto-calculated: clock_in_time vs shift start_time + grace_minutes
- [ ] Absence auto-flagged when no clock-in recorded by end of grace period
- [ ] Payroll net_pay = base_pay + bonus_pay - lateness_deduction - absence_deduction
- [ ] Performance scores aggregate per staff per date correctly

---

### Feature 14 — CRM & Website Leads
**Branch:** `feature/14-crm`
**Roles:** ADMIN, MANAGER

#### 14.1 — Database
- Tables: `customers` (already created in Feature 5 — ensure loyalty_points logic is here)
- Migrations: if customers table not yet created

#### 14.2 — API (ADMIN / MANAGER)
- `POST /customers` — register new customer (walk-in, regular, VIP, corporate, delivery)
- `GET /customers` — list with type filters
- `PATCH /customers/:id` — update customer profile
- `POST /customers/:id/loyalty` — add loyalty points after order
- `GET /customers/:id/history` — order and visit history

#### 14.3 — UI (ADMIN / MANAGER)
- CRM dashboard → `/admin/crm`
- Customer segmentation view (WALK_IN / REGULAR / VIP / CORPORATE / DELIVERY)
- Loyalty points management

**Test Criteria:**
- [ ] Loyalty points correctly increment after each paid order
- [ ] Customer type segmentation filters return correct subsets
- [ ] Customer visit history accurately reflects orders placed

---

### Feature 15 — Approvals & Enforcement Engine
**Branch:** `feature/15-approvals-enforcement`
**Roles:** ADMIN, MANAGER, SUPER_ADMIN

#### 15.1 — Database
- Tables: `approval_requests`, `staff_incidents`, `enforcement_risk_scores`, `enforcement_actions`
- Migrations: all four tables

#### 15.2 — API (Any role — request side)
- `POST /approvals` — submit approval request (ORDER_CANCELLATION, DISCOUNT, STOCK_ADJUSTMENT, REFUND)
- `GET /approvals/mine` — list own pending requests

#### 15.3 — API (ADMIN / MANAGER)
- `GET /approvals` — full approval queue
- `PATCH /approvals/:id` — APPROVE or REJECT with notes

#### 15.4 — API (ADMIN / SUPER_ADMIN)
- `POST /incidents` — log staff incident
- `GET /incidents` — list with severity filters
- `GET /risk-scores` — staff risk scores
- `POST /enforcement-actions` — assign enforcement action to staff

#### 15.5 — UI (ADMIN / MANAGER)
- Approval management interface → `/admin/approvals`
- Pending queue with APPROVE / REJECT controls

#### 15.6 — UI (ADMIN / SUPER_ADMIN)
- Enforcement dashboard → `/admin/enforcement`
- Incident log + risk score visibility per staff member

**Test Criteria:**
- [ ] Sensitive actions (cancellations, discounts) blocked until approval_status = APPROVED
- [ ] Risk score auto-calculates from incident and audit data
- [ ] Enforcement actions assigned and tracked through to completion

---

### Feature 16 — Live Monitoring & Owner Dashboard
**Branch:** `feature/16-monitoring`
**Roles:** SUPER_ADMIN, ADMIN (read-only monitoring view)

#### 16.1 — Database
- No new tables (aggregates from all modules)

#### 16.2 — API (SUPER_ADMIN / ADMIN)
- `GET /monitoring/summary` — live global sales, open orders, today's revenue, active staff
- `GET /monitoring/risk-alerts` — HIGH and CRITICAL enforcement risk scores
- `GET /monitoring/stock-alerts` — products below reorder level
- `GET /monitoring/pl-today` — today's P&L snapshot

#### 16.3 — UI (SUPER_ADMIN / Owner)
- Live monitoring dashboard → `/monitoring`
- Global sales figures, high-risk staff alerts, stock warnings, P&L snapshot
- Real-time polling or SSE for live updates

**Test Criteria:**
- [ ] Dashboard data aggregates correctly across all modules
- [ ] High-risk alerts visible immediately upon risk score threshold breach
- [ ] P&L today snapshot matches finance module totals
- [ ] Final end-to-end integration check — data consistency across all 16 features

---

## ✅ Standing Rules

1. Never proceed to the next step or feature without explicit user greenlight
2. Follow `db.md` exactly — no schema assumptions, additions, or deviations
3. Write clean, modular, production-ready code at every step — no shortcuts
4. Delete all prior implementations before beginning — start from a clean scaffold
5. The `AI/` directory is read-only reference — never modify, never commit it
6. Guide files (`features.md`, `db.md`, `prompt.md`) are committed to the repo
7. UI must reflect the style and layout patterns from the zip/PDF files in the `AI/` directory
8. New features discovered during the build are added to `features.md` first, then implemented in sequence

---

## 🧭 Active Session Tracker (Update at the Start of Every Session)

```
Current Feature : [N — Feature Name]
Current Step    : [Step N — Layer]
Stack           : NestJS / Next.js / PostgreSQL / Prisma / Tailwind
Branch          : feature/[N]-[slug]
Last Greenlight : Feature [N-1] — [date]
```

---

> Want me to now scan the `AI/` directory (zip files and PDFs) and generate the `features.md` and `db.md` files?
