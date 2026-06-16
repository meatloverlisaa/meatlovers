ALTER TABLE deliveries
ADD COLUMN delivery_fee DECIMAL(12,2) DEFAULT 0 AFTER delivery_address,
ADD COLUMN assigned_by BIGINT NULL AFTER rider_phone,
ADD COLUMN dispatched_at TIMESTAMP NULL AFTER assigned_by,
ADD COLUMN delivered_at TIMESTAMP NULL AFTER dispatched_at,
ADD COLUMN failed_at TIMESTAMP NULL AFTER delivered_at,
ADD COLUMN failed_reason TEXT AFTER failed_at,
ADD COLUMN delivery_notes TEXT AFTER failed_reason;
ALTER TABLE deliveries
ADD CONSTRAINT fk_deliveries_assigned_by
FOREIGN KEY (assigned_by) REFERENCES users(id);
