#!/bin/bash

# Fix Prisma model naming to match TypeScript code
# This script renames models in schema.prisma to singular PascalCase
# and adds @@map() to preserve database table names

echo "🔧 Fixing Prisma model names..."
echo ""

cd "$(dirname "$0")"

# Create backup
cp prisma/schema.prisma prisma/schema.prisma.backup
echo "✅ Backup created: prisma/schema.prisma.backup"

# Replace model names with singular forms and add @@map()
# This preserves the database table names while using singular models in code

sed -i 's/^model approval_requests {/model ApprovalRequest {\n  @@map("approval_requests")/' prisma/schema.prisma
sed -i 's/^model assets {/model Asset {\n  @@map("assets")/' prisma/schema.prisma
sed -i 's/^model audit_logs {/model AuditLog {\n  @@map("audit_logs")/' prisma/schema.prisma
sed -i 's/^model content_pages {/model ContentPage {\n  @@map("content_pages")/' prisma/schema.prisma
sed -i 's/^model customers {/model Customer {\n  @@map("customers")/' prisma/schema.prisma
sed -i 's/^model deliveries {/model Delivery {\n  @@map("deliveries")/' prisma/schema.prisma
sed -i 's/^model delivery_drivers {/model DeliveryDriver {\n  @@map("delivery_drivers")/' prisma/schema.prisma
sed -i 's/^model discounts {/model Discount {\n  @@map("discounts")/' prisma/schema.prisma
sed -i 's/^model employees {/model Employee {\n  @@map("employees")/' prisma/schema.prisma
sed -i 's/^model invoices {/model Invoice {\n  @@map("invoices")/' prisma/schema.prisma
sed -i 's/^model maintenance_logs {/model MaintenanceLog {\n  @@map("maintenance_logs")/' prisma/schema.prisma
sed -i 's/^model order_items {/model OrderItem {\n  @@map("order_items")/' prisma/schema.prisma
sed -i 's/^model orders {/model Order {\n  @@map("orders")/' prisma/schema.prisma
sed -i 's/^model payments {/model Payment {\n  @@map("payments")/' prisma/schema.prisma
sed -i 's/^model price_change_audit_trails {/model PriceChangeAuditTrail {\n  @@map("price_change_audit_trails")/' prisma/schema.prisma
sed -i 's/^model pricing_rules {/model PricingRule {\n  @@map("pricing_rules")/' prisma/schema.prisma
sed -i 's/^model production_plans {/model ProductionPlan {\n  @@map("production_plans")/' prisma/schema.prisma
sed -i 's/^model products {/model Product {\n  @@map("products")/' prisma/schema.prisma
sed -i 's/^model purchases {/model Purchase {\n  @@map("purchases")/' prisma/schema.prisma
sed -i 's/^model recipes {/model Recipe {\n  @@map("recipes")/' prisma/schema.prisma
sed -i 's/^model refresh_tokens {/model RefreshToken {\n  @@map("refresh_tokens")/' prisma/schema.prisma
sed -i 's/^model sessions {/model Session {\n  @@map("sessions")/' prisma/schema.prisma
sed -i 's/^model stock_items {/model StockItem {\n  @@map("stock_items")/' prisma/schema.prisma
sed -i 's/^model stock_movements {/model StockMovement {\n  @@map("stock_movements")/' prisma/schema.prisma
sed -i 's/^model suppliers {/model Supplier {\n  @@map("suppliers")/' prisma/schema.prisma
sed -i 's/^model tables {/model Table {\n  @@map("tables")/' prisma/schema.prisma
sed -i 's/^model taxes {/model Tax {\n  @@map("taxes")/' prisma/schema.prisma
sed -i 's/^model users {/model User {\n  @@map("users")/' prisma/schema.prisma
sed -i 's/^model waste_declarations {/model WasteDeclaration {\n  @@map("waste_declarations")/' prisma/schema.prisma
sed -i 's/^model website_leads {/model WebsiteLead {\n  @@map("website_leads")/' prisma/schema.prisma

echo "✅ Model names updated to singular PascalCase with @@map()"
echo ""
echo "🔄 Regenerating Prisma Client..."
npm run prisma:generate

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Fix complete!"
echo ""
echo "To rollback: mv prisma/schema.prisma.backup prisma/schema.prisma"
