CREATE TABLE kitchen_production_plans (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
production_date DATE NOT NULL,
menu_product_id BIGINT NOT NULL,
planned_quantity DECIMAL(12,2) NOT NULL,
produced_quantity DECIMAL(12,2) DEFAULT 0,
sold_quantity DECIMAL(12,2) DEFAULT 0,
wasted_quantity DECIMAL(12,2) DEFAULT 0,
production_status ENUM(
'PLANNED',
'IN_PROGRESS',
'COMPLETED',
'CLOSED'
) DEFAULT 'PLANNED',



created_by BIGINT,
FOREIGN KEY (menu_product_id) REFERENCES products(id),
FOREIGN KEY (created_by) REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
