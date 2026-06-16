CREATE TABLE enforcement_risk_scores (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
staff_id BIGINT NOT NULL,
risk_date DATE NOT NULL,
audit_score DECIMAL(12,2) DEFAULT 0,
approval_score DECIMAL(12,2) DEFAULT 0,
stock_variance_score DECIMAL(12,2) DEFAULT 0,
cash_variance_score DECIMAL(12,2) DEFAULT 0,
attendance_score DECIMAL(12,2) DEFAULT 0,
pricing_violation_score DECIMAL(12,2) DEFAULT 0,



incident_score DECIMAL(12,2) DEFAULT 0,
total_risk_score DECIMAL(12,2) DEFAULT 0,
risk_level ENUM(
'LOW',
'MEDIUM',
'HIGH',
'CRITICAL'
) DEFAULT 'LOW',
notes TEXT,
FOREIGN KEY (staff_id) REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
