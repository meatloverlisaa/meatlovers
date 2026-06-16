CREATE TABLE price_change_audit (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
product_id BIGINT NOT NULL,
old_selling_price DECIMAL(12,2),
new_selling_price DECIMAL(12,2),
old_cost_price DECIMAL(12,2),
new_cost_price DECIMAL(12,2),
changed_by BIGINT,
change_reason TEXT,
FOREIGN KEY (product_id)
REFERENCES products(id),
FOREIGN KEY (changed_by)
REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
