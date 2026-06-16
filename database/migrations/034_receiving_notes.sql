CREATE TABLE receiving_notes (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
supplier_id BIGINT NOT NULL,
supplier_invoice_id BIGINT,
received_by BIGINT NOT NULL,
received_date DATE NOT NULL,
receiving_status ENUM(
'DRAFT',
'RECEIVED',
'DISPUTED',
'CANCELLED'
) DEFAULT 'DRAFT',
notes TEXT,
FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
FOREIGN KEY (supplier_invoice_id) REFERENCES supplier_invoices(id),
FOREIGN KEY (received_by) REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
