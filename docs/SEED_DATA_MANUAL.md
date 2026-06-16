# Meat Lovers CIMS powered by YohPal — Seed Data Manual
## Purpose
Seed data allows the system to boot with realistic restaurant data from day one.
## Seeded Users
| Role | Email |
|---|---|
| Super Admin | admin@meatlovers.local |
| Manager | manager@meatlovers.local |
| Cashier | cashier@meatlovers.local |
| Waiter | waiter@meatlovers.local |
| Chef | chef@meatlovers.local |
| Storekeeper | store@meatlovers.local |
| Barman | bar@meatlovers.local |
## Important Password Rule
The seeded `password_hash` values are placeholders.
Before real login testing, developers must replace:
```text
$2y$10$CHANGE_THIS_HASH_BEFORE_PRODUCTION
with a real PHP password hash generated using:
password_hash('your-password', PASSWORD_BCRYPT);

Seeded Product Categories
The system separates products into:
1. Food
2. Soft drinks
3. Alcoholic drinks
This supports:
bar accountability
kitchen accountability
stock separation
sales analysis
P&L separation

Seed Execution Order
Run migrations first, then seeds.
Recommended order:
SOURCE database/migrations/002_users.sql;
SOURCE database/migrations/003_customers.sql;
SOURCE database/migrations/004_suppliers.sql;
SOURCE database/migrations/005_products.sql;
SOURCE database/migrations/006_stock_items.sql;
SOURCE database/migrations/007_stock_movements.sql;
SOURCE database/migrations/008_orders.sql;
SOURCE database/migrations/009_order_items.sql;
SOURCE database/migrations/010_payments.sql;
SOURCE database/migrations/011_assets.sql;
SOURCE database/migrations/012_unsold_food.sql;
SOURCE database/migrations/013_deliveries.sql;
SOURCE database/migrations/014_audit_logs.sql;
SOURCE database/migrations/015_finance_transactions.sql;
SOURCE database/migrations/016_staff_performance.sql;
SOURCE database/migrations/017_restaurant_tables.sql;
SOURCE database/seeds/013_seed_loader.sql;


Seed Data Purpose
This seed pack allows developers to immediately test:
login users
product listing
food menu
drinks menu
supplier listing
stock opening balance
table selection
asset inventory
finance opening entries
reports
--# Batch 3 Outcome
Seed data now supports:
Super Admin
Manager
Cashier
Waiter
Chef
Storekeeper
Barman
Food menu
Soft drinks
Alcoholic drinks
Suppliers
Customers
Restaurant tables
Assets
Opening stock
Opening finance entries
# Next Smart Move
Build **Batch 4 — PHP Backend Foundation**, including:
- backend boot file
- database connection
- response helper
- request helper
- router
- auth controller
- products controller
- suppliers controller
- customers controller
- inventory controller
- orders controller
- payments controller
- reports controller
- monitoring controller
