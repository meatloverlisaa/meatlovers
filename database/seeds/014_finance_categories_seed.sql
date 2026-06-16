INSERT INTO finance_categories (
category_name,


category_type,
description,
is_active
) VALUES
('Food Sales', 'INCOME', 'Income from food sales', TRUE),
('Soft Drinks Sales', 'INCOME', 'Income from soft drinks sales', TRUE),
('Alcoholic Drinks Sales', 'INCOME', 'Income from alcoholic drinks sales', TRUE),
('Delivery Income', 'INCOME', 'Income from delivery charges', TRUE),
('Catering Income', 'INCOME', 'Income from catering jobs', TRUE),
('Other Income', 'INCOME', 'Other business income', TRUE),
('Food Stock Purchase', 'EXPENSE', 'Food ingredient and meat purchases', TRUE),
('Soft Drinks Purchase', 'EXPENSE', 'Soft drinks purchases', TRUE),
('Alcohol Purchase', 'EXPENSE', 'Alcoholic drinks purchases', TRUE),
('Staff Wages', 'EXPENSE', 'Staff wages and payroll', TRUE),
('Rent', 'EXPENSE', 'Premises rent', TRUE),
('Utilities', 'EXPENSE', 'Electricity, water, gas, and related utilities', TRUE),
('Transport', 'EXPENSE', 'Transport and logistics expenses', TRUE),
('Repairs and Maintenance', 'EXPENSE', 'Repairs, maintenance, and equipment servicing', TRUE),
('Marketing', 'EXPENSE', 'Marketing and customer acquisition expenses', TRUE),
('Miscellaneous Expense', 'EXPENSE', 'Other operating expenses', TRUE);
