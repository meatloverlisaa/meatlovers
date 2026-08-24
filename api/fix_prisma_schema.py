#!/usr/bin/env python3
"""
Fix Prisma schema to use singular PascalCase model names
while preserving database table names using @@map()
"""

import re
import shutil
from pathlib import Path

# Model name mappings (snake_case_plural -> PascalCaseSingular)
MODEL_MAPPINGS = {
    'approval_requests': 'ApprovalRequest',
    'assets': 'Asset',
    'audit_logs': 'AuditLog',
    'content_pages': 'ContentPage',
    'customers': 'Customer',
    'deliveries': 'Delivery',
    'delivery_drivers': 'DeliveryDriver',
    'discounts': 'Discount',
    'employees': 'Employee',
    'invoices': 'Invoice',
    'maintenance_logs': 'MaintenanceLog',
    'order_items': 'OrderItem',
    'orders': 'Order',
    'payments': 'Payment',
    'price_change_audit_trails': 'PriceChangeAuditTrail',
    'pricing_rules': 'PricingRule',
    'production_plans': 'ProductionPlan',
    'products': 'Product',
    'purchases': 'Purchase',
    'recipes': 'Recipe',
    'refresh_tokens': 'RefreshToken',
    'sessions': 'Session',
    'stock_items': 'StockItem',
    'stock_movements': 'StockMovement',
    'suppliers': 'Supplier',
    'tables': 'Table',
    'taxes': 'Tax',
    'users': 'User',
    'waste_declarations': 'WasteDeclaration',
    'website_leads': 'WebsiteLead',
}

def fix_schema():
    schema_path = Path('prisma/schema.prisma')
    backup_path = Path('prisma/schema.prisma.backup')
    
    print("🔧 Fixing Prisma schema...")
    print(f"📁 Schema: {schema_path}")
    
    # Create backup
    shutil.copy(schema_path, backup_path)
    print(f"✅ Backup created: {backup_path}")
    
    # Read schema
    with open(schema_path, 'r') as f:
        content = f.read()
    
    # Process each model
    for old_name, new_name in MODEL_MAPPINGS.items():
        # Find model declaration and replace
        # Pattern: model old_name {
        pattern = f'model {old_name} {{'
        replacement = f'model {new_name} {{'
        
        if pattern in content:
            content = content.replace(pattern, replacement)
            print(f"  ✓ {old_name} → {new_name}")
            
            # Add @@map() before the closing brace of the model
            # Find the model block and add @@map before the last }
            model_pattern = re.compile(
                rf'(model {new_name} \{{.*?)(^\}}\n)',
                re.MULTILINE | re.DOTALL
            )
            
            def add_map(match):
                body = match.group(1)
                closing = match.group(2)
                
                # Check if @@map already exists
                if f'@@map("{old_name}")' in body:
                    return match.group(0)
                
                # Add @@map before the closing brace
                return f'{body}\n  @@map("{old_name}")\n{closing}'
            
            content = model_pattern.sub(add_map, content)
    
    # Write updated schema
    with open(schema_path, 'w') as f:
        f.write(content)
    
    print("\n✅ Schema updated successfully!")
    print(f"💾 Backup saved to: {backup_path}")
    print("\n📝 Next steps:")
    print("  1. npm run prisma:generate")
    print("  2. npm run build")
    print("\nTo rollback:")
    print(f"  mv {backup_path} {schema_path}")

if __name__ == '__main__':
    fix_schema()
