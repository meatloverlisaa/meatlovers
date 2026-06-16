CREATE TABLE income_statement_snapshots (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
statement_period ENUM(
'DAILY',
'WEEKLY',
'MONTHLY',
'ANNUAL'
) NOT NULL,
period_start DATE NOT NULL,
period_end DATE NOT NULL,
food_sales DECIMAL(12,2) DEFAULT 0,
soft_drinks_sales DECIMAL(12,2) DEFAULT 0,
alcoholic_drinks_sales DECIMAL(12,2) DEFAULT 0,
total_sales DECIMAL(12,2) DEFAULT 0,
other_income DECIMAL(12,2) DEFAULT 0,
total_income DECIMAL(12,2) DEFAULT 0,
food_cost DECIMAL(12,2) DEFAULT 0,
soft_drinks_cost DECIMAL(12,2) DEFAULT 0,
alcoholic_drinks_cost DECIMAL(12,2) DEFAULT 0,
total_cost_of_goods DECIMAL(12,2) DEFAULT 0,
total_expenses DECIMAL(12,2) DEFAULT 0,
gross_profit DECIMAL(12,2) DEFAULT 0,
net_profit DECIMAL(12,2) DEFAULT 0,
created_by BIGINT,
FOREIGN KEY (created_by)
REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP



);
