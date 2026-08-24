#!/bin/bash

echo "🔧 Fixing Prisma model names in TypeScript code..."
echo "Converting singular camelCase to plural snake_case"
echo ""

cd "$(dirname "$0")/src"

# Count total files to process
total_files=$(find . -name "*.ts" -type f | wc -l)
echo "📁 Found $total_files TypeScript files"
echo ""

# Create backup
backup_dir="../src_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
cp -r ../src/* "$backup_dir/"
echo "✅ Backup created: $backup_dir"
echo ""

# Common model name replacements (singular -> plural)
declare -A replacements=(
    ["prisma.approvalRequest"]="prisma.approval_requests"
    ["tx.approvalRequest"]="tx.approval_requests"
    
    ["prisma.asset"]="prisma.assets"
    ["tx.asset"]="tx.assets"
    
    ["prisma.auditLog"]="prisma.audit_logs"
    ["tx.auditLog"]="tx.audit_logs"
    
    ["prisma.contentPage"]="prisma.content_pages"
    ["tx.contentPage"]="tx.content_pages"
    
    ["prisma.customer"]="prisma.customers"
    ["tx.customer"]="tx.customers"
    
    ["prisma.delivery"]="prisma.deliveries"
    ["tx.delivery"]="tx.deliveries"
    
    ["prisma.deliveryDriver"]="prisma.delivery_drivers"
    ["tx.deliveryDriver"]="tx.delivery_drivers"
    
    ["prisma.discount"]="prisma.discounts"
    ["tx.discount"]="tx.discounts"
    
    ["prisma.employee"]="prisma.employees"
    ["tx.employee"]="tx.employees"
    
    ["prisma.employeeDocument"]="prisma.employee_documents"
    ["tx.employeeDocument"]="tx.employee_documents"
    
    ["prisma.invoice"]="prisma.invoices"
    ["tx.invoice"]="tx.invoices"
    
    ["prisma.maintenanceLog"]="prisma.maintenance_logs"
    ["tx.maintenanceLog"]="tx.maintenance_logs"
    
    ["prisma.order"]="prisma.orders"
    ["tx.order"]="tx.orders"
    
    ["prisma.orderItem"]="prisma.order_items"
    ["tx.orderItem"]="tx.order_items"
    
    ["prisma.payment"]="prisma.payments"
    ["tx.payment"]="tx.payments"
    
    ["prisma.priceChangeAuditTrail"]="prisma.price_change_audit_trails"
    ["tx.priceChangeAuditTrail"]="tx.price_change_audit_trails"
    
    ["prisma.pricingRule"]="prisma.pricing_rules"
    ["tx.pricingRule"]="tx.pricing_rules"
    
    ["prisma.product"]="prisma.products"
    ["tx.product"]="tx.products"
    
    ["prisma.productionPlan"]="prisma.production_plans"
    ["tx.productionPlan"]="tx.production_plans"
    
    ["prisma.purchase"]="prisma.purchases"
    ["tx.purchase"]="tx.purchases"
    
    ["prisma.recipe"]="prisma.recipes"
    ["tx.recipe"]="tx.recipes"
    
    ["prisma.refreshToken"]="prisma.refresh_tokens"
    ["tx.refreshToken"]="tx.refresh_tokens"
    
    ["prisma.session"]="prisma.sessions"
    ["tx.session"]="tx.sessions"
    
    ["prisma.stockItem"]="prisma.stock_items"
    ["tx.stockItem"]="tx.stock_items"
    
    ["prisma.stockMovement"]="prisma.stock_movements"
    ["tx.stockMovement"]="tx.stock_movements"
    
    ["prisma.supplier"]="prisma.suppliers"
    ["tx.supplier"]="tx.suppliers"
    
    ["prisma.table"]="prisma.tables"
    ["tx.table"]="tx.tables"
    
    ["prisma.tax"]="prisma.taxes"
    ["tx.tax"]="tx.taxes"
    
    ["prisma.user"]="prisma.users"
    ["tx.user"]="tx.users"
    
    ["prisma.wasteDeclaration"]="prisma.waste_declarations"
    ["tx.wasteDeclaration"]="tx.waste_declarations"
    
    ["prisma.websiteLead"]="prisma.website_leads"
    ["tx.websiteLead"]="tx.website_leads"
    
    # Type replacements
    ["Prisma.WasteDeclarationWhereInput"]="Prisma.waste_declarationsWhereInput"
    ["Prisma.WasteDeclarationUpdateInput"]="Prisma.waste_declarationsUpdateInput"
)

echo "🔄 Applying replacements..."
count=0

for old in "${!replacements[@]}"; do
    new="${replacements[$old]}"
    
    # Use find and sed to replace in all .ts files
    find . -name "*.ts" -type f -exec sed -i "s/${old}/${new}/g" {} \;
    
    count=$((count + 1))
    if [ $((count % 10)) -eq 0 ]; then
        echo "  ✓ Processed $count replacements..."
    fi
done

echo ""
echo "✅ Completed $count replacements"
echo ""
echo "🔨 Rebuilding..."
cd ..
npm run build 2>&1 | tail -20

echo ""
echo "✅ Fix complete!"
echo ""
echo "📊 Summary:"
echo "  - Backup: $backup_dir"
echo "  - Files processed: $total_files"
echo "  - Replacements: $count"
echo ""
echo "To rollback: rm -rf src && mv $backup_dir src"
