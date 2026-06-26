-- Dashboard Performance Indexes Migration
-- Adds indexes to improve dashboard query performance for role-specific views
-- Uses DROP INDEX IF EXISTS to handle existing indexes safely

-- ================================
-- ORDERS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_orders_status ON orders;
CREATE INDEX idx_orders_status ON orders(status);

DROP INDEX IF EXISTS idx_orders_created_at ON orders;
CREATE INDEX idx_orders_created_at ON orders(created_at);

DROP INDEX IF EXISTS idx_orders_status_created ON orders;
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- ================================
-- PAYMENTS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_payments_status ON payments;
CREATE INDEX idx_payments_status ON payments(payment_status);

DROP INDEX IF EXISTS idx_payments_created_at ON payments;
CREATE INDEX idx_payments_created_at ON payments(created_at);

DROP INDEX IF EXISTS idx_payments_status_date ON payments;
CREATE INDEX idx_payments_status_date ON payments(payment_status, created_at);

DROP INDEX IF EXISTS idx_payments_method ON payments;
CREATE INDEX idx_payments_method ON payments(payment_method);

-- ================================
-- STOCK_ITEMS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_stock_items_quantity ON stock_items;
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);

DROP INDEX IF EXISTS idx_stock_items_location ON stock_items;
CREATE INDEX idx_stock_items_location ON stock_items(location);

DROP INDEX IF EXISTS idx_stock_items_quantity_location ON stock_items;
CREATE INDEX idx_stock_items_quantity_location ON stock_items(quantity, location);

-- ================================
-- PRODUCTS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_products_active ON products;
CREATE INDEX idx_products_active ON products(is_active);

DROP INDEX IF EXISTS idx_products_category ON products;
CREATE INDEX idx_products_category ON products(product_category);

DROP INDEX IF EXISTS idx_products_active_category ON products;
CREATE INDEX idx_products_active_category ON products(is_active, product_category);

-- ================================
-- WEBSITE_LEADS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_website_leads_status ON website_leads;
CREATE INDEX idx_website_leads_status ON website_leads(status);

DROP INDEX IF EXISTS idx_website_leads_source ON website_leads;
CREATE INDEX idx_website_leads_source ON website_leads(source);

DROP INDEX IF EXISTS idx_website_leads_created_at ON website_leads;
CREATE INDEX idx_website_leads_created_at ON website_leads(created_at);

DROP INDEX IF EXISTS idx_website_leads_status_date ON website_leads;
CREATE INDEX idx_website_leads_status_date ON website_leads(status, created_at);

-- ================================
-- USERS TABLE INDEXES
-- ================================
DROP INDEX IF EXISTS idx_users_role ON users;
CREATE INDEX idx_users_role ON users(role);

DROP INDEX IF EXISTS idx_users_is_active ON users;
CREATE INDEX idx_users_is_active ON users(is_active);

DROP INDEX IF EXISTS idx_users_role_active ON users;
CREATE INDEX idx_users_role_active ON users(role, is_active);
