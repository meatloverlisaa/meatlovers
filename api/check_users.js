const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      role: true,
      is_active: true,
      password_hash: true
    }
  });
  
  console.log(`Found ${users.length} users:`);
  users.forEach(user => {
    console.log(`\n- ${user.full_name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Phone: ${user.phone}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Active: ${user.is_active}`);
    console.log(`  Has Password: ${user.password_hash ? 'Yes' : 'No'}`);
  });
  
  // Check the admin user specifically
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@meatlovers.com' }
  });
  
  if (admin) {
    console.log('\n\n--- ADMIN USER DETAILS ---');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Is Active:', admin.is_active);
    console.log('Account Locked Until:', admin.account_locked_until);
    console.log('Password Hash Length:', admin.password_hash?.length || 0);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
