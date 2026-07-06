# Dashboard Features Specification
**Meat Lovers CIMS - Consolidated Dashboard Requirements**

This document consolidates all dashboard requirements from features.md, organized by role for easier implementation and maintenance.

---

## Table of Contents

1. [Admin Dashboard](#1-admin-dashboard)
2. [Manager Dashboard](#2-manager-dashboard)
3. [Cashier Dashboard](#3-cashier-dashboard)
4. [Waiter Dashboard](#4-waiter-dashboard)
5. [Chef Dashboard](#5-chef-dashboard)
6. [Barman Dashboard](#6-barman-dashboard)
7. [Storekeeper Dashboard](#7-storekeeper-dashboard)
8. [Dispatcher Dashboard](#8-dispatcher-dashboard)
9. [Accountant Dashboard](#9-accountant-dashboard)
10. [HR Dashboard](#10-hr-dashboard)
11. [Super Admin Monitoring](#11-super-admin-monitoring)

---

## 1. Admin Dashboard

**Route:** `/admin`  
**Roles:** ADMIN, SUPER_ADMIN, MANAGER  
**Primary Purpose:** Centralized operations oversight and quick access to all admin modules  
**Status:** ✅ IMPLEMENTED

### 1.1 — Database
**Tables:** orders, payments, customers, website_leads, stock_items, approval_requests, users, audit_logs  
**No new tables required** — aggregates from existing modules  
**Indexes recommended:**
- orders(status, created_at)
- payments(created_at, payment_method)
- stock_items(current_quantity, reorder_level)

### 1.2 — API (Admin Dashboard Data — ADMIN, SUPER_ADMIN, MANAGER)
**Endpoints:**
- GET /admin/dashboard/summary — Aggregated dashboard metrics
- GET /admin/dashboard/revenue — Revenue snapshot (today, week, month)
- GET /admin/dashboard/activity — Recent activity timeline
- GET /admin/dashboard/alerts — Current system alerts
- GET /orders?status=PENDING,PREPARING,READY — Open orders count
- GET /crm/leads?status=NEW — New leads count
- GET /stock?status=LOW,OUT_OF_STOCK — Stock alerts
- GET /approvals?status=PENDING — Pending approvals

**Auth guard:** ADMIN, SUPER_ADMIN, MANAGER

### 1.3 — UI (Admin Dashboard — ADMIN, SUPER_ADMIN, MANAGER)
**Page:** Admin Operations Dashboard  
**Route:** /admin  
**Components:** SummaryCards, RevenueSnapshot, OpenOrdersWidget, StockAlertWidget, ApprovalQueueWidget, LeadWidget, ActivityTimeline, AlertBanner, QuickAccessGrid  
**Access guard:** ADMIN, SUPER_ADMIN, MANAGER

### Features Required

#### Summary Cards (4)
- **Today's Revenue**
  - Source: GET /finance/sales-summary
  - Display: KSh amount with % change vs yesterday
  - Icon: 💰, Color: emerald
  
- **Open Orders**
  - Source: GET /orders?status=PENDING,PREPARING,READY
  - Display: Count with breakdown (pending/in progress)
  - Icon: 📋, Color: blue
  
- **New Leads**
  - Source: GET /crm/leads?status=NEW
  - Display: Count of unconverted leads
  - Icon: 📬, Color: purple
  
- **Stock Alerts**
  - Source: GET /stock?status=LOW,OUT_OF_STOCK
  - Display: Count with breakdown (low/out)
  - Icon: ⚠️, Color: red

#### Revenue Snapshot
- **Data Points:**
  - Today: Current day sales total
  - This Week: 7-day rolling sum
  - This Month: Current month total
- **Source:** GET /finance/sales-summary?period=today,week,month
- **Display:** Three-column card with color coding

#### Widget Panels (4)

1. **Open Orders Widget**
   - Count of orders in PENDING, PREPARING, READY states
   - Quick link to /admin/orders
   - Show "pending" vs "in progress" breakdown

2. **Stock Alert Widget**
   - Low stock count (below reorder level)
   - Out of stock count
   - Quick link to /admin/stock

3. **Approval Queue Widget**
   - Pending approvals count
   - Source: GET /approvals?status=PENDING
   - Quick link to /admin/approvals

4. **New Leads Widget**
   - Unconverted website leads
   - Source: GET /crm/leads?status=NEW
   - Quick link to /admin/cms

#### Recent Activity Timeline
- **Events to Track:**
  - New orders placed (type: order)
  - Stock movements (type: stock)
  - Payments received (type: payment)
  - New leads (type: lead)
  - User actions (type: user)
- **Source:** GET /activity-log?limit=10
- **Display:** Timeline with icons, user, timestamp

#### Alert Banner
- **Alert Types:**
  - Error: Critical issues (out of stock, failed payments)
  - Warning: Attention needed (low stock, pending approvals)
  - Info: General notifications
- **Each Alert Includes:**
  - Icon based on type
  - Message text
  - Optional action button with link

#### Quick Access Module Grid (13+ modules)
1. Order Management → /admin/orders
2. Website CMS → /admin/cms
3. Products → /admin/products
4. Pricing Control → /admin/pricing-control
5. Suppliers → /admin/suppliers
6. Stock Control → /admin/stock
7. Production Plans → /admin/production-plans
8. Payments → /admin/payments
9. Dispatch → /admin/dispatch
10. Delivery Tracking → /admin/delivery-tracking
11. Waste Management → /admin/waste
12. Kitchen Oversight → /admin/kitchen
13. Bar Oversight → /admin/bar
14. Finance Dashboard → /admin/finance
15. CRM Dashboard → /admin/crm
16. HRM Dashboard → /admin/hrm
17. Asset Management → /admin/assets
18. Approval Management → /admin/approvals
19. Enforcement Dashboard → /admin/enforcement
20. System Diagnostics → /admin/system

### API Endpoints Required
- GET /orders?status=PENDING,PREPARING,READY
- GET /finance/sales-summary?period=today,week,month
- GET /crm/leads?status=NEW
- GET /stock?status=LOW,OUT_OF_STOCK
- GET /approvals?status=PENDING
- GET /activity-log?limit=10

### Auto-Refresh
- Revenue and stats: Every 60 seconds
- Activity timeline: Every 30 seconds
- Manual refresh button available

---

## 2. Manager Dashboard

**Route:** `/manager`  
**Roles:** MANAGER  
**Primary Purpose:** Team oversight and operational management  
**Status:** ✅ IMPLEMENTED (May need enhancement)

### 2.1 — Database
**Tables:** staff_performance, approval_requests, staff_attendance, duty_rosters, enforcement_risk_scores  
**No new tables required** — uses existing HRM and enforcement tables

### 2.2 — API (Manager Dashboard Data — MANAGER)
**Endpoints:**
- GET /manager/dashboard/summary — Manager-specific metrics
- GET /staff-performance/team-summary — Team performance overview
- GET /approvals?status=PENDING&assigned_to={manager_id} — Manager's approval queue
- GET /monitoring/summary — Current operations snapshot
- GET /risk-scores?level=HIGH,CRITICAL — Risk alerts requiring attention
- GET /monitoring/kitchen-bar — Kitchen and bar queue status
- GET /monitoring/delivery — Delivery operations status

**Auth guard:** MANAGER

### 2.3 — UI (Manager Dashboard — MANAGER)
**Page:** Manager Operations Dashboard  
**Route:** /manager  
**Components:** TeamPerformanceCard, ApprovalQueueWidget, OperationsSummaryPanel, RiskAlertPanel, ScheduleOverview  
**Access guard:** MANAGER

### Features Required

#### Summary Cards (4)
- **Team Performance Score**
  - Source: GET /staff-performance/team-summary
  - Display: Average score with trend
  
- **Pending Approvals**
  - Source: GET /approvals?status=PENDING
  - Display: Count with priority breakdown
  
- **Today's Operations**
  - Orders processed, revenue, customer count
  - Source: GET /monitoring/summary
  
- **Risk Alerts**
  - HIGH and CRITICAL staff risk scores
  - Source: GET /risk-scores?level=HIGH,CRITICAL

#### Key Widgets

1. **Approval Queue**
   - List pending approvals with urgency
   - Quick approve/reject actions
   - Link to /admin/approvals

2. **Staff Performance**
   - Top performers this week
   - Staff needing attention
   - Link to /admin/hrm/performance

3. **Operations Summary**
   - Kitchen queue status
   - Bar queue status
   - Delivery status
   - Source: GET /monitoring/kitchen-bar, GET /monitoring/delivery

4. **Schedule Overview**
   - Today's roster
   - Attendance status
   - Link to /admin/hrm

### API Endpoints Required
- GET /staff-performance/team-summary
- GET /approvals?status=PENDING
- GET /monitoring/summary
- GET /risk-scores?level=HIGH,CRITICAL
- GET /monitoring/kitchen-bar
- GET /monitoring/delivery

### Auto-Refresh
- All metrics: Every 60 seconds

---

## 3. Cashier Dashboard

**Route:** `/cashier`  
**Roles:** CASHIER  
**Primary Purpose:** Order settlement and payment processing  
**Status:** ✅ IMPLEMENTED

### 3.1 — Database
**Tables:** orders, order_items, payments, customers  
**Used tables:** orders (status, settlement_status), payments (payment_method, cashier_id, amount)  
**Indexes recommended:**
- orders(status, settlement_status, cashier_id)
- payments(cashier_id, created_at, payment_method)

### 3.2 — API (Cashier Operations — CASHIER)
**Endpoints:**
- GET /cashier/dashboard/summary — Cashier shift summary
- GET /orders?status=READY,SERVED&settlement_status=UNSETTLED — Settlement queue
- GET /payments?cashier_id={self}&date=today — Today's collections
- GET /payments/variance?cashier_id={self} — Payment variance check
- GET /finance/cashier-shift-summary — Detailed shift summary
- POST /payments — Settle order (create payment)
- POST /payments/split — Split payment across methods
- PATCH /orders/{id}/settlement-status — Mark order as settled

**Auth guard:** CASHIER

### 3.3 — UI (Cashier Dashboard — CASHIER)
**Page:** Cashier Settlement Workspace  
**Route:** /cashier  
**Components:** ShiftSummaryCards, SettlementQueue, PaymentMethodBreakdown, ShiftSummaryPanel, VarianceIndicator, QuickSettleButton  
**Access guard:** CASHIER

### Features Required

#### Summary Cards (4)
- **Orders to Settle**
  - Source: GET /orders?status=READY,SERVED&settlement_status=UNSETTLED
  - Display: Count of orders awaiting payment
  
- **Today's Collections**
  - Source: GET /payments?cashier_id={self}&date=today
  - Display: Total amount collected
  
- **Payment Variance**
  - Expected vs actual cash
  - Source: GET /payments/variance?cashier_id={self}
  
- **Settled Orders**
  - Orders settled by this cashier today
  - Source: GET /orders?status=PAID&cashier_id={self}

#### Settlement Queue
- **Display:**
  - Table number, order number, total amount
  - Items count, time waiting
  - Quick settle button
- **Source:** GET /orders?status=READY,SERVED&settlement_status=UNSETTLED
- **Actions:**
  - Open settlement modal
  - View order details

#### Payment Breakdown
- **By Method:**
  - CASH: Count and amount
  - MPESA: Count and amount
  - CARD: Count and amount
- **Source:** GET /payments?cashier_id={self}&date=today&groupBy=payment_method

#### Shift Summary
- **Shift Information:**
  - Start time
  - Current duration
  - Orders settled
  - Total collections
- **Source:** GET /finance/cashier-shift-summary

#### Quick Actions
1. New Settlement
2. View Pending Orders
3. Print Shift Report
4. Request Cash Drop

### API Endpoints Required
- GET /orders?status=READY,SERVED&settlement_status=UNSETTLED
- GET /payments?cashier_id={id}&date=today
- GET /payments/variance?cashier_id={id}
- GET /finance/cashier-shift-summary
- POST /payments (settle order)
- POST /payments/split (split payment)

### Auto-Refresh
- Settlement queue: Every 10 seconds
- Payment totals: Every 30 seconds

---

## 4. Waiter Dashboard

**Route:** `/pos`  
**Roles:** WAITER  
**Primary Purpose:** Order tracking and table management  
**Status:** ⚠️ NEEDS ENHANCEMENT → Should redirect to `/pos/menu`

### 4.1 — Database
**Tables:** orders, order_items, products, customers  
**Used tables:** orders (waiter_id, table_id, status), order_items (product_id, quantity, unit_price)  
**Indexes recommended:**
- orders(waiter_id, status, created_at)
- orders(status, created_at) for general queries

### 4.2 — API (Waiter Operations — WAITER)
**Endpoints:**
- GET /waiter/dashboard/summary — Waiter performance metrics
- GET /orders?waiter_id={self}&status=PENDING,PREPARING,READY — Active orders
- GET /orders?waiter_id={self}&status=READY — Ready to serve
- GET /orders?waiter_id={self}&date=today — Today's orders
- GET /orders?waiter_id={self}&status=PAID&date=today — Today's revenue
- POST /orders — Create new order
- PATCH /orders/{id}/status — Update order status (mark served)
- GET /products?available=true — Menu items for order creation

**Auth guard:** WAITER

### 4.3 — UI (Waiter Dashboard — WAITER)
**Page:** Waiter Order Tracking  
**Route:** /pos  
**Components:** WaiterStatsCards, NewOrderButton, MyOrdersButton, ActiveOrdersGrid, OrderStatusBadge, ReadyToServeAlert  
**Access guard:** WAITER

### 4.4 — UI (POS Menu — WAITER) ⚠️ NEEDS CREATION
**Page:** POS Order Creation Menu  
**Route:** /pos/menu  
**Components:** MenuCategoryGrid, ProductCard, OrderCart, CartSummary, TableSelector, CustomerLookup, SubmitOrderButton  
**Access guard:** WAITER

### 4.5 — UI (Order Tracker — WAITER)
**Page:** My Orders Tracker  
**Route:** /pos/orders  
**Components:** OrderFilterBar, OrdersTable, OrderDetailDrawer, StatusUpdateButton  
**Access guard:** WAITER

### Features Required

#### Summary Cards (4)
- **Active Orders**
  - Source: GET /orders?waiter_id={self}&status=PENDING,PREPARING,READY
  - Display: Count of orders in progress
  
- **Ready to Serve**
  - Source: GET /orders?waiter_id={self}&status=READY
  - Display: Count with alert if > 0
  
- **Today's Orders**
  - All orders taken by this waiter today
  - Source: GET /orders?waiter_id={self}&date=today
  
- **Today's Revenue**
  - Total from settled orders
  - Source: GET /orders?waiter_id={self}&status=PAID&date=today

#### Quick Actions (2)
1. **New Order Button**
   - Large, prominent
   - Redirects to /pos/menu
   
2. **My Orders Button**
   - View all orders
   - Redirects to /pos/orders

#### Active Orders Grid
- **Display:**
  - Order number, table number
  - Status badge (color-coded)
  - Time since placed
  - Items preview (first 3)
  - Total amount
- **Source:** GET /orders?waiter_id={self}&status=PENDING,PREPARING,READY
- **Filters:**
  - All active
  - Pending
  - Preparing
  - Ready to serve

#### Order Status Notifications
- **Alert when:**
  - Order becomes READY (ready to serve)
  - Order delayed > 20 minutes
  - Customer requests assistance

#### Performance Metrics (Optional)
- Orders today vs target
- Average table turnover time
- Customer satisfaction (if implemented)

### API Endpoints Required
- GET /orders?waiter_id={id}&status=...
- GET /orders?waiter_id={id}&date=today
- POST /orders (create new order)
- PATCH /orders/{id}/status (mark served)

### Auto-Refresh
- Active orders: Every 30 seconds
- Stats: Every 60 seconds

### Recommendation
**Primary Route should be `/pos/menu`** for order creation:
- Create `/pos/menu/page.tsx` - Full menu with cart
- Keep `/pos/page.tsx` as order status dashboard
- Update login redirect: WAITER → `/pos/menu`

---

## 5. Chef Dashboard

**Route:** `/kitchen`  
**Roles:** CHEF  
**Primary Purpose:** Kitchen operations hub  
**Status:** ⚠️ NEEDS REDIRECT → Should redirect to `/kitchen/queue`

### 5.1 — Database
**Tables:** orders, order_items, products, recipes, stock_items, stock_movements, unsold_food, food_wastage  
**Used tables:** orders (status, created_at), order_items (product_id, quantity), recipes (product_id, ingredients)  
**Indexes recommended:**
- orders(status, created_at) for queue queries
- order_items(order_id, product_id)

### 5.2 — API (Kitchen Operations — CHEF)
**Endpoints:**
- GET /kitchen/summary — Kitchen queue summary (pending, preparing, ready)
- GET /kitchen/orders?status=PENDING — Pending food orders
- GET /kitchen/orders?status=PREPARING — Currently preparing
- GET /kitchen/orders?status=READY — Ready for pickup
- PATCH /kitchen/orders/{id}/status — Update order status
- GET /stock?location=KITCHEN&status=LOW — Low stock alerts
- POST /stock/usage — Record ingredient usage
- POST /unsold-food — Declare unsold food
- POST /food-wastage — Record food wastage

**Auth guard:** CHEF

### 5.3 — UI (Kitchen Dashboard — CHEF)
**Page:** Kitchen Operations Hub  
**Route:** /kitchen  
**Components:** KitchenSummaryCards, QuickAccessGrid (6 modules)  
**Access guard:** CHEF

### 5.4 — UI (Kitchen Queue — CHEF) ✅ IMPLEMENTED
**Page:** Kitchen Queue Board  
**Route:** /kitchen/queue  
**Components:** QueueBoard, FoodTicket, StatusColumns (Pending, Preparing, Ready), PrepTimeIndicator, RecipeReference  
**Access guard:** CHEF

### 5.5 — UI (Kitchen Stock — CHEF) ✅ IMPLEMENTED
**Page:** Kitchen Stock Management  
**Route:** /kitchen/stock  
**Components:** StockList, UsageRecordForm, RequestTransferButton, StockAlertBadge  
**Access guard:** CHEF

### Features Required

#### Summary Cards (4)
- **Total Orders**
  - Source: GET /kitchen/summary
  - Display: All orders in kitchen
  
- **Pending**
  - Orders awaiting preparation
  - Color: amber
  
- **Preparing**
  - Orders currently being prepared
  - Color: blue
  
- **Ready**
  - Orders ready for pickup
  - Color: emerald

#### Quick Access Grid (6)
1. **Order Queue** → /kitchen/queue (PRIMARY)
   - Active kitchen queue board
   - Should be main redirect target
   
2. **Kitchen Stock** → /kitchen/stock
   - View stock levels
   - Record usage
   
3. **Recipes** → /recipes (Coming soon)
   - Recipe database
   
4. **Production Plans** → /admin/production-plans
   - View production schedule
   
5. **Waste Tracking** → /kitchen/waste
   - Declare unsold food
   - Record wastage
   
6. **Reports** → /admin/kitchen
   - Performance metrics
   - Preparation times

#### Recent Alerts
- Delayed orders (>15 min in PENDING)
- Low stock ingredients
- Production plan changes

### API Endpoints Required
- GET /kitchen/summary
- GET /kitchen/orders?status=...
- GET /stock?location=KITCHEN&status=LOW

### Auto-Refresh
- Summary: Every 30 seconds

### Recommendation
**Update login redirect:** CHEF → `/kitchen/queue` directly
Keep `/kitchen/page.tsx` as navigation hub for accessing other kitchen functions.

---

## 6. Barman Dashboard

**Route:** `/bar`  
**Roles:** BARMAN  
**Primary Purpose:** Drink queue management and bar operations  
**Status:** ✅ FULLY IMPLEMENTED

### 6.1 — Database
**Tables:** orders, order_items, products, stock_items, stock_movements, stock_transfers  
**Used tables:** 
- orders (status, created_at) — filtered for drink items
- order_items (product_id, quantity) — where product.category = DRINK
- stock_transfers (from_location=STORE, to_location=BAR)  
**Indexes recommended:**
- orders(status, created_at) for drink queue
- stock_transfers(to_location, created_at)

### 6.2 — API (Bar Operations — BARMAN)
**Endpoints:**
- GET /bar/summary — Bar queue summary (pending, preparing, ready)
- GET /bar/orders?status=PENDING — Pending drink orders
- GET /bar/orders?status=PREPARING — Currently preparing
- GET /bar/orders?status=READY — Ready for pickup
- PATCH /bar/orders/{id}/status — Update drink status
- GET /bar/transfers — Recent stock transfers to bar
- POST /stock/usage — Record drink stock usage
- POST /stock/transfer-request — Request stock from store

**Auth guard:** BARMAN

### 6.3 — UI (Bar Workspace — BARMAN)
**Page:** Bar Queue Board  
**Route:** /bar  
**Components:** BarQueueBoard, DrinkTicket, StatusColumns (Pending, Preparing, Ready), ReadyButton, StockDeductionPrompt, TransferReceiptPanel  
**Access guard:** BARMAN

### Features Required

#### Summary Cards (3)
- **Pending**
  - Drinks awaiting preparation
  - Source: GET /bar/orders?status=PENDING
  
- **Preparing**
  - Drinks being prepared
  - Source: GET /bar/orders?status=PREPARING
  
- **Ready**
  - Drinks ready for pickup
  - Source: GET /bar/orders?status=READY

#### Three-Column Kanban Board
- **Pending Column:**
  - New drink orders
  - Click to start preparing
  
- **Preparing Column:**
  - Currently being made
  - Mark ready button
  
- **Ready Column:**
  - Awaiting pickup
  - Auto-clear when served

#### Drink Ticket Card
- **Display:**
  - Order number
  - Table number
  - Drink items with quantities
  - Time elapsed (updates every 10s)
  - Aging indicator:
    - Normal: < 10 minutes
    - Warning: 10-20 minutes (amber)
    - Critical: > 20 minutes (red)
  - Expand/collapse for full details

#### Stock Transfers Panel (Sidebar)
- **Display:**
  - Recent transfers from store to bar
  - Receipt number, items, quantity
  - Approval status
- **Source:** GET /bar/transfers

#### Action Buttons
- **Start Preparing:** PENDING → PREPARING
- **Mark Ready:** PREPARING → READY
- **Request Stock:** Open transfer request modal

### API Endpoints Required
- GET /bar/orders?status=...
- GET /bar/summary
- GET /bar/transfers
- PATCH /bar/orders/{id}/status
- POST /stock/transfer-request

### Auto-Refresh
- Queue board: Every 30 seconds
- Elapsed time: Every 10 seconds
- Transfers: Every 60 seconds

### Features Implemented ✅
- Three-column Kanban layout
- Real-time status updates
- Aging indicators with color coding
- Expandable order cards
- Stock transfer visibility
- Auto-refresh functionality
- Manual refresh button
- Loading and error states

---

## 7. Storekeeper Dashboard

**Route:** `/staff` (role: STOREKEEPER)  
**Roles:** STOREKEEPER  
**Primary Purpose:** Inventory management and receiving  
**Status:** ✅ IMPLEMENTED

### 7.1 — Database
**Tables:** stock_items, stock_movements, purchases, suppliers, stock_transfers  
**Used tables:**
- stock_items (current_quantity, reorder_level, location)
- purchases (status, expected_delivery_date)
- stock_movements (movement_type, quantity, created_at)
- stock_transfers (from_location, to_location, status)  
**Indexes recommended:**
- stock_items(location, current_quantity, reorder_level)
- purchases(status, expected_delivery_date)
- stock_movements(created_at, movement_type)

### 7.2 — API (Storekeeper Operations — STOREKEEPER)
**Endpoints:**
- GET /storekeeper/dashboard/summary — Inventory overview metrics
- GET /stock?count=true — Total stock items count
- GET /stock?status=LOW — Low stock items
- GET /stock?status=OUT — Out of stock items
- GET /purchases?status=PENDING — Pending supplier deliveries
- GET /stock/movements?limit=10 — Recent stock movements
- POST /purchases/receive — Receive supplier delivery
- POST /stock/transfer — Transfer stock (store to kitchen/bar)
- POST /stock/adjustment — Adjust stock quantity
- GET /suppliers — Supplier directory

**Auth guard:** STOREKEEPER

### 7.3 — UI (Storekeeper Dashboard — STOREKEEPER)
**Page:** Inventory Management Dashboard  
**Route:** /staff (role-based view)  
**Components:** InventoryStatsCards, PendingTasksList, QuickActionsGrid, RecentMovementsTimeline, StockAlertBanner  
**Access guard:** STOREKEEPER

### Features Required

#### Summary Cards (4)
- **Stock Items**
  - Total items in inventory
  - Source: GET /stock?count=true
  
- **Low Stock**
  - Items below reorder level
  - Source: GET /stock?status=LOW
  
- **Out of Stock**
  - Items with zero quantity
  - Source: GET /stock?status=OUT
  
- **Pending Orders**
  - Supplier orders awaiting delivery
  - Source: GET /purchases?status=PENDING

#### Pending Tasks List
1. **Receive Deliveries** (Priority: HIGH)
   - Source: GET /purchases?status=PENDING&delivery_expected=today
   
2. **Reorder Low Stock** (Priority: HIGH)
   - Source: GET /stock?status=LOW
   
3. **Weekly Stock Audit** (Priority: MEDIUM)
   - Manual task with due date

#### Quick Actions (4)
1. **Receive Delivery** → /staff/receiving/new
2. **Check Stock** → /staff/stock
3. **Order Supplies** → /staff/suppliers/order
4. **Stock Report** → /staff/stock/report

#### Recent Stock Movements
- Last 10 movements
- Type: PURCHASE, TRANSFER, USAGE, WASTE
- Source: GET /stock/movements?limit=10

#### Alert Notifications
- **Error:** Critical items out of stock
- **Warning:** Items below minimum threshold
- **Info:** Pending deliveries for today

### API Endpoints Required
- GET /stock?count=true
- GET /stock?status=LOW,OUT
- GET /purchases?status=PENDING
- GET /stock/movements?limit=10
- POST /purchases/receive
- POST /stock/transfer

### Auto-Refresh
- Stock alerts: Every 60 seconds
- Pending tasks: Every 120 seconds

---

## 8. Dispatcher Dashboard

**Route:** `/admin/dispatch`  
**Roles:** DISPATCHER, ADMIN, MANAGER  
**Primary Purpose:** Delivery operations and rider management  
**Status:** ✅ IMPLEMENTED

### 8.1 — Database
**Tables:** deliveries, riders, orders, users  
**Used tables:**
- deliveries (order_id, rider_id, status, assigned_at, delivered_at)
- riders (user_id, is_available, vehicle_type, current_location)
- orders (table_id, total_amount, status)  
**Indexes recommended:**
- deliveries(status, assigned_at)
- deliveries(rider_id, status)
- riders(is_available)

### 8.2 — API (Dispatch Operations — DISPATCHER, ADMIN, MANAGER)
**Endpoints:**
- GET /deliveries/summary — Delivery metrics (total, by status, active riders)
- GET /riders — All riders list
- GET /riders/available — Available riders only
- GET /deliveries?status={filter} — Deliveries filtered by status
- POST /deliveries — Assign delivery to rider
- PATCH /deliveries/{id}/status — Update delivery status
- GET /deliveries/{id} — Delivery details

**Auth guard:** DISPATCHER, ADMIN, MANAGER

### 8.3 — UI (Dispatch Operations — DISPATCHER, ADMIN, MANAGER)
**Page:** Dispatch Management Dashboard  
**Route:** /admin/dispatch  
**Components:** DeliverySummaryCards, StatusFilterDropdown, AvailableRidersGrid, ActiveDeliveriesTable, AssignDeliveryModal, StatusUpdateButtons  
**Access guard:** DISPATCHER, ADMIN, MANAGER

### Features Required

#### Summary Cards (6)
- **Total Deliveries** - All deliveries
- **Assigned** - Newly assigned (blue)
- **Picked Up** - Collected from restaurant (yellow)
- **In Transit** - En route to customer (purple)
- **Delivered** - Completed (green)
- **Active Riders** - Currently available

**Source:** GET /deliveries/summary

#### Controls Panel
- **Status Filter Dropdown:**
  - All Statuses
  - Assigned, Picked Up, In Transit, Delivered, Cancelled
  
- **Assign Delivery Button:**
  - Opens assignment modal

#### Available Riders Grid
- **Display:**
  - Rider name, phone
  - Vehicle type and plate
  - Current location (if tracked)
  - Availability status
- **Source:** GET /riders/available

#### Active Deliveries Table
- **Columns:**
  - Order ID
  - Rider name
  - Status badge (color-coded)
  - Delivery address (truncated)
  - Assigned time
  - Actions (status update buttons)
  
- **Source:** GET /deliveries?status={filter}

#### Status Update Actions
- **ASSIGNED** → Mark Picked Up
- **PICKED_UP** → Mark In Transit
- **IN_TRANSIT** → Mark Delivered
- **Any Active** → Cancel

#### Assign Delivery Modal
- **Form Fields:**
  - Order ID (text input)
  - Select Rider (dropdown from available)
  - Pickup Address (optional text)
  - Delivery Address (required text)
  - Delivery Notes (optional textarea)
  
- **Actions:**
  - Cancel
  - Assign (POST /deliveries)

### API Endpoints Required
- GET /riders
- GET /riders/available
- GET /deliveries?status=...
- GET /deliveries/summary
- POST /deliveries
- PATCH /deliveries/{id}/status

### Auto-Refresh
- Delivery summary: Every 30 seconds
- Active deliveries: Every 30 seconds
- Available riders: Every 60 seconds

---

## 9. Accountant Dashboard

**Route:** `/staff` (role: ACCOUNTANT)  
**Roles:** ACCOUNTANT  
**Primary Purpose:** Finance management and reconciliation  
**Status:** ✅ IMPLEMENTED

### 9.1 — Database
**Tables:** finance_transactions, payments, orders, unsold_food, food_wastage, stock_items  
**Used tables:**
- finance_transactions (transaction_type, category, amount, transaction_date)
- payments (payment_method, amount, created_at, cashier_id)
- orders (status, total_amount) for revenue aggregation  
**Indexes recommended:**
- finance_transactions(transaction_date, transaction_type)
- payments(created_at, payment_method, cashier_id)
- payments(reconciliation_status, created_at)

### 9.2 — API (Finance Operations — ACCOUNTANT)
**Endpoints:**
- GET /accountant/dashboard/summary — Finance overview metrics
- GET /payments?status=PENDING — Unreconciled payments
- GET /finance/sales-summary?date=today — Today's revenue
- GET /payments/variance — Payment variance report
- GET /finance/transactions?limit=10 — Recent transactions
- POST /finance/transactions — Record new transaction
- PATCH /payments/{id}/reconcile — Reconcile payment
- GET /finance/pl — Profit & Loss report
- GET /finance/reconciliation — Reconciliation report

**Auth guard:** ACCOUNTANT

### 9.3 — UI (Accountant Dashboard — ACCOUNTANT)
**Page:** Finance Management Dashboard  
**Route:** /staff (role-based view)  
**Components:** FinanceStatsCards, PendingTasksList, QuickActionsGrid, RecentTransactionsTable, VarianceAlertBanner  
**Access guard:** ACCOUNTANT

### Features Required

#### Summary Cards (4)
- **Pending Payments**
  - Unreconciled payments
  - Source: GET /payments?status=PENDING
  
- **Today's Revenue**
  - Total collections
  - Source: GET /finance/sales-summary?date=today
  
- **Unreconciled**
  - Payment variances
  - Source: GET /payments/variance
  
- **Reports Due**
  - Pending financial reports
  - Manual count or GET /reports?status=DUE

#### Pending Tasks List
1. **Reconcile M-Pesa Payments** (Priority: HIGH)
   - Due: Today
   - Action: Reconcile → /staff/payments
   
2. **Generate Weekly Financial Report** (Priority: MEDIUM)
   - Due date shown
   - Action: Create → /staff/reports
   
3. **Review Variance Alerts** (Priority: MEDIUM)
   - Count of items
   - Action: Review → /staff/finance

#### Quick Actions (4)
1. **Record Payment** → /staff/payments/new
2. **View Reports** → /staff/reports
3. **Check Variances** → /staff/finance
4. **Export Data** → /staff/reports/export

#### Recent Transactions
- Last 10 finance transactions
- Type, amount, category, date
- Source: GET /finance/transactions?limit=10

#### Alert Notifications
- **Warning:** Payment variances requiring review
- **Info:** Report due dates approaching

### API Endpoints Required
- GET /payments?status=PENDING
- GET /finance/sales-summary?date=today
- GET /payments/variance
- GET /finance/transactions?limit=10
- POST /finance/transactions
- GET /finance/pl (P&L report)

### Auto-Refresh
- Payment status: Every 60 seconds
- Variance alerts: Every 120 seconds

---

## 10. HR Dashboard

**Route:** `/staff` (role: HR)  
**Roles:** HR  
**Primary Purpose:** Human resource management  
**Status:** ✅ IMPLEMENTED

### 10.1 — Database
**Tables:** users, staff_shifts, duty_rosters, staff_attendance, absence_reports, payroll_placeholders  
**Used tables:**
- users (role, is_active) for employee count
- staff_attendance (staff_id, date, clock_in_time, status)
- absence_reports (staff_id, status, absence_type)
- payroll_placeholders (staff_id, pay_period, status)  
**Indexes recommended:**
- staff_attendance(date, status)
- absence_reports(status, created_at)
- payroll_placeholders(pay_period, status)
- users(role, is_active)

### 10.2 — API (HR Operations — HR, ADMIN, MANAGER)
**Endpoints:**
- GET /hr/dashboard/summary — HR overview metrics
- GET /users?role=staff&count=true — Total employee count
- GET /attendance?date=today&status=PRESENT — Present today
- GET /absence-reports?status=PENDING — Pending leave requests
- GET /payroll/next-due — Next payroll due date
- GET /audit-logs?category=HR&limit=10 — Recent HR activity
- POST /users — Create new employee
- PATCH /absence-reports/{id}/status — Approve/reject leave
- POST /payroll/process — Process payroll batch

**Auth guard:** HR, ADMIN, MANAGER

### 10.3 — UI (HR Dashboard — HR, ADMIN, MANAGER)
**Page:** Human Resources Dashboard  
**Route:** /staff (role-based view)  
**Components:** HRStatsCards, PendingTasksList, QuickActionsGrid, RecentHRActivityTimeline, LeaveRequestAlertBanner  
**Access guard:** HR, ADMIN, MANAGER

### Features Required

#### Summary Cards (4)
- **Total Employees**
  - Staff count with monthly change
  - Source: GET /users?role=staff&count=true
  
- **Present Today**
  - Clocked in today
  - Source: GET /attendance?date=today&status=PRESENT
  
- **Leave Requests**
  - Pending approval
  - Source: GET /absence-reports?status=PENDING
  
- **Payroll Due**
  - Days until next payroll
  - Calculated or GET /payroll/next-due

#### Pending Tasks List
1. **Review Leave Requests** (Priority: HIGH)
   - Count of pending requests
   - Action: Review → /staff/attendance
   
2. **Process Payroll** (Priority: HIGH)
   - Due date
   - Action: Process → /staff/payroll
   
3. **Update Employee Records** (Priority: MEDIUM)
   - New hires count
   - Action: Update → /staff/employees

#### Quick Actions (4)
1. **Add Employee** → /staff/employees/new
2. **Mark Attendance** → /staff/attendance
3. **Process Payroll** → /staff/payroll
4. **View Reports** → /staff/reports

#### Recent HR Activity
- New hires
- Resignations
- Leave approvals
- Payroll processing
- Source: GET /audit-logs?category=HR&limit=10

#### Alert Notifications
- **Warning:** Pending leave requests
- **Info:** Payroll processing reminder

### API Endpoints Required
- GET /users?role=staff&count=true
- GET /attendance?date=today&status=PRESENT
- GET /absence-reports?status=PENDING
- GET /payroll/next-due
- GET /audit-logs?category=HR&limit=10
- POST /users (create employee)
- PATCH /absence-reports/{id}/status

### Auto-Refresh
- Attendance: Every 300 seconds (5 min)
- Leave requests: Every 120 seconds

---

## 11. Super Admin Monitoring

**Route:** `/monitoring`  
**Roles:** SUPER_ADMIN  
**Primary Purpose:** Real-time system-wide oversight  
**Status:** ❌ NOT IMPLEMENTED (Feature 22)

### 11.1 — Database
**Tables:** No new tables  
**Aggregates from:** orders, payments, stock_items, deliveries, approval_requests, enforcement_risk_scores, finance_transactions, staff_attendance  
**Database views recommended:**
- monitoring_summary_view (live aggregations)
- kitchen_bar_queue_view (combined kitchen/bar metrics)
- risk_alerts_view (HIGH/CRITICAL risks only)

### 11.2 — API (Live Monitoring — SUPER_ADMIN, ADMIN, MANAGER)
**Endpoints:**
- GET /monitoring/summary — Live sales, orders, revenue, active staff, pending approvals
- GET /monitoring/kitchen-bar — Queue counts, delayed orders, ready items
- GET /monitoring/risk-alerts — HIGH and CRITICAL staff risk alerts
- GET /monitoring/stock-alerts — Products below reorder level
- GET /monitoring/delivery — Active, delivered, and failed deliveries
- GET /monitoring/pl-today — Today's P&L snapshot
- GET /monitoring/orders — Real-time open orders board (limit 10)

**Real-Time Support:**
- SSE endpoint: GET /monitoring/stream (Server-Sent Events)
- WebSocket endpoint: ws://api/monitoring/live (optional)
- Polling fallback: Every 5-10 seconds

**Auth guard:** SUPER_ADMIN, ADMIN, MANAGER

### 11.3 — UI (Owner Monitoring — SUPER_ADMIN)
**Page:** Live Monitoring Dashboard  
**Route:** /monitoring  
**Components:** SalesTicker, RevenueCards, OpenOrderBoard, KitchenBarQueueSummary, RiskAlertPanel, StockAlertPanel, DeliveryStatusPanel, TodayPLCard  
**Access guard:** SUPER_ADMIN

### 11.4 — UI (Manager Monitoring — ADMIN, MANAGER)
**Page:** Operations Monitoring  
**Route:** /admin/monitoring  
**Components:** OperationsSummaryCards, QueueDelayPanel, ApprovalAlertList, StockWarningList, DeliveryTrackerSummary  
**Access guard:** ADMIN, MANAGER

### 11.5 — Live Data Refresh
**Method:** Polling/SSE (Server-Sent Events)  
**Refresh Intervals:**
- Sales ticker: Every 1-2 seconds
- Queue metrics: Every 10 seconds
- Risk alerts: Real-time push on threshold breach
- Stock alerts: Every 30 seconds
- Delivery status: Every 20 seconds

**Fallback:** Manual refresh button if live channel unavailable

### Features Required

#### Live Metrics Cards (8)
1. **Current Sales** - Today's revenue ticker
2. **Open Orders** - Real-time order count
3. **Active Staff** - Currently clocked in
4. **Kitchen Queue** - Orders in kitchen
5. **Bar Queue** - Drinks in progress
6. **Active Deliveries** - Deliveries in transit
7. **Pending Approvals** - Awaiting decisions
8. **High Risk Alerts** - Staff risk warnings

**Source:** GET /monitoring/summary

#### Revenue Ticker
- **Display:**
  - Real-time revenue counter
  - Updates every second
  - Today's P&L snapshot
- **Source:** GET /monitoring/pl-today

#### Open Order Board
- **Display:**
  - Order number, table, status
  - Color-coded by age
  - Limited to 10 most recent
- **Source:** GET /monitoring/orders

#### Kitchen & Bar Queue Summary
- **Display:**
  - Queue counts by status
  - Delayed orders (>15 min highlighted)
  - Average preparation time
- **Source:** GET /monitoring/kitchen-bar

#### Risk Alert Panel
- **Display:**
  - HIGH and CRITICAL staff risks
  - Incident type, staff name
  - Severity badge
- **Source:** GET /monitoring/risk-alerts

#### Stock Alert Panel
- **Display:**
  - Products below reorder level
  - Out of stock items
  - Criticality indicator
- **Source:** GET /monitoring/stock-alerts

#### Delivery Status Panel
- **Display:**
  - Active deliveries count
  - Delivered today
  - Failed deliveries
  - Average delivery time
- **Source:** GET /monitoring/delivery

#### Live Data Refresh
- **Method:** Polling or Server-Sent Events (SSE)
- **Interval:** Every 5-10 seconds
- **Fallback:** Manual refresh button

### API Endpoints Required
- GET /monitoring/summary
- GET /monitoring/pl-today
- GET /monitoring/orders
- GET /monitoring/kitchen-bar
- GET /monitoring/risk-alerts
- GET /monitoring/stock-alerts
- GET /monitoring/delivery

### Real-Time Features
- Sales ticker updates every second
- Queue counts update every 10 seconds
- Risk alerts appear immediately on threshold breach
- Visual/audio notifications for critical events

---

## Common Dashboard Patterns

### Standard Components

#### Summary Card
```typescript
type SummaryCard = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
  color: string;
};
```

#### Status Badge
```typescript
type StatusBadge = {
  status: string;
  colorScheme: "amber" | "blue" | "emerald" | "red" | "purple" | "gray";
};
```

#### Alert Banner
```typescript
type Alert = {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  action?: { label: string; href: string };
};
```

### Auto-Refresh Strategy

| Dashboard Type | Refresh Interval | Method |
|----------------|------------------|--------|
| Operational (Kitchen, Bar, POS) | 10-30s | Polling |
| Oversight (Admin, Manager) | 60s | Polling |
| Staff (Storekeeper, Accountant, HR) | 60-120s | Polling |
| Monitoring (Super Admin) | 5-10s | SSE/Polling |

### Error Handling
- Show error state with retry button
- Preserve last known good data
- Display user-friendly error messages
- Log errors to console for debugging

### Loading States
- Skeleton loaders for cards and lists
- Spinner for full page loads
- Maintain layout during loading

### Responsive Design
- Mobile: Stack cards vertically
- Tablet: 2-column grid
- Desktop: 3-4 column grid
- Always maintain readability

---

## Implementation Priority

### Phase 1 (✅ COMPLETE)
1. Admin Dashboard
2. Cashier Dashboard
3. Barman Dashboard
4. Staff Dashboard (Storekeeper, Accountant, HR)
5. Dispatcher Dashboard

### Phase 2 (⚠️ IN PROGRESS)
6. Waiter Dashboard Enhancement → `/pos/menu`
7. Chef Dashboard Redirect → `/kitchen/queue`
8. Manager Dashboard Enhancement

### Phase 3 (❌ PENDING)
9. Super Admin Monitoring Dashboard
10. Real-time live features (SSE/WebSockets)
11. Mobile-optimized views

---

## Testing Checklist

For each dashboard, verify:

- [ ] All summary cards load correct data
- [ ] Auto-refresh works at specified interval
- [ ] Manual refresh button works
- [ ] Quick actions navigate correctly
- [ ] Error states display properly
- [ ] Loading states appear during data fetch
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Role-based access control enforced
- [ ] API endpoints return expected data format
- [ ] Real-time updates reflect in UI
- [ ] Notifications/alerts display when triggered
- [ ] Filter and search functions work (if applicable)
- [ ] Status updates persist to backend
- [ ] Logout redirects properly

---

## API Response Standards

### Standard Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-06-30T10:30:00Z"
}
```

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "timestamp": "2026-06-30T10:30:00Z"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## End of Dashboard Features Specification

**Last Updated:** June 30, 2026  
**Document Version:** 1.0  
**Status:** Living document - update as dashboards evolve
