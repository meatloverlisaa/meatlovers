-- Dashboard Performance Indexes Migration
-- Adds indexes to improve dashboard query performance for role-specific views

-- ================================
-- ORDERS TABLE INDEXES
-- ================================
-- Speed up order status filtering for dashboard widgets (open orders count)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Speed up order date range queries (today's orders, this week, etc.)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Composite index for status + date queries
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);

-- ================================
-- PAYMENTS TABLE INDEXES
-- ================================
-- Speed up payment status filtering (pending payments, unreconciled)
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Speed up payment date range queries (today's revenue, this week, etc.)
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Composite index for status + date queries
CREATE INDEX IF NOT EXISTS idx_payments_status_date ON payments(payment_status, created_at);

-- Speed up payment method filtering (M-Pesa, Cash, etc.)
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- ================================
-- PRODUCTS TABLE INDEXES
-- ================================
-- Speed up stock level filtering (low stock, out of stock)
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity_in_stock);

-- Speed up active product filtering
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Composite index for stock alerts
CREATE INDEX IF NOT EXISTS idx_products_active_quantity ON products(is_active, quantity_in_stock);

-- ================================
-- WEBSITE_LEADS TABLE INDEXES
-- ================================
-- Speed up lead status filtering (new leads, pending follow-up)
CREATE INDEX IF NOT EXISTS idx_website_leads_status ON website_leads(status);

-- Speed up lead source filtering (lead analytics)
CREATE INDEX IF NOT EXISTS idx_website_leads_source ON website_leads(source);

-- Speed up lead date queries (recent leads)
CREATE INDEX IF NOT EXISTS idx_website_leads_created_at ON website_leads(created_at);

-- Composite index for status + date queries
CREATE INDEX IF NOT EXISTS idx_website_leads_status_date ON website_leads(status, created_at);

-- ================================
-- USERS TABLE INDEXES
-- ================================
-- Speed up role filtering (employee counts by role)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Speed up active user filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Composite index for active users by role
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, is_active);

-- ================================
-- AUDIT_LOGS TABLE INDEXES
-- ================================
-- Speed up audit log queries by action type (activity timeline)
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Speed up audit log date queries (recent activity)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Speed up user activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Composite index for user activity timeline
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
