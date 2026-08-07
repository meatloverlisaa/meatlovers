#!/usr/bin/env node
/**
 * Database Integrity Checker
 * Checks for common database issues and data integrity problems
 * Date: August 7, 2026
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseIntegrity() {
  const errors = [];
  const warnings = [];
  
  console.log('🔍 DATABASE INTEGRITY CHECK');
  console.log('========================================\n');
  
  try {
    // Check 1: Orphaned OrderItems
    console.log('1. Checking OrderItems without Orders...');
    const orphanedItems = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM order_items oi
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.id IS NULL
    `;
    const orphanedCount = Number(orphanedItems[0].count);
    console.log(`   Result: ${orphanedCount} orphaned order items`);
    if (orphanedCount > 0) {
      errors.push(`Found ${orphanedCount} orphaned OrderItems`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 2: Invalid foreign key references in StockMovements
    console.log('2. Checking StockMovements with invalid stock_item_id...');
    const invalidMovements = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM stock_movements sm
      LEFT JOIN stock_items si ON sm.stock_item_id = si.id
      WHERE si.id IS NULL
    `;
    const invalidMovCount = Number(invalidMovements[0].count);
    console.log(`   Result: ${invalidMovCount} invalid stock movements`);
    if (invalidMovCount > 0) {
      errors.push(`Found ${invalidMovCount} invalid StockMovements`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 3: Products without stock items
    console.log('3. Checking Products without StockItems...');
    const productsNoStock = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM products p
      LEFT JOIN stock_items si ON p.id = si.product_id
      WHERE si.id IS NULL AND p.is_active = true
    `;
    const noStockCount = Number(productsNoStock[0].count);
    console.log(`   Result: ${noStockCount} active products without stock`);
    if (noStockCount > 0) {
      warnings.push(`Found ${noStockCount} active Products without StockItems`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 4: Duplicate stock items
    console.log('4. Checking for duplicate stock items...');
    const duplicateStock = await prisma.$queryRaw`
      SELECT product_id, location, COUNT(*) as count
      FROM stock_items
      GROUP BY product_id, location
      HAVING COUNT(*) > 1
    `;
    console.log(`   Result: ${duplicateStock.length} duplicate stock item groups`);
    if (duplicateStock.length > 0) {
      errors.push(`Found ${duplicateStock.length} duplicate StockItems`);
      console.log('   ❌ FAILED - Duplicates:', duplicateStock);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 5: Users without employee profiles
    console.log('5. Checking staff users without employee profiles...');
    const usersNoProfile = await prisma.user.count({
      where: {
        role: { notIn: ['SUPER_ADMIN', 'ADMIN'] },
        employee_profile: null
      }
    });
    console.log(`   Result: ${usersNoProfile} staff users without profiles`);
    if (usersNoProfile > 0) {
      errors.push(`Found ${usersNoProfile} Users without EmployeeProfile`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 6: Expired refresh tokens
    console.log('6. Checking expired but not revoked refresh tokens...');
    const expiredTokens = await prisma.refreshToken.count({
      where: {
        expires_at: { lt: new Date() },
        is_revoked: false
      }
    });
    console.log(`   Result: ${expiredTokens} expired tokens still active`);
    if (expiredTokens > 0) {
      warnings.push(`Found ${expiredTokens} expired RefreshTokens not revoked`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 7: Locked user accounts
    console.log('7. Checking for locked user accounts...');
    const lockedAccounts = await prisma.user.count({
      where: {
        account_locked_until: { gt: new Date() }
      }
    });
    console.log(`   Result: ${lockedAccounts} accounts currently locked`);
    if (lockedAccounts > 0) {
      warnings.push(`Found ${lockedAccounts} locked accounts`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Check 8: Orders without payments (older than 1 hour)
    console.log('8. Checking unpaid orders...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const unpaidOrders = await prisma.order.count({
      where: {
        created_at: { lt: oneHourAgo },
        payments: { none: {} }
      }
    });
    console.log(`   Result: ${unpaidOrders} unpaid orders older than 1 hour`);
    if (unpaidOrders > 0) {
      warnings.push(`Found ${unpaidOrders} unpaid orders older than 1 hour`);
    } else {
      console.log('   ✅ PASSED\n');
    }
    
    // Summary
    console.log('\n========================================');
    console.log('📊 DATABASE INTEGRITY SUMMARY');
    console.log('========================================\n');
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ ALL CHECKS PASSED - No issues found!');
      console.log('   Database is in good health.\n');
    } else {
      if (errors.length > 0) {
        console.log(`❌ ERRORS: ${errors.length}`);
        errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
        console.log();
      }
      
      if (warnings.length > 0) {
        console.log(`⚠️  WARNINGS: ${warnings.length}`);
        warnings.forEach((warn, i) => console.log(`   ${i + 1}. ${warn}`));
        console.log();
      }
      
      console.log('📋 See DATABASE_ERRORS_REPORT.md for detailed fix instructions.\n');
    }
    
    await prisma.$disconnect();
    process.exit(errors.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the check
checkDatabaseIntegrity();
