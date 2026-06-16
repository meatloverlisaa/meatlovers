CREATE TABLE cashier_reconciliations (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
cashier_id BIGINT NOT NULL,
reconciliation_date DATE NOT NULL,
expected_cash DECIMAL(12,2) DEFAULT 0,
declared_cash DECIMAL(12,2) DEFAULT 0,
variance_amount DECIMAL(12,2) DEFAULT 0,
expected_mpesa DECIMAL(12,2) DEFAULT 0,
confirmed_mpesa DECIMAL(12,2) DEFAULT 0,
mpesa_variance DECIMAL(12,2) DEFAULT 0,
reconciliation_status ENUM(
'PENDING',
'BALANCED',
'VARIANCE_FOUND',
'APPROVED'
) DEFAULT 'PENDING',
notes TEXT,
created_by BIGINT,
FOREIGN KEY (cashier_id)
REFERENCES users(id),
FOREIGN KEY (created_by)
REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
