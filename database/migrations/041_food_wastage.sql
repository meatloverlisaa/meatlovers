CREATE TABLE food_wastage (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT NOT NULL,
production_plan_id BIGINT,
wasted_quantity DECIMAL(12,2) NOT NULL,
estimated_cost DECIMAL(12,2) DEFAULT 0,
wastage_reason TEXT,
declared_by BIGINT,
FOREIGN KEY (product_id) REFERENCES products(id),
FOREIGN KEY (production_plan_id) REFERENCES kitchen_production_plans(id),
FOREIGN KEY (declared_by) REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
