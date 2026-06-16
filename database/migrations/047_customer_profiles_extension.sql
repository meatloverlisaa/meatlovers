ALTER TABLE customers
ADD COLUMN birth_date DATE NULL AFTER customer_type,
ADD COLUMN anniversary_date DATE NULL AFTER birth_date,
ADD COLUMN segment ENUM(
'NEW',
'REGULAR',
'VIP',
'DORMANT',
'CORPORATE',
'DELIVERY_ONLY'
) DEFAULT 'NEW' AFTER anniversary_date,
ADD COLUMN last_visit_date DATE NULL AFTER loyalty_points,
ADD COLUMN total_visits INT DEFAULT 0 AFTER last_visit_date,
ADD COLUMN lifetime_value DECIMAL(12,2) DEFAULT 0 AFTER total_visits;
