CREATE TABLE ingredient_consumption (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
production_plan_id BIGINT,
order_id BIGINT,
product_id BIGINT NOT NULL,
consumed_quantity DECIMAL(12,2) NOT NULL,
consumption_source ENUM(
'PRODUCTION_PLAN',
'ORDER',
'MANUAL_ADJUSTMENT'
) NOT NULL,
consumed_by BIGINT,
FOREIGN KEY (production_plan_id) REFERENCES kitchen_production_plans(id),
FOREIGN KEY (order_id) REFERENCES orders(id),
FOREIGN KEY (product_id) REFERENCES products(id),
FOREIGN KEY (consumed_by) REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
