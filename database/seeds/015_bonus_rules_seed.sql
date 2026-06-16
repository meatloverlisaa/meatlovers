INSERT INTO bonus_rules (
rule_name,
role,
target_type,
target_value,
bonus_amount,
is_active
) VALUES
('Waiter Daily Sales Bonus', 'WAITER', 'SALES_AMOUNT', 10000.00, 500.00, TRUE),
('Waiter Order Count Bonus', 'WAITER', 'ORDERS_SERVED', 25.00, 300.00, TRUE),
('Excellent Service Rating Bonus', 'WAITER', 'CUSTOMER_RATING', 4.50, 400.00, TRUE),
('Bar Sales Support Bonus', 'BARMAN', 'SALES_AMOUNT', 15000.00, 500.00, TRUE);
