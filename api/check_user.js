const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.users.findFirst({
      where: { email: 'admin@meatlovers.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.full_name);
    console.log('  Role:', user.role);
    console.log('  Active:', user.is_active);
    console.log('  Has password_hash:', !!user.password_hash);
    console.log('  Password hash length:', user.password_hash?.length);
    
    // Test password
    const testPassword = 'Admin@1234';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('\n🔑 Password test:');
    console.log('  Testing password: Admin@1234');
    console.log('  Result:', isValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
