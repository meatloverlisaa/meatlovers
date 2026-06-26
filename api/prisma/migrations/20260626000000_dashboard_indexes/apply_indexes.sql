-- Dashboard Performance Indexes Migration
-- Adds indexes to improve dashboard query performance for role-specific views
-- Modified to remove IF NOT EXISTS and fix column references

-- ================================
-- ORDERS TABLE INDEXES
-- ================================
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status_created ON orders(status, created_at);

-- ================================
-- PAYMENTS TABLE INDEXES
-- ================================
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_status_date ON payments(payment_status, created_at);
CREATE INDEX idx_payments_method ON payments(payment_method);

-- ================================
-- STOCK_ITEMS TABLE INDEXES
-- ================================
-- Stock is tracked in stock_items, not products
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);
CREATE INDEX idx_stock_items_location ON stock_items(location);
CREATE INDEX idx_stock_items_quantity_location ON stock_items(quantity, location);

-- ================================
-- PRODUCTS TABLE INDEXES
-- ================================
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(product_category);
CREATE INDEX idx_products_active_category ON products(is_active, product_category);

-- ================================
-- WEBSITE_LEADS TABLE INDEXES
-- ================================
CREATE INDEX idx_website_leads_status ON website_leads(status);
CREATE INDEX idx_website_leads_source ON website_leads(source);
CREATE INDEX idx_website_leads_created_at ON website_leads(created_at);
CREATE INDEX idx_website_leads_status_date ON website_leads(status, created_at);

-- ================================
-- USERS TABLE INDEXES
-- ================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_role_active ON users(role, is_active);
