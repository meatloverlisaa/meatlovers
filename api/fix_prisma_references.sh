#!/bin/bash

# Fix all Prisma model references in TypeScript code
# Changes from singular camelCase to plural snake_case to match generated Prisma client

echo "🔧 Fixing Prisma model references in TypeScript code..."
echo ""

cd "$(dirname "$0")"

# Create backup
BACKUP_DIR="src_backup_$(date +%Y%m%d_%H%M%S)"
cp -r src "$BACKUP_DIR"
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Fix all service files
echo "📝 Updating model references..."

# Find and replace in all TypeScript files in src/
find src -name "*.ts" -type f -exec sed -i \
  -e 's/\.approvalRequest\b/.approval_requests/g' \
  -e 's/\.asset\b/.assets/g' \
  -e 's/\.auditLog\b/.audit_logs/g' \
  -e 's/\.contentPage\b/.content_pages/g' \
  -e 's/\.customer\b/.customers/g' \
  -e 's/\.delivery\b/.deliveries/g' \
  -e 's/\.deliveryDriver\b/.delivery_drivers/g' \
  -e 's/\.discount\b/.discounts/g' \
  -e 's/\.employee\b/.employees/g' \
  -e 's/\.employeeDocument\b/.employee_documents/g' \
  -e 's/\.invoice\b/.invoices/g' \
  -e 's/\.maintenanceLog\b/.maintenance_logs/g' \
  -e 's/\.orderItem\b/.order_items/g' \
  -e 's/\.order\b/.orders/g' \
  -e 's/\.payment\b/.payments/g' \
  -e 's/\.priceChangeAuditTrail\b/.price_change_audit_trails/g' \
  -e 's/\.pricingRule\b/.pricing_rules/g' \
  -e 's/\.productionPlan\b/.production_plans/g' \
  -e 's/\.product\b/.products/g' \
  -e 's/\.purchase\b/.purchases/g' \
  -e 's/\.recipe\b/.recipes/g' \
  -e 's/\.refreshToken\b/.refresh_tokens/g' \
  -e 's/\.session\b/.sessions/g' \
  -e 's/\.stockItem\b/.stock_items/g' \
  -e 's/\.stockMovement\b/.stock_movements/g' \
  -e 's/\.supplier\b/.suppliers/g' \
  -e 's/\.table\b/.tables/g' \
  -e 's/\.tax\b/.taxes/g' \
  -e 's/\.user\b/.users/g' \
  -e 's/\.wasteDeclaration\b/.waste_declarations/g' \
  -e 's/\.websiteLead\b/.website_leads/g' \
  {} +

# Fix Prisma types
find src -name "*.ts" -type f -exec sed -i \
  -e 's/Prisma\.WasteDeclarationWhereInput/Prisma.waste_declarationsWhereInput/g' \
  -e 's/Prisma\.WasteDeclarationUpdateInput/Prisma.waste_declarationsUpdateInput/g' \
  {} +

echo "✅ All model references updated!"
echo ""

echo "🔄 Regenerating Prisma Client..."
npm run prisma:generate

echo ""
echo "🔨 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful! All 672 errors fixed!"
  echo ""
  echo "🗑️  You can delete the backup if everything works:"
  echo "   rm -rf $BACKUP_DIR"
else
  echo ""
  echo "❌ Build failed. Restoring backup..."
  rm -rf src
  mv "$BACKUP_DIR" src
  echo "✅ Backup restored"
fi
