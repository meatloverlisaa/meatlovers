#!/bin/bash

echo "🔧 Reverting to singular Prisma model names..."
cd "$(dirname "$0")/src"

# These were incorrectly changed to plural, revert to singular
find . -name "*.ts" -type f -exec sed -i 's/prisma\.approval_requests/prisma.approvalRequest/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.approval_requests/tx.approvalRequest/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.assets/prisma.asset/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.assets/tx.asset/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.audit_logs/prisma.auditLog/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.audit_logs/tx.auditLog/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.content_pages/prisma.contentPage/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.content_pages/tx.contentPage/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.employee_documents/prisma.employeeDocument/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.employee_documents/tx.employeeDocument/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/prisma\.employees_documents/prisma.employeeDocument/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.employees_documents/tx.employeeDocument/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.maintenance_logs/prisma.maintenanceLog/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.maintenance_logs/tx.maintenanceLog/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.orders/prisma.order/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.orders/tx.order/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.payments/prisma.payment/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.payments/tx.payment/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.price_change_audit_trails/prisma.priceChangeAuditTrail/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.price_change_audit_trails/tx.priceChangeAuditTrail/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.products/prisma.product/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.products/tx.product/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.refresh_tokens/prisma.refreshToken/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.refresh_tokens/tx.refreshToken/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.stock_items/prisma.stockItem/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.stock_items/tx.stockItem/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.stock_movements/prisma.stockMovement/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.stock_movements/tx.stockMovement/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.users/prisma.user/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.users/tx.user/g' {} \;

find . -name "*.ts" -type f -exec sed -i 's/prisma\.website_leads/prisma.websiteLead/g' {} \;
find . -name "*.ts" -type f -exec sed -i 's/tx\.website_leads/tx.websiteLead/g' {} \;

# Keep these as-is (they match Prisma correctly as singular camelCase):
# customer, delivery, discountemployee, invoice, maintenanceLog, orderItem, 
# pricingRule, productionPlan, purchase, recipe, supplier, table, wasteDeclaration

echo "✅ Reverted to singular names"
