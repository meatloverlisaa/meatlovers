# Meat Lovers CIMS — Feature Registry
Restaurant Operations, Inventory, POS, Finance & Staff Control Platform | Powered by YohPal Tech Stack: NestJS · Next.js 14+ · PostgreSQL/MySQL · Prisma · Tailwind CSS · JWT Auth

**Feature 1 — System Foundation & Authentication**
Branch: feature/1-auth Roles: SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, STOREKEEPER, BARMAN, DISPATCHER, ACCOUNTANT, HR

Description: Establish the secure system base for Meat Lovers CIMS, including staff identities, role permissions, audit visibility, login flows, and account provisioning before any operational module is built.

1.1 — Database
Tables: users, audit_logs
Migrations: create_users_table, create_audit_logs_table
Seeds: default_super_admin, seed_roles, seed_demo_users_per_role

1.2 — API (Staff Login — SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, STOREKEEPER, BARMAN, DISPATCHER, ACCOUNTANT, HR)
Endpoints:
POST /auth/login — Authenticate with email/phone + password, returns JWT
GET /auth/profile — Get current authenticated staff profile
POST /auth/refresh — Refresh access token
POST /auth/logout — Invalidate current session token
Auth guard: Public for login; JWT guard for profile/refresh/logout
Request: { email_or_phone, password }
Response: { access_token, refresh_token, user: { id, full_name, email, phone, role, is_active } }

1.3 — API (Role & Permission Enforcement — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /auth/roles — List supported Meat Lovers roles
PATCH /users/:id/status — Activate/deactivate staff account
PATCH /users/:id/role — Change staff role
Auth guard: SUPER_ADMIN, ADMIN

1.4 — UI (Admin Login — SUPER_ADMIN, ADMIN, MANAGER)
Page: Admin Login Page
Route: /admin/login
Components: LoginForm, RoleRedirect, ForgotPasswordLink, SessionErrorBanner
Access guard: Redirect to /admin after auth

1.5 — UI (Cashier Login — CASHIER)
Page: Cashier Login Page
Route: /cashier/login
Components: LoginForm, ShiftHint, RoleRedirect
Access guard: Redirect to cashier settlement workspace

1.6 — UI (POS Login — WAITER)
Page: Waiter POS Login
Route: /pos/login
Components: LoginForm, DeviceModeNotice, RoleRedirect
Access guard: Redirect to POS menu

1.7 — UI (Kitchen Login — CHEF)
Page: Kitchen Login Page
Route: /kitchen/login
Components: LoginForm, QueueAccessRedirect
Access guard: Redirect to kitchen queue

1.8 — UI (Bar Login — BARMAN)
Page: Bar Login Page
Route: /bar/login
Components: LoginForm, BarQueueRedirect
Access guard: Redirect to bar queue

1.9 — UI (Store, Dispatch, Finance & HR Login — STOREKEEPER, DISPATCHER, ACCOUNTANT, HR)
Page: Operational Staff Login
Route: /staff/login
Components: LoginForm, RoleWorkspaceSelector
Access guard: Redirect to the correct role workspace

1.10 — Credential Flow & Account Provisioning
Staff Accounts (SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, STOREKEEPER, BARMAN, DISPATCHER, ACCOUNTANT, HR)
Account decision: Staff accounts will be created by SUPER_ADMIN or ADMIN only. Meat Lovers CIMS will not allow staff self-registration or "create account then wait for approval" flows because POS, cashier, stock, kitchen, bar, finance, HR, and admin access must remain controlled by management from the start.
Account creation: SUPER_ADMIN or ADMIN creates staff accounts through user management and assigns the correct operational role.
Initial credentials: System generates a temporary password.
First login: Staff logs in with temporary password and must set a new password.
Password reset: SUPER_ADMIN or ADMIN can trigger reset; staff can request reset through approved recovery flow.

Test Criteria:

[ ] DB migration runs cleanly
[ ] Seed creates default SUPER_ADMIN and one user per operational role
[ ] API returns JWT on valid credentials per role
[ ] API returns 401 on invalid credentials and inactive users
[ ] UI login forms render and redirect correctly
[ ] Role guard blocks unauthorised routes
[ ] Audit log records login, logout, role change, and account status changes
[ ] Integration: login flow end-to-end

**Feature 2 — Public Website & Customer Acquisition**
Branch: feature/2-website-customer-acquisition Roles: Public (consume); SUPER_ADMIN, ADMIN, MANAGER (manage)

Description: Build the public-facing Meat Lovers website so customers can discover the restaurant, browse offers, submit catering or event enquiries, and become CRM leads.

2.1 — Database
Tables: content_pages, website_leads, lead_sources
Migrations: create_content_pages_table, create_website_leads_table, create_lead_sources_table
Seeds: seed_default_lead_sources, seed_homepage_content, seed_menu_highlights

2.2 — API (Public — No Auth)
Endpoints:
GET /website/home — Get homepage content, offers, menu highlights, contacts
GET /website/pages/:slug — Get published page content
GET /website/menu-highlights — List featured meals, drinks, platters, offers
POST /website/leads — Submit catering, reservation, event, or general enquiry
Auth guard: Public

2.3 — API (Website Management — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /cms/pages — List all content pages
POST /cms/pages — Create page or homepage section
PATCH /cms/pages/:id — Update content page
PATCH /cms/pages/:id/publish — Toggle publish status
GET /crm/leads — List captured website leads
PATCH /crm/leads/:id/status — Update lead status
GET /crm/leads/analytics — Lead source and conversion analytics
Auth guard: SUPER_ADMIN, ADMIN, MANAGER

2.4 — UI (Public Website)
Page: Meat Lovers Public Website
Route: /
Components:
Navbar: Logo, menu links, order CTA, contact CTA
HeroBanner: Meat Lovers brand, food imagery, primary CTA
MenuHighlights: Food, soft drinks, alcoholic drinks, platters, specials
CateringSection: Event/catering enquiry CTA and form link
AboutSection: Restaurant story, kitchen quality, service promise
ContactSection: Lead form, phone, email, location, map
Footer: Navigation, contacts, privacy link, social links

2.5 — UI (Admin CMS — SUPER_ADMIN, ADMIN, MANAGER)
Page: Website Content Manager
Route: /admin/cms
Components: PageList, PageEditor, LeadTable, LeadStatusBadge, ConversionAnalytics, HomepageSectionEditor
Access guard: SUPER_ADMIN, ADMIN, MANAGER

2.6 — Lead Capture Integration
Contact form posts to POST /website/leads with source = LANDING_PAGE
Catering enquiry buttons pre-fill source = CATERING_ENQUIRY
Reservation/event CTAs pre-fill source = EVENT_BOOKING
Captured leads appear in CRM dashboard for follow-up

Test Criteria:

[ ] DB migration runs cleanly
[ ] API serves homepage and published pages publicly
[ ] API captures customer leads with source tracking
[ ] Landing page renders without authentication
[ ] Website content manager creates, edits, and publishes sections
[ ] Lead conversion tracking works end-to-end
[ ] Responsive design works on mobile and desktop

**Feature 3 — Admin Dashboard Shell & Operational Navigation**
Branch: feature/3-admin-dashboard-shell Roles: SUPER_ADMIN, ADMIN, MANAGER, ACCOUNTANT, HR, STOREKEEPER

Description: Provide the shared internal workspace that gives each back-office user a role-appropriate starting point, navigation menu, summary cards, alerts, and links into their modules.

3.1 — Database
Tables: no new tables; uses users, audit_logs, orders, payments, stock_items, website_leads, approval_requests
Migrations: add dashboard indexes if required
Seeds: seed_dashboard_shortcuts

3.2 — API (Dashboard Summary — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /admin/dashboard/summary — Sales, orders, stock alerts, leads, approvals
GET /admin/dashboard/activity — Recent operational activity and audit events
GET /admin/dashboard/alerts — Stock, margin, payment, approval, risk alerts
Auth guard: SUPER_ADMIN, ADMIN, MANAGER

3.3 — API (Role Dashboard Summary — ACCOUNTANT, HR, STOREKEEPER)
Endpoints:
GET /staff/dashboard/summary — Role-specific summary cards
GET /staff/dashboard/tasks — Pending tasks for current role
Auth guard: ACCOUNTANT, HR, STOREKEEPER

3.4 — UI (Admin Dashboard — SUPER_ADMIN, ADMIN, MANAGER)
Page: Admin Operations Dashboard
Route: /admin
Components: SummaryCards, RevenueSnapshot, OpenOrdersWidget, StockAlertWidget, ApprovalQueueWidget, LeadWidget, ActivityTimeline
Access guard: SUPER_ADMIN, ADMIN, MANAGER

3.5 — UI (Role Dashboard — ACCOUNTANT, HR, STOREKEEPER)
Page: Staff Back-Office Dashboard
Route: /staff
Components: RoleSummaryCards, PendingTasks, QuickActions, AlertList
Access guard: ACCOUNTANT, HR, STOREKEEPER

Test Criteria:

[ ] Dashboard API aggregates from existing modules accurately
[ ] Navigation hides routes the current role cannot access
[ ] Summary cards match source module totals
[ ] Alert widgets update after source data changes
[ ] Role guard blocks unauthorised dashboard access

**Feature 4 — Product Segmentation & Pricing Control**
Branch: feature/4-products-pricing Roles: SUPER_ADMIN, ADMIN, MANAGER, ACCOUNTANT

Description: Define Meat Lovers sellable items and pricing rules across food, soft drinks, and alcoholic drinks, with margin controls to prevent unapproved losses.

4.1 — Database
Tables: products, pricing_rules, price_change_audit, margin_alerts
Migrations: create_products_table, create_pricing_rules_table, create_price_change_audit_table, create_margin_alerts_table
Seeds: seed_default_product_categories, seed_default_margin_rules

4.2 — API (Product Catalogue — ADMIN, MANAGER)
Endpoints:
POST /products — Create product with category FOOD, SOFT_DRINK, or ALCOHOLIC_DRINK
GET /products — List products with category/status filters
GET /products/:id — Get product detail
PATCH /products/:id — Update product and write price audit when price changes
DELETE /products/:id — Soft delete product
Auth guard: ADMIN, MANAGER

4.3 — API (Pricing Rules — SUPER_ADMIN, ADMIN, ACCOUNTANT)
Endpoints:
POST /pricing-rules — Set minimum margin and maximum discount by category
GET /pricing-rules — List active and historical rules
PATCH /pricing-rules/:id — Update rule status or thresholds
GET /margin-alerts — List open margin alerts
PATCH /margin-alerts/:id/status — Review or resolve margin alert
Auth guard: SUPER_ADMIN, ADMIN, ACCOUNTANT

4.4 — UI (Product Management — ADMIN, MANAGER)
Page: Product Management
Route: /admin/products
Components: ProductTable, ProductCreateForm, ProductEditDrawer, CategoryFilter, ActiveStatusToggle
Access guard: ADMIN, MANAGER

4.5 — UI (Pricing Control — SUPER_ADMIN, ADMIN, ACCOUNTANT)
Page: Pricing Control
Route: /admin/pricing-control
Components: PricingRuleForm, PricingRuleTable, MarginAlertPanel, PriceAuditTimeline
Access guard: SUPER_ADMIN, ADMIN, ACCOUNTANT

Test Criteria:

[ ] Product CRUD succeeds with valid category and pricing data
[ ] Price change writes price_change_audit record
[ ] Margin alert is created when price falls below allowed margin
[ ] Pricing rule blocks unapproved discounts below threshold
[ ] ACCOUNTANT can view pricing risk but cannot delete products

**Feature 5 — Supplier & Procurement Management**
Branch: feature/5-suppliers-procurement Roles: ADMIN, MANAGER, STOREKEEPER, ACCOUNTANT

Description: Manage Meat Lovers suppliers, supplier status, purchase sources, and procurement accountability for food, drinks, alcohol, and general operating supplies.

5.1 — Database
Tables: suppliers
Migrations: create_suppliers_table
Seeds: seed_supplier_types

5.2 — API (Supplier Administration — ADMIN, MANAGER)
Endpoints:
POST /suppliers — Register supplier
GET /suppliers — List/search suppliers
GET /suppliers/:id — Get supplier profile
PATCH /suppliers/:id — Update supplier details
PATCH /suppliers/:id/status — Toggle ACTIVE/SUSPENDED
Auth guard: ADMIN, MANAGER

5.3 — API (Supplier Lookup — STOREKEEPER, ACCOUNTANT)
Endpoints:
GET /suppliers — List active suppliers for stock-in and finance references
GET /suppliers/:id — View supplier detail
Auth guard: STOREKEEPER, ACCOUNTANT

5.4 — UI (Supplier Management — ADMIN, MANAGER)
Page: Supplier Management
Route: /admin/suppliers
Components: SupplierTable, SupplierCreateForm, SupplierEditForm, SupplierStatusToggle, SupplierTypeFilter
Access guard: ADMIN, MANAGER

5.5 — UI (Supplier Lookup — STOREKEEPER, ACCOUNTANT)
Page: Supplier Directory
Route: /staff/suppliers
Components: SupplierDirectoryTable, SupplierContactPanel, SupplierStatusBadge
Access guard: STOREKEEPER, ACCOUNTANT

Test Criteria:

[ ] Supplier creation succeeds with valid data
[ ] Status toggle switches ACTIVE and SUSPENDED correctly
[ ] Suspended suppliers cannot be selected for new stock purchase entries
[ ] STOREKEEPER and ACCOUNTANT have read-only supplier access
[ ] Role guard blocks unauthorised supplier edits

**Feature 6 — Inventory, Storekeeping & Stock Control**
Branch: feature/6-stock-control Roles: SUPER_ADMIN, ADMIN, MANAGER, STOREKEEPER, CHEF, BARMAN, ACCOUNTANT

Description: Track stock balances and stock movements from store purchases to kitchen usage, bar issues, adjustments, waste, and financial reconciliation.

6.1 — Database
Tables: stock_items, stock_movements
Migrations: create_stock_items_table, create_stock_movements_table
Seeds: seed_default_stock_locations, seed_reorder_levels

6.2 — API (Store Stock — ADMIN, MANAGER, STOREKEEPER)
Endpoints:
GET /stock — Current stock balances with product and location filters
POST /stock/purchase — Record purchase stock-in
POST /stock/adjustment — Record stock adjustment
POST /stock/transfer — Transfer stock to kitchen or bar
GET /stock/movements — List stock movements with date/type filters
Auth guard: ADMIN, MANAGER, STOREKEEPER

6.3 — API (Kitchen Stock Usage — CHEF)
Endpoints:
GET /stock/kitchen — Kitchen-relevant stock view
POST /stock/kitchen-usage — Record kitchen usage movement
POST /stock/waste — Record kitchen wastage movement
Auth guard: CHEF

6.4 — API (Bar Stock Usage — BARMAN)
Endpoints:
GET /stock/bar — Bar stock balance view
POST /stock/bar-sale — Record bar sale stock deduction
POST /stock/bar-adjustment — Record bar adjustment request
Auth guard: BARMAN

6.5 — API (Stock Valuation — ACCOUNTANT, ADMIN)
Endpoints:
GET /stock/valuation — Stock value summary by category/location
GET /stock/reorder-alerts — Items below reorder level
Auth guard: ACCOUNTANT, ADMIN

6.6 — UI (Storekeeping — STOREKEEPER, ADMIN, MANAGER)
Page: Stock Control
Route: /admin/stock
Components: StockBalanceTable, StockInForm, TransferForm, AdjustmentForm, ReorderAlertList, MovementTimeline
Access guard: ADMIN, MANAGER, STOREKEEPER

6.7 — UI (Kitchen Stock — CHEF)
Page: Kitchen Stock Usage
Route: /kitchen/stock
Components: KitchenStockTable, UsageForm, WasteShortcut, LowStockBanner
Access guard: CHEF

6.8 — UI (Bar Stock — BARMAN)
Page: Bar Stock Workspace
Route: /bar/stock
Components: BarStockTable, BarSaleDeductionForm, TransferReceiptList
Access guard: BARMAN

Test Criteria:

[ ] Stock quantities update correctly on purchase, transfer, sale, usage, waste, and adjustment
[ ] Reorder level breach appears in UI
[ ] Stock valuation matches quantity multiplied by product cost
[ ] BARMAN cannot access main store adjustment controls
[ ] CHEF cannot record bar sale movements

**Feature 7 — POS Menu, Tables & Order Capture**
Branch: feature/7-pos-orders Roles: WAITER, CASHIER, ADMIN, MANAGER

Description: Give waiters a fast mobile POS workflow for table orders, customer selection, cart editing, order submission, and order status tracking.

7.1 — Database ✅ COMPLETE
Tables: customers, tables, orders, order_items, approval_requests
Migrations: create_customers_table, create_tables_table, create_orders_table, create_order_items_table
Seeds: seed_default_tables

**Implementation Notes:**
- Migration: 20260629000000_feature7_pos_customers_approval_requests
- customers table: stores customer info (name, phone, email, notes)
- approval_requests table: handles ITEM_REMOVAL, DISCOUNT, PRICE_OVERRIDE, ORDER_CANCELLATION
- orders.customer_id: optional link to customer for tracking repeat customers
- seed_default_tables: 15 tables (Tables 1-10, Bar Counter, 2 Patio, Private Room, VIP)

7.2 — API (Waiter Order Capture — WAITER)
Endpoints:
GET /pos/menu — List active sellable products grouped by category
GET /tables — List tables and current table status
POST /orders — Create order with table/customer/waiter
POST /orders/:id/items — Add order item
PATCH /orders/:id/items/:itemId — Update item quantity
DELETE /orders/:id/items/:itemId — Remove item before preparation or request approval
GET /orders/mine — List waiter orders
Auth guard: WAITER

7.3 — API (Order Oversight — CASHIER, ADMIN, MANAGER)
Endpoints:
GET /orders — List orders with status, table, waiter, date filters
GET /orders/:id — Get full order detail
PATCH /orders/:id/status — Update order status when authorised
PATCH /orders/:id/discount — Apply discount or create approval request
Auth guard: CASHIER, ADMIN, MANAGER

7.4 — UI (POS PWA — WAITER)
Page: POS Menu
Route: /pos/menu
Components: MenuCategoryTabs, ProductTileGrid, TableSelector, CustomerSelector, CartDrawer, SubmitOrderButton
Access guard: WAITER

7.5 — UI (Order Tracker — WAITER)
Page: My Orders
Route: /pos/orders
Components: OrderStatusTracker, OrderDetailPanel, EditRequestButton, ReadyNotification
Access guard: WAITER

7.6 — UI (Order Management — CASHIER, ADMIN, MANAGER) ✅ IMPLEMENTED
Page: Order Management
Route: /admin/orders
Components: OrderTable, StatusFilter, OrderDetailDrawer, DiscountRequestPanel
Access guard: CASHIER, ADMIN, MANAGER

**Landing Pages Created:**
- ✅ /cashier - Cashier Dashboard (pending settlement, revenue stats)
- ✅ /manager - Manager Dashboard (operations oversight, alerts)
- ✅ /admin/orders - Order Management Page (full order control)

Test Criteria:

[ ] Order number is generated uniquely
[ ] Cart subtotal, discount, and total calculate correctly
[ ] Status transitions follow PENDING to PREPARING to READY to SERVED to PAID
[ ] Item removal after preparation creates approval request
[ ] POS works on mobile viewport
[ ] CASHIER can see orders due for settlement

**Feature 8 — Kitchen Queue & Food Preparation**
Branch: feature/8-kitchen-operations Roles: CHEF, WAITER, ADMIN, MANAGER

Description: Separate food preparation work from general ordering so chefs only see food items, update preparation status, and keep waiters informed when meals are ready.

8.1 — Database
Tables: no new tables; uses orders, order_items, products, ingredient_consumption, stock_movements
Migrations: add kitchen queue indexes if required
Seeds: none

8.2 — API (Kitchen Queue — CHEF)
Endpoints:
GET /kitchen/queue — Food order items in PENDING/PREPARING status
PATCH /kitchen/orders/:id/status — Mark order or food items PREPARING/READY
POST /kitchen/orders/:id/notes — Add preparation note
POST /ingredient-consumption — Log ingredient usage from production or order
Auth guard: CHEF

8.3 — API (Kitchen Visibility — WAITER, ADMIN, MANAGER)
Endpoints:
GET /kitchen/orders/:id/status — Get kitchen preparation state
GET /kitchen/summary — Preparation workload and aging orders
Auth guard: WAITER, ADMIN, MANAGER

8.4 — UI (Kitchen Screen — CHEF)
Page: Kitchen Monitoring Screen
Route: /kitchen
Components: KitchenQueueBoard, OrderTicket, PrepTimer, ReadyButton, ItemNotesPanel
Access guard: CHEF

8.5 — UI (Kitchen Oversight — ADMIN, MANAGER)
Page: Kitchen Operations Summary
Route: /admin/kitchen
Components: PrepTimeMetrics, DelayedOrdersList, ChefActivityTimeline
Access guard: ADMIN, MANAGER

Test Criteria:

[ ] Kitchen queue shows FOOD items only
[ ] Chef status updates reflect in POS order tracker
[ ] Preparation notes remain tied to the correct order
[ ] Delayed orders are highlighted for manager review
[ ] CHEF cannot see payment controls

**Feature 9 — Bar Queue & Drink Service**
Branch: feature/9-bar-operations Roles: BARMAN, WAITER, ADMIN, MANAGER, STOREKEEPER

Description: Give the bar a dedicated workflow for soft drinks and alcoholic drinks, including queue handling, stock deduction, and transfer receipt visibility.

9.1 — Database
Tables: no new tables; uses orders, order_items, products, stock_items, stock_movements
Migrations: add bar queue indexes if required
Seeds: none

9.2 — API (Bar Queue — BARMAN)
Endpoints:
GET /bar/queue — Drink order items in PENDING/PREPARING status
PATCH /bar/orders/:id/status — Mark drink items PREPARING/READY
POST /stock/bar-sale — Deduct bar stock for served drinks
GET /bar/transfers — View stock transfers sent to bar
Auth guard: BARMAN

9.3 — API (Bar Oversight — ADMIN, MANAGER, STOREKEEPER)
Endpoints:
GET /bar/summary — Bar order volume, pending drinks, stock movement summary
GET /bar/stock-movements — Bar stock movement log
Auth guard: ADMIN, MANAGER, STOREKEEPER

9.4 — UI (Bar Workspace — BARMAN)
Page: Bar Queue
Route: /bar
Components: BarQueueBoard, DrinkTicket, ReadyButton, StockDeductionPrompt, TransferReceiptPanel
Access guard: BARMAN

9.5 — UI (Bar Oversight — ADMIN, MANAGER, STOREKEEPER)
Page: Bar Operations Summary
Route: /admin/bar
Components: BarSalesSummary, PendingDrinkList, BarStockMovementTable
Access guard: ADMIN, MANAGER, STOREKEEPER

Test Criteria:

[ ] Bar queue shows SOFT_DRINK and ALCOHOLIC_DRINK items only
[ ] Drink-ready state reflects on waiter order tracker
[ ] Bar sale deducts bar stock
[ ] STOREKEEPER can verify bar transfers without serving drinks
[ ] BARMAN cannot access kitchen food queue

**Feature 10 — Payments, Cashier Settlement & Receipts**
Branch: feature/10-payments-cashier Roles: CASHIER, ACCOUNTANT, ADMIN, MANAGER

Description: Settle Meat Lovers orders accurately through cash, M-Pesa, card, or split payments, issue receipts, and make payment data available for finance reconciliation.

10.1 — Database
Tables: payments
Migrations: create_payments_table
Seeds: seed_payment_methods

10.2 — API (Cashier Settlement — CASHIER)
Endpoints:
POST /payments — Record payment for order; supports split payments
GET /payments/order/:orderId — Get payments for an order
PATCH /payments/:id/status — Mark payment SUCCESS/FAILED/REFUNDED
POST /payments/:id/receipt — Generate receipt payload
Auth guard: CASHIER

10.3 — API (Payment Review — ACCOUNTANT, ADMIN, MANAGER)
Endpoints:
GET /payments — Full payment log with date/method/status filters
GET /payments/summary — Daily/weekly/monthly payment summary
GET /payments/variance — Compare paid orders against received payments
Auth guard: ACCOUNTANT, ADMIN, MANAGER

10.4 — UI (Cashier Settlement — CASHIER)
Page: Cashier Settlement
Route: /cashier/settle/:orderId
Components: OrderBillSummary, PaymentMethodSelector, SplitPaymentRows, TransactionReferenceField, ReceiptPreview, PrintReceiptButton
Access guard: CASHIER

10.5 — UI (Payment Log — ACCOUNTANT, ADMIN, MANAGER)
Page: Payment Management
Route: /admin/payments
Components: PaymentTable, MethodFilter, StatusBadge, PaymentSummaryCards, VariancePanel
Access guard: ACCOUNTANT, ADMIN, MANAGER

Test Criteria:

[ ] Split payments sum exactly to order total
[ ] Order status updates to PAID after successful full settlement
[ ] Receipt includes order items, totals, taxes/discounts, and payment methods
[ ] Failed payments do not mark order as PAID
[ ] ACCOUNTANT can review but not alter cashier settlement without approval

**Feature 11 — Dispatch & Delivery Management**
Branch: feature/11-dispatch-delivery Roles: DISPATCHER, CASHIER, WAITER, ADMIN, MANAGER

Description: Manage delivery orders from customer address capture to rider assignment, dispatch, delivery completion, failed delivery handling, and admin review.

11.1 — Database
Tables: deliveries
Migrations: create_deliveries_table
Seeds: none

11.2 — API (Delivery Creation — WAITER, CASHIER)
Endpoints:
POST /deliveries — Create delivery record for delivery customer order
GET /deliveries/order/:orderId — Get delivery details for order
PATCH /deliveries/:id/address — Update delivery address before dispatch
Auth guard: WAITER, CASHIER

11.3 — API (Dispatch Operations — DISPATCHER)
Endpoints:
GET /deliveries — List pending and active deliveries
PATCH /deliveries/:id — Assign rider name, phone, and delivery notes
PATCH /deliveries/:id/status — Move PENDING to DISPATCHED to DELIVERED or FAILED
Auth guard: DISPATCHER

11.4 — API (Delivery Oversight — ADMIN, MANAGER)
Endpoints:
GET /deliveries — Full delivery log with date/status/rider filters
GET /deliveries/summary — Delivery success, failure, and active dispatch summary
Auth guard: ADMIN, MANAGER

11.5 — UI (Dispatch Workspace — DISPATCHER)
Page: Dispatch Operations
Route: /dispatch
Components: PendingDeliveryTable, RiderAssignmentForm, DeliveryStatusStepper, FailedDeliveryReasonField
Access guard: DISPATCHER

11.6 — UI (Delivery Tracking — ADMIN, MANAGER)
Page: Delivery Tracking
Route: /admin/delivery-tracking
Components: DeliveryMapPanel, DeliveryLogTable, StatusFilter, RiderSummaryCards
Access guard: ADMIN, MANAGER

Test Criteria:

[ ] Delivery record links to correct order and customer
[ ] Status transitions follow PENDING to DISPATCHED to DELIVERED/FAILED
[ ] Failed deliveries remain visible for admin review
[ ] DISPATCHER cannot update payments or menu products
[ ] Admin delivery log reflects dispatcher updates immediately

**Feature 12 — Recipe Management & Menu Engineering**
Branch: feature/12-recipes-menu-engineering Roles: CHEF, ADMIN, MANAGER, ACCOUNTANT

Description: Define recipes and ingredient bills of materials so Meat Lovers can understand food cost, production needs, and menu profitability.

12.1 — Database
Tables: recipes, recipe_items
Migrations: create_recipes_table, create_recipe_items_table
Seeds: seed_sample_recipes

12.2 — API (Recipe Setup — ADMIN, MANAGER, CHEF)
Endpoints:
POST /recipes — Create recipe for menu product
GET /recipes — List recipes with ingredients and costs
GET /recipes/:id — Get recipe detail
PATCH /recipes/:id — Update serving size, active state, or ingredient list
DELETE /recipes/:id — Soft deactivate recipe
Auth guard: ADMIN, MANAGER, CHEF

12.3 — API (Recipe Costing — ACCOUNTANT, ADMIN, MANAGER)
Endpoints:
GET /recipes/:id/costing — Calculate recipe cost, selling price, and gross margin
GET /recipes/margin-summary — Compare recipe margins by product category
Auth guard: ACCOUNTANT, ADMIN, MANAGER

12.4 — UI (Recipe Management — CHEF, ADMIN, MANAGER)
Page: Recipe Setup
Route: /admin/recipes
Components: RecipeTable, RecipeBuilderForm, IngredientRows, ServingSizeInput, RecipeStatusToggle
Access guard: CHEF, ADMIN, MANAGER

12.5 — UI (Menu Engineering — ACCOUNTANT, ADMIN, MANAGER)
Page: Menu Engineering
Route: /admin/menu-engineering
Components: RecipeCostCard, MarginComparisonTable, PricingSuggestionPanel
Access guard: ACCOUNTANT, ADMIN, MANAGER

Test Criteria:

[ ] Recipe can be created with multiple ingredients
[ ] Ingredient cost rolls up into recipe cost
[ ] Recipe margin summary matches product selling price and stock costs
[ ] CHEF can manage recipe content but cannot approve pricing rules
[ ] ACCOUNTANT can review costing without editing kitchen recipes unless authorised

**Feature 13 — Production Planning & Ingredient Consumption**
Branch: feature/13-production-planning Roles: CHEF, ADMIN, MANAGER, STOREKEEPER, ACCOUNTANT

Description: Plan daily kitchen production, execute planned quantities, consume ingredients, and compare planned, produced, sold, and wasted food.

13.1 — Database
Tables: kitchen_production_plans, ingredient_consumption
Migrations: create_kitchen_production_plans_table, create_ingredient_consumption_table
Seeds: none

13.2 — API (Production Planning — ADMIN, MANAGER, CHEF)
Endpoints:
POST /production-plans — Create daily production plan
GET /production-plans — List production plans by date/status
GET /production-plans/:id — Get production plan detail
PATCH /production-plans/:id — Update planned quantity or notes
PATCH /production-plans/:id/status — Move PLANNED to IN_PROGRESS to COMPLETED to CLOSED
Auth guard: ADMIN, MANAGER, CHEF

13.3 — API (Consumption Logging — CHEF, STOREKEEPER)
Endpoints:
POST /ingredient-consumption — Log consumed ingredient quantity
GET /ingredient-consumption — List consumption by product/date/source
POST /stock/kitchen-usage — Create linked stock movement for kitchen usage
Auth guard: CHEF, STOREKEEPER

13.4 — API (Production Finance Review — ACCOUNTANT, ADMIN)
Endpoints:
GET /production-plans/variance — Planned vs produced vs sold vs wasted comparison
GET /production-plans/cost-summary — Production cost summary by period
Auth guard: ACCOUNTANT, ADMIN

13.5 — UI (Production Planning — CHEF, ADMIN, MANAGER)
Page: Production Plans
Route: /admin/production-plans
Components: ProductionPlanCalendar, PlanCreateForm, ProductionStatusStepper, PlannedVsProducedGrid
Access guard: CHEF, ADMIN, MANAGER

13.6 — UI (Production Execution — CHEF, STOREKEEPER)
Page: Kitchen Production Execution
Route: /kitchen/production
Components: ActivePlanList, ConsumptionForm, IngredientDeductionPreview, CompletePlanButton
Access guard: CHEF, STOREKEEPER

13.7 — UI (Production Review — ACCOUNTANT, ADMIN)
Page: Production Cost Review
Route: /admin/production-costs
Components: VarianceTable, CostSummaryCards, WasteCostPanel
Access guard: ACCOUNTANT, ADMIN

Test Criteria:

[ ] Production plan status follows PLANNED to IN_PROGRESS to COMPLETED to CLOSED
[ ] Completing production deducts ingredients from stock
[ ] Planned, produced, sold, and wasted quantities reconcile
[ ] Production cost summary reflects ingredient consumption
[ ] STOREKEEPER can verify consumption without editing recipe pricing

**Feature 14 — Waste, Unsold Food & Loss Control**
Branch: feature/14-waste-loss-control Roles: CHEF, STOREKEEPER, ADMIN, MANAGER, ACCOUNTANT

Description: Record unsold cooked food, production wastage, stock wastage, reasons, estimated costs, and finance impact for loss prevention.

14.1 — Database
Tables: unsold_food, food_wastage, stock_movements
Migrations: create_unsold_food_table, create_food_wastage_table, extend_stock_movements_for_wastage
Seeds: seed_wastage_reasons

14.2 — API (Waste Declaration — CHEF, STOREKEEPER)
Endpoints:
POST /unsold-food — Declare unsold cooked food
GET /unsold-food/mine — View own declarations
POST /food-wastage — Record production wastage with reason and cost estimate
POST /stock/waste — Record stock wastage movement
Auth guard: CHEF, STOREKEEPER

14.3 — API (Waste Review — ADMIN, MANAGER, ACCOUNTANT)
Endpoints:
GET /unsold-food — Full unsold food list with filters
GET /food-wastage — Full food wastage list with filters
GET /waste/summary — Wastage totals, reasons, estimated cost, P&L impact
PATCH /waste/:id/review — Mark declaration reviewed/resolved
Auth guard: ADMIN, MANAGER, ACCOUNTANT

14.4 — UI (Waste Declaration — CHEF, STOREKEEPER)
Page: Waste Declaration
Route: /kitchen/waste
Components: UnsoldFoodForm, WastageReasonSelect, QuantityInput, MyDeclarationsTable
Access guard: CHEF, STOREKEEPER

14.5 — UI (Waste Review — ADMIN, MANAGER, ACCOUNTANT)
Page: Waste Control
Route: /admin/waste
Components: WasteSummaryCards, WasteDeclarationTable, ReasonBreakdownChart, ReviewActionPanel
Access guard: ADMIN, MANAGER, ACCOUNTANT

Test Criteria:

[ ] Unsold food declaration records product, quantity, reason, and declarer
[ ] Waste movement reduces relevant stock balance
[ ] Estimated waste cost flows into finance P&L
[ ] CHEF sees own declarations; ADMIN and MANAGER see all
[ ] ACCOUNTANT can review financial impact without deleting declarations

**Feature 15 — Finance, Expenses & P&L Reporting**
Branch: feature/15-finance-pl Roles: ACCOUNTANT, SUPER_ADMIN, ADMIN, MANAGER, CASHIER

Description: Centralise income, expenses, payment summaries, wastage costs, stock values, and daily/weekly/monthly/annual profit and loss reporting.

15.1 — Database
Tables: finance_transactions, payments, unsold_food, food_wastage, stock_items
Migrations: create_finance_transactions_table, add_finance_indexes
Seeds: seed_finance_categories

15.2 — API (Finance Transactions — ACCOUNTANT)
Endpoints:
POST /finance/transactions — Record INCOME or EXPENSE entry
GET /finance/transactions — List transactions by date/type/category
GET /finance/transactions/:id — Get transaction detail
PATCH /finance/transactions/:id — Update transaction before locked period
Auth guard: ACCOUNTANT

15.3 — API (P&L Reporting — ACCOUNTANT, SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /finance/pl — P&L summary by daily, weekly, monthly, annual period
GET /finance/sales-summary — Sales income from paid orders
GET /finance/expense-summary — Expenses, waste costs, and stock adjustments
GET /finance/reconciliation — Compare payments, orders, and finance entries
Auth guard: ACCOUNTANT, SUPER_ADMIN, ADMIN, MANAGER

15.4 — API (Cashier Finance Feed — CASHIER)
Endpoints:
GET /finance/cashier-shift-summary — Own cashier payment totals for current shift/date
Auth guard: CASHIER

15.5 — UI (Finance Dashboard — ACCOUNTANT, SUPER_ADMIN, ADMIN, MANAGER)
Page: Finance Dashboard
Route: /admin/finance
Components: PLSummaryCards, TransactionLogTable, PeriodSelector, ReconciliationPanel, ExpenseCategoryChart
Access guard: ACCOUNTANT, SUPER_ADMIN, ADMIN, MANAGER

15.6 — UI (Cashier Shift Summary — CASHIER)
Page: Cashier Shift Summary
Route: /cashier/summary
Components: ShiftPaymentTotals, PaymentMethodBreakdown, VarianceNotice
Access guard: CASHIER

Test Criteria:

[ ] P&L aggregates payments as income and finance transactions as expenses
[ ] Waste and stock variance costs appear in expense totals
[ ] Period filters return date-bounded data correctly
[ ] Reconciliation identifies mismatched orders/payments
[ ] CASHIER sees own shift totals only

**Feature 16 — Asset Inventory & Maintenance Control**
Branch: feature/16-assets-maintenance Roles: ADMIN, MANAGER, ACCOUNTANT, HR

Description: Track restaurant assets such as kitchen equipment, furniture, POS devices, bar equipment, and maintenance/disposal status.

16.1 — Database
Tables: assets, audit_logs
Migrations: create_assets_table
Seeds: seed_asset_categories

16.2 — API (Asset Register — ADMIN, MANAGER)
Endpoints:
POST /assets — Register asset
GET /assets — List assets by category/status
GET /assets/:id — Get asset detail
PATCH /assets/:id — Update asset details
PATCH /assets/:id/status — Mark ACTIVE, DAMAGED, or DISPOSED
Auth guard: ADMIN, MANAGER

16.3 — API (Asset Finance & HR Review — ACCOUNTANT, HR)
Endpoints:
GET /assets — Read-only asset register
GET /assets/summary — Asset cost and status summary
GET /assets/:id/audit — Asset status history
Auth guard: ACCOUNTANT, HR

16.4 — UI (Asset Management — ADMIN, MANAGER)
Page: Asset Register
Route: /admin/assets
Components: AssetTable, AssetCreateForm, AssetStatusSelector, MaintenanceNotesPanel, DisposalAction
Access guard: ADMIN, MANAGER

16.5 — UI (Asset Review — ACCOUNTANT, HR)
Page: Asset Review
Route: /staff/assets
Components: AssetDirectoryTable, AssetCostSummary, StatusBadge
Access guard: ACCOUNTANT, HR

Test Criteria:

[ ] Asset creation stores category, serial number, and purchase cost
[ ] Asset status transitions ACTIVE to DAMAGED to DISPOSED
[ ] Disposal and damage actions are audit logged
[ ] ACCOUNTANT and HR access is read-only
[ ] Asset summary totals match asset register data

**Feature 17 — HRM, Shifts, Attendance & Payroll Placeholders**
Branch: feature/17-hrm-attendance Roles: HR, ADMIN, MANAGER, SUPER_ADMIN, All Staff

Description: Manage shifts, duty rosters, attendance, lateness, absence records, and payroll placeholders for Meat Lovers staff.

17.1 — Database
Tables: staff_shifts, duty_rosters, staff_attendance, absence_reports, payroll_placeholders
Migrations: create_staff_shifts_table, create_duty_rosters_table, create_staff_attendance_table, create_absence_reports_table, create_payroll_placeholders_table
Seeds: seed_default_shifts

17.2 — API (Shift & Roster Management — HR, ADMIN, MANAGER)
Endpoints:
POST /shifts — Create shift definition
GET /shifts — List active/inactive shifts
PATCH /shifts/:id — Update shift details
POST /rosters — Assign staff to shift and date
GET /rosters — List rosters by date/department/staff
PATCH /rosters/:id/status — Update roster status
Auth guard: HR, ADMIN, MANAGER

17.3 — API (Staff Attendance — All Staff)
Endpoints:
POST /attendance/clock-in — Clock in for assigned shift
POST /attendance/clock-out — Clock out for assigned shift
GET /attendance/mine — View own attendance
Auth guard: SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, STOREKEEPER, BARMAN, DISPATCHER, ACCOUNTANT, HR

17.4 — API (Attendance Review & Payroll — HR, ADMIN, MANAGER)
Endpoints:
GET /attendance — Attendance log with filters
POST /absence-reports — Log absence
PATCH /absence-reports/:id/status — Approve/reject absence report
GET /payroll — Payroll placeholder list
PATCH /payroll/:id/status — Move DRAFT to REVIEWED to APPROVED to PAID
Auth guard: HR, ADMIN, MANAGER

17.5 — UI (HRM Dashboard — HR, ADMIN, MANAGER)
Page: HRM Dashboard
Route: /admin/hrm
Components: ShiftTable, RosterCalendar, AttendanceLog, AbsenceReportPanel, PayrollPlaceholderTable
Access guard: HR, ADMIN, MANAGER

17.6 — UI (Staff Clock-In — All Staff)
Page: Staff Attendance
Route: /staff/attendance
Components: ClockInButton, ClockOutButton, TodayShiftCard, MyAttendanceHistory
Access guard: All authenticated roles

Test Criteria:

[ ] Lateness calculates from clock_in_time against shift start_time plus grace_minutes
[ ] Absence can be reported and approved/rejected
[ ] Payroll net_pay = base_pay + bonus_pay - lateness_deduction - absence_deduction
[ ] Staff can only view own attendance unless HR/admin/manager
[ ] Roster status updates correctly

**Feature 18 — Staff Performance, Motivation & Service Scoring**
Branch: feature/18-staff-performance Roles: MANAGER, ADMIN, HR, SUPER_ADMIN, WAITER, CASHIER, CHEF, BARMAN, DISPATCHER

Description: Track performance contributions across service, sales, preparation, bar handling, dispatch, attendance, and customer-facing work to support fair motivation and management review.

18.1 — Database
Tables: staff_performance, orders, payments, staff_attendance, deliveries, staff_incidents
Migrations: create_staff_performance_table, add_performance_indexes
Seeds: seed_performance_metric_weights

18.2 — API (Performance Calculation — MANAGER, ADMIN, HR)
Endpoints:
GET /staff-performance — Performance metrics by staff/date/role
POST /staff-performance/recalculate — Recalculate scores for selected period
GET /staff-performance/leaderboard — Leaderboard by role and period
GET /staff-performance/:staffId/detail — Staff performance breakdown
Auth guard: MANAGER, ADMIN, HR

18.3 — API (Own Performance — WAITER, CASHIER, CHEF, BARMAN, DISPATCHER)
Endpoints:
GET /staff-performance/mine — View own score, sales/orders/tasks, attendance impact
Auth guard: WAITER, CASHIER, CHEF, BARMAN, DISPATCHER

18.4 — UI (Performance Management — MANAGER, ADMIN, HR)
Page: Staff Performance
Route: /admin/hrm/performance
Components: LeaderboardTable, RoleFilter, ScoreBreakdownPanel, BonusSuggestionPanel, AttendanceImpactBadge
Access guard: MANAGER, ADMIN, HR

18.5 — UI (My Performance — WAITER, CASHIER, CHEF, BARMAN, DISPATCHER)
Page: My Performance
Route: /staff/performance
Components: MyScoreCard, TaskMetrics, AttendanceImpact, ImprovementNotes
Access guard: WAITER, CASHIER, CHEF, BARMAN, DISPATCHER

Test Criteria:

[ ] Performance scores aggregate per staff per date
[ ] Waiter scores include served orders and sales contribution
[ ] Cashier scores include settled orders and variance checks
[ ] Chef and barman scores include completed queue items and delays
[ ] Dispatcher scores include delivered and failed deliveries
[ ] Staff see own performance only

**Feature 19 — CRM, Customer Retention & Loyalty**
Branch: feature/19-crm-loyalty Roles: ADMIN, MANAGER, WAITER, CASHIER

Description: Manage Meat Lovers customers, loyalty points, visit history, delivery profiles, corporate customers, and lead conversion from the website.

19.1 — Database
Tables: customers, website_leads, orders, payments
Migrations: ensure_customers_table, add_customer_indexes
Seeds: seed_customer_types

19.2 — API (Customer Management — ADMIN, MANAGER)
Endpoints:
POST /customers — Register new customer
GET /customers — List/search customers by name, phone, type
GET /customers/:id — Get customer profile
PATCH /customers/:id — Update customer profile
POST /customers/:id/loyalty — Add or adjust loyalty points
GET /customers/:id/history — Order, visit, payment, and delivery history
Auth guard: ADMIN, MANAGER

19.3 — API (Customer Lookup — WAITER, CASHIER)
Endpoints:
GET /customers/search — Search customer during POS or settlement
POST /customers/quick-create — Create minimal customer profile
GET /customers/:id/loyalty — View customer loyalty balance
Auth guard: WAITER, CASHIER

19.4 — API (Lead Conversion — ADMIN, MANAGER)
Endpoints:
GET /crm/leads — List website leads
PATCH /crm/leads/:id/status — Update NEW, CONTACTED, CONVERTED, CLOSED
POST /crm/leads/:id/convert — Convert lead into customer
GET /crm/segments — Customer segmentation analytics
Auth guard: ADMIN, MANAGER

19.5 — UI (CRM Dashboard — ADMIN, MANAGER)
Page: CRM Dashboard
Route: /admin/crm
Components: CustomerTable, CustomerProfileDrawer, LoyaltyPanel, VisitHistoryTimeline, LeadConversionBoard, SegmentFilter
Access guard: ADMIN, MANAGER

19.6 — UI (POS Customer Lookup — WAITER, CASHIER)
Page: Customer Lookup
Route: /pos/customers
Components: CustomerSearchField, QuickCustomerForm, LoyaltyBadge
Access guard: WAITER, CASHIER

Test Criteria:

[ ] Customer profile stores type, contacts, notes, and loyalty points
[ ] Loyalty points increment after paid order
[ ] Visit history reflects orders placed
[ ] Website lead converts into customer without duplicate profile
[ ] WAITER and CASHIER can lookup customers but cannot edit CRM segmentation settings

**Feature 20 — Approvals & Sensitive Action Control**
Branch: feature/20-approvals Roles: SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, STOREKEEPER, BARMAN, CHEF

Description: Protect sensitive operational actions such as order cancellations, discounts, refunds, stock adjustments, item removals, and wastage disputes through approval workflows.

20.1 — Database
Tables: approval_requests, audit_logs
Migrations: create_approval_requests_table
Seeds: seed_approval_types

20.2 — API (Approval Request — CASHIER, WAITER, STOREKEEPER, BARMAN, CHEF)
Endpoints:
POST /approvals — Submit approval request
GET /approvals/mine — List own approval requests
GET /approvals/:id — View own approval request detail
Auth guard: CASHIER, WAITER, STOREKEEPER, BARMAN, CHEF

20.3 — API (Approval Decision — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /approvals — Full approval queue
PATCH /approvals/:id — Approve or reject with notes
GET /approvals/summary — Approval volume and pending summary
Auth guard: SUPER_ADMIN, ADMIN, MANAGER

20.4 — UI (Approval Request Panels — CASHIER, WAITER, STOREKEEPER, BARMAN, CHEF)
Page: Approval Request Modal
Route: embedded in POS, cashier, stock, kitchen, and bar workflows
Components: ApprovalReasonField, RequestPreview, SubmitApprovalButton, MyApprovalStatusList
Access guard: CASHIER, WAITER, STOREKEEPER, BARMAN, CHEF

20.5 — UI (Approval Management — SUPER_ADMIN, ADMIN, MANAGER)
Page: Approval Management
Route: /admin/approvals
Components: ApprovalQueueTable, ApprovalDetailDrawer, ApproveButton, RejectButton, ApprovalSummaryCards
Access guard: SUPER_ADMIN, ADMIN, MANAGER

Test Criteria:

[ ] Sensitive actions are blocked until approval_status = APPROVED
[ ] Approval request stores request_data and request_reason
[ ] Approver notes and timestamp are saved
[ ] Requesting staff can track own request status
[ ] Rejected approval does not execute sensitive action

**Feature 21 — Enforcement Engine & Risk Scoring**
Branch: feature/21-enforcement-engine Roles: SUPER_ADMIN, ADMIN, MANAGER, HR, ACCOUNTANT

Description: Detect, score, and follow up operational risk across cash variance, stock variance, attendance violations, pricing violations, unauthorised discounts, incidents, and asset damage.

21.1 — Database
Tables: staff_incidents, enforcement_risk_scores, enforcement_actions, audit_logs
Migrations: create_staff_incidents_table, create_enforcement_risk_scores_table, create_enforcement_actions_table
Seeds: seed_incident_types, seed_enforcement_action_types

21.2 — API (Incident Logging — ADMIN, MANAGER, HR, ACCOUNTANT)
Endpoints:
POST /incidents — Log staff incident
GET /incidents — List incidents by staff, severity, status
GET /incidents/:id — Get incident detail
PATCH /incidents/:id/status — Update incident status
Auth guard: ADMIN, MANAGER, HR, ACCOUNTANT

21.3 — API (Risk Scoring — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /risk-scores — List staff risk scores
POST /risk-scores/recalculate — Recalculate risk for period
GET /risk-scores/:staffId — Get staff risk breakdown
Auth guard: SUPER_ADMIN, ADMIN, MANAGER

21.4 — API (Enforcement Actions — SUPER_ADMIN, ADMIN, MANAGER, HR)
Endpoints:
POST /enforcement-actions — Assign enforcement action
GET /enforcement-actions — List actions by status/staff
PATCH /enforcement-actions/:id/status — Update action progress
Auth guard: SUPER_ADMIN, ADMIN, MANAGER, HR

21.5 — UI (Enforcement Dashboard — SUPER_ADMIN, ADMIN, MANAGER)
Page: Enforcement Dashboard
Route: /admin/enforcement
Components: RiskScoreTable, RiskLevelBadge, IncidentTimeline, EnforcementActionPanel, RecalculateRiskButton
Access guard: SUPER_ADMIN, ADMIN, MANAGER

21.6 — UI (HR Follow-Up — HR)
Page: Staff Incident Follow-Up
Route: /admin/hrm/incidents
Components: IncidentTable, StaffActionList, FollowUpNotesPanel
Access guard: HR

21.7 — UI (Finance Risk Review — ACCOUNTANT)
Page: Cash and Stock Variance Review
Route: /admin/finance/risk
Components: CashVarianceList, StockVarianceList, IncidentCreateShortcut
Access guard: ACCOUNTANT

Test Criteria:

[ ] Risk score auto-calculates from incidents, approvals, stock, cash, attendance, and pricing violations
[ ] HIGH and CRITICAL risk levels appear in monitoring dashboard
[ ] Enforcement actions are assigned and tracked to completion
[ ] HR can manage staff follow-up without changing financial records
[ ] ACCOUNTANT can report cash/stock variance incidents

**Feature 22 — Live Monitoring & Owner Control Dashboard**
Branch: feature/22-live-monitoring Roles: SUPER_ADMIN, ADMIN, MANAGER

Description: Give owners and senior operators live visibility into sales, open orders, kitchen/bar queues, payments, stock alerts, delivery activity, P&L, and enforcement risks.

22.1 — Database
Tables: no new tables; aggregates from orders, payments, stock_items, deliveries, approval_requests, enforcement_risk_scores, finance_transactions
Migrations: add monitoring indexes or database views if required
Seeds: none

22.2 — API (Live Monitoring — SUPER_ADMIN, ADMIN, MANAGER)
Endpoints:
GET /monitoring/summary — Live sales, orders, revenue, active staff, pending approvals
GET /monitoring/kitchen-bar — Queue counts, delayed orders, ready items
GET /monitoring/risk-alerts — HIGH and CRITICAL staff risk alerts
GET /monitoring/stock-alerts — Products below reorder level
GET /monitoring/delivery — Active, delivered, and failed deliveries
GET /monitoring/pl-today — Today's P&L snapshot
Auth guard: SUPER_ADMIN, ADMIN, MANAGER

22.3 — UI (Owner Monitoring — SUPER_ADMIN)
Page: Live Monitoring Dashboard
Route: /monitoring
Components: SalesTicker, RevenueCards, OpenOrderBoard, KitchenBarQueueSummary, RiskAlertPanel, StockAlertPanel, DeliveryStatusPanel, TodayPLCard
Access guard: SUPER_ADMIN

22.4 — UI (Manager Monitoring — ADMIN, MANAGER)
Page: Operations Monitoring
Route: /admin/monitoring
Components: OperationsSummaryCards, QueueDelayPanel, ApprovalAlertList, StockWarningList, DeliveryTrackerSummary
Access guard: ADMIN, MANAGER

22.5 — Live Data Refresh
Polling/SSE: Refresh summary, queue, payment, and risk widgets without full page reload
Fallback: Manual refresh button if live channel is unavailable

Test Criteria:

[ ] Dashboard aggregates match source module totals
[ ] High-risk alerts appear immediately after risk threshold breach
[ ] Stock alerts match reorder calculations
[ ] Kitchen/bar delayed order counts match queue modules
[ ] P&L today snapshot matches finance module
[ ] Live refresh updates visible widgets without navigation

**Feature 23 — Repository Mapping, Local Deployment & Installer Support**
Branch: feature/23-deployment-support Roles: SUPER_ADMIN, ADMIN, Developer/Operator

Description: Package the Meat Lovers project for reliable local setup, environment configuration, repository ownership clarity, and operational handover.

23.1 — Database
Tables: no business tables; uses migrations and seed scripts
Migrations: validate_all_migrations
Seeds: validate_all_seed_scripts

23.2 — API (Health & Diagnostics — ADMIN, SUPER_ADMIN)
Endpoints:
GET /health — API health check
GET /health/db — Database connectivity check
GET /health/version — App version/build metadata
Auth guard: Public for /health; SUPER_ADMIN/ADMIN for detailed diagnostics

23.3 — UI (System Diagnostics — SUPER_ADMIN, ADMIN)
Page: System Diagnostics
Route: /admin/system
Components: HealthStatusCards, DatabaseStatusPanel, BuildVersionCard, EnvironmentChecklist
Access guard: SUPER_ADMIN, ADMIN

23.4 — Local Deployment Assets
Scripts: install dependencies, migrate database, seed database, start API, start UI
Docs: environment variables, ports, setup steps, troubleshooting, repository map
Installer: local operator setup checklist for Meat Lovers deployment machine

23.5 — Ownership & Recovery
Repository map: API modules, UI routes, Prisma schema, migrations, tests, docs
Recovery plan: restore dependencies, rebuild Prisma client, rerun migrations, restart services

Test Criteria:

[ ] Health endpoint returns API status
[ ] DB health endpoint detects database connectivity
[ ] Local setup guide can bootstrap API and UI from clean checkout
[ ] Repository map matches actual project folders
[ ] Diagnostics UI shows current service status

**Feature 24 — UAT, Go-Live Certification & Final Run-to-Green**
Branch: feature/24-uat-go-live Roles: SUPER_ADMIN, ADMIN, MANAGER, CASHIER, WAITER, CHEF, BARMAN, STOREKEEPER, DISPATCHER, ACCOUNTANT, HR

Description: Certify Meat Lovers CIMS across all roles before launch, using end-to-end user acceptance tests, operational checklists, and final data consistency checks.

24.1 — Database
Tables: no new tables; validates all schema objects
Migrations: run_full_migration_validation
Seeds: seed_uat_dataset

24.2 — API (UAT Support — SUPER_ADMIN, ADMIN)
Endpoints:
GET /uat/checklist — Get module readiness checklist
POST /uat/run-smoke-tests — Trigger smoke-test checklist status
GET /uat/data-consistency — Cross-module consistency report
Auth guard: SUPER_ADMIN, ADMIN

24.3 — UI (UAT Dashboard — SUPER_ADMIN, ADMIN, MANAGER)
Page: UAT & Go-Live Dashboard
Route: /admin/uat
Components: ModuleReadinessChecklist, RoleTestMatrix, SmokeTestStatus, DataConsistencyPanel, GoLiveSignoffCard
Access guard: SUPER_ADMIN, ADMIN, MANAGER

24.4 — Role-Based UAT Flows
WAITER: login, create order, track order status
CHEF: receive food ticket, mark preparing/ready, log usage/waste
BARMAN: receive drink ticket, mark ready, deduct bar stock
CASHIER: settle order, split payment, print receipt
STOREKEEPER: record purchase, transfer stock, review movement log
DISPATCHER: assign rider, update delivery status
ACCOUNTANT: review payments, expenses, P&L, variances
HR: roster staff, verify attendance, review performance
ADMIN/MANAGER: approve sensitive actions, manage products, suppliers, CRM, monitoring
SUPER_ADMIN: final monitoring, role access, system signoff

24.5 — Final Certification
Checklist: DB migration, API tests, UI tests, role guards, data consistency, backup readiness, deployment notes
Signoff: SUPER_ADMIN records final go-live approval

Test Criteria:

[ ] All feature smoke tests pass
[ ] Every role can complete its primary workflow
[ ] Role guards block unauthorised routes across the system
[ ] Data flows correctly through POS to kitchen/bar to payment to finance
[ ] Stock, waste, production, and finance totals reconcile
[ ] UAT signoff recorded before production go-live

Project Implementation Notes

Account Provisioning Decision:
All Meat Lovers CIMS staff accounts will be created by SUPER_ADMIN or ADMIN users. Staff users will not create their own accounts for later approval. This decision keeps operational access controlled, prevents unauthorised staff from entering sensitive modules, and gives management direct ownership over every role assignment.

Implementation Logging:
All implementation decisions, build notes, test logs, approval outcomes, merge notes, and operational procedures must be recorded in implementation.md after the relevant testing phase has been approved as operational.

Branching & Merge Procedure:
Every feature must be implemented on its own individual branch using the feature/[N]-[slug] pattern. A feature branch is merged into the stable branch only after its database, API, UI, role-guard, and integration testing phase is complete and approved.
