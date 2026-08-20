-- Dashboard performance indexes for PostgreSQL.

CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders"("created_at");
CREATE INDEX IF NOT EXISTS "idx_orders_status_created" ON "orders"("status", "created_at");

CREATE INDEX IF NOT EXISTS "idx_payments_status" ON "payments"("payment_status");
CREATE INDEX IF NOT EXISTS "idx_payments_created_at" ON "payments"("created_at");
CREATE INDEX IF NOT EXISTS "idx_payments_status_date" ON "payments"("payment_status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_payments_method" ON "payments"("payment_method");

CREATE INDEX IF NOT EXISTS "idx_stock_items_quantity" ON "stock_items"("quantity");
CREATE INDEX IF NOT EXISTS "idx_stock_items_location" ON "stock_items"("location");
CREATE INDEX IF NOT EXISTS "idx_stock_items_quantity_location" ON "stock_items"("quantity", "location");

CREATE INDEX IF NOT EXISTS "idx_products_active" ON "products"("is_active");
CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products"("product_category");
CREATE INDEX IF NOT EXISTS "idx_products_active_category" ON "products"("is_active", "product_category");

CREATE INDEX IF NOT EXISTS "idx_website_leads_status" ON "website_leads"("status");
CREATE INDEX IF NOT EXISTS "idx_website_leads_source" ON "website_leads"("source");
CREATE INDEX IF NOT EXISTS "idx_website_leads_created_at" ON "website_leads"("created_at");
CREATE INDEX IF NOT EXISTS "idx_website_leads_status_date" ON "website_leads"("status", "created_at");

CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users"("is_active");
CREATE INDEX IF NOT EXISTS "idx_users_role_active" ON "users"("role", "is_active");