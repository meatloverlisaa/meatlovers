INSERT INTO pricing_rules (
product_category,
minimum_margin_percent,
maximum_discount_percent,
rule_status,
notes,
created_by
) VALUES
('FOOD', 35.00, 10.00, 'ACTIVE', 'Food should maintain at least 35% gross margin', 1),
('SOFT_DRINK', 25.00, 5.00, 'ACTIVE', 'Soft drinks should maintain at least 25% gross margin', 1),
('ALCOHOLIC_DRINK', 30.00, 5.00, 'ACTIVE', 'Alcoholic drinks should maintain at least 30% gross margin', 1);
