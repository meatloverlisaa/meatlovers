const { PrismaClient } = require('@prisma/client');

// Create a Prisma client with the provided connection string
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_VR8T4DJPMyOq@ep-little-dust-axitggkv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...\n');
    
    // Test 1: Basic connection
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    console.log('Database Info:');
    console.log('  Current Time:', result[0].current_time);
    
    // Test 2: Count tables
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n📊 Database Status:');
    console.log('  Tables found:', tables[0].table_count);
    
    // Test 3: Check for data
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    
    console.log('\n📈 Current Data:');
    console.log('  Users:', users);
    console.log('  Products:', products);
    console.log('  Orders:', orders);
    
    console.log('\n✅ All tests passed! Database is ready to use.\n');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED');
    console.error('Error:', error.message);
    console.error('\nPossible causes:');
    console.error('1. Connection string has typo');
    console.error('2. Database is suspended/offline');
    console.error('3. Network firewall blocking connection');
    console.error('4. Neon account issue');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
