#!/bin/bash
find . -name "*.ts" -exec sed -i 's/prisma\.assets/prisma.asset/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.audit_logs/prisma.auditLog/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.orders/prisma.order/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.payments/prisma.payment/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.products/prisma.product/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.tables/prisma.table/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.users/prisma.user/g' {} \;
find . -name "*.ts" -exec sed -i 's/prisma\.employeesProfile/prisma.employeeProfile/g' {} \;
