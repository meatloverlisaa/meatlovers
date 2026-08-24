#!/usr/bin/env python3
"""
Fix Prisma model references to match generated client
Changes: prisma.user -> prisma.users, prisma.product -> prisma.products, etc.
"""

import re
import os
import shutil
from pathlib import Path
from datetime import datetime

# Model name mappings (what code uses -> what Prisma generates)
REPLACEMENTS = {
    # Direct prisma. references
    r'\.approvalRequest\.': '.approval_requests.',
    r'\.asset\.': '.assets.',
    r'\.auditLog\.': '.audit_logs.',
    r'\.contentPage\.': '.content_pages.',
    r'\.customer\.': '.customers.',
    r'\.delivery\.': '.deliveries.',
    r'\.deliveryDriver\.': '.delivery_drivers.',
    r'\.discount\.': '.discounts.',
    r'\.employee\.': '.employees.',
    r'\.employeeDocument\.': '.employee_documents.',
    r'\.invoice\.': '.invoices.',
    r'\.maintenanceLog\.': '.maintenance_logs.',
    r'\.orderItem\.': '.order_items.',
    r'\.order\.': '.orders.',
    r'\.payment\.': '.payments.',
    r'\.priceChangeAuditTrail\.': '.price_change_audit_trails.',
    r'\.pricingRule\.': '.pricing_rules.',
    r'\.productionPlan\.': '.production_plans.',
    r'\.product\.': '.products.',
    r'\.purchase\.': '.purchases.',
    r'\.recipe\.': '.recipes.',
    r'\.refreshToken\.': '.refresh_tokens.',
    r'\.session\.': '.sessions.',
    r'\.stockItem\.': '.stock_items.',
    r'\.stockMovement\.': '.stock_movements.',
    r'\.supplier\.': '.suppliers.',
    r'\.table\.': '.tables.',
    r'\.tax\.': '.taxes.',
    r'\.user\.': '.users.',
    r'\.wasteDeclaration\.': '.waste_declarations.',
    r'\.websiteLead\.': '.website_leads.',
    
    # Prisma type references
    r'Prisma\.WasteDeclarationWhereInput': 'Prisma.waste_declarationsWhereInput',
    r'Prisma\.WasteDeclarationUpdateInput': 'Prisma.waste_declarationsUpdateInput',
}

def fix_file(file_path):
    """Fix Prisma references in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = False
    
    for pattern, replacement in REPLACEMENTS.items():
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            changes_made = True
            content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    src_dir = Path('src')
    
    if not src_dir.exists():
        print("❌ src directory not found!")
        return
    
    print("🔧 Fixing Prisma model references...")
    print()
    
    # Create backup
    backup_dir = f"src_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copytree('src', backup_dir)
    print(f"✅ Backup created: {backup_dir}")
    print()
    
    # Find all TypeScript files
    ts_files = list(src_dir.rglob('*.ts'))
    
    print(f"📝 Processing {len(ts_files)} TypeScript files...")
    print()
    
    fixed_count = 0
    for ts_file in ts_files:
        if fix_file(ts_file):
            print(f"  ✓ {ts_file.relative_to(src_dir)}")
            fixed_count += 1
    
    print()
    print(f"✅ Fixed {fixed_count} files!")
    print()
    
    print("🔄 Regenerating Prisma Client...")
    os.system('npm run prisma:generate')
    
    print()
    print("🔨 Building TypeScript...")
    result = os.system('npm run build')
    
    print()
    if result == 0:
        print("✅ Build successful! All errors fixed!")
        print()
        print(f"🗑️  You can delete the backup if everything works:")
        print(f"   rm -rf {backup_dir}")
    else:
        print("❌ Build failed. Restoring backup...")
        shutil.rmtree('src')
        shutil.move(backup_dir, 'src')
        print("✅ Backup restored")

if __name__ == '__main__':
    main()
