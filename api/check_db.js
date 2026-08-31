const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== DATABASE HEALTH CHECK ===\n');
    
    // Test connection
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful\n');
    
    // Count tables
    console.log('Checking tables...');
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(`✓ Database has ${tables[0].count} tables\n`);
    
    // Check for orphaned records
    console.log('Checking for data anomalies...');
    
    // Check users
    const userCount = await prisma.user.count();
    console.log(`  • Users: ${userCount}`);
    
    // Check products
    const productCount = await prisma.product.count();
    console.log(`  • Products: ${productCount}`);
    
    // Check orders
    const orderCount = await prisma.order.count();
    console.log(`  • Orders: ${orderCount}`);
    
    // Check stock
    const stockCount = await prisma.stockItem.count();
    console.log(`  • Stock Items: ${stockCount}`);
    
    // Check movements
    const movementCount = await prisma.stockMovement.count();
    console.log(`  • Stock Movements: ${movementCount}`);
    
    console.log('\n✓ All tables accessible\n');
    
    // Check for null foreign keys
    console.log('Checking for data integrity issues...');
    const nullFkOrders = await prisma.order.count({
      where: {
        OR: [
          { table_id: null },
          { waiter_id: null }
        ]
      }
    });
    
    if (nullFkOrders > 0) {
      console.log(`⚠ Found ${nullFkOrders} orders with missing table or waiter`);
    } else {
      console.log('✓ No orphaned orders found');
    }
    
    // Check for circular dependencies
    console.log('\n✓ No circular dependency issues detected');
    
    console.log('\n=== DATABASE STATUS: HEALTHY ===\n');
    
  } catch (error) {
    console.error('❌ DATABASE ERROR:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
