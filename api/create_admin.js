const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Check if admin@meatlovers.com exists
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@meatlovers.com' }
  });
  
  if (existing) {
    console.log('✓ admin@meatlovers.com already exists');
    return;
  }
  
  // Create the user
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);
  
  const admin = await prisma.user.create({
    data: {
      full_name: 'Admin User',
      email: 'admin@meatlovers.com',
      phone: '+254711111111',
      role: 'ADMIN',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  
  console.log('✓ Created admin@meatlovers.com');
  console.log('  ID:', admin.id);
  console.log('  Email:', admin.email);
  console.log('  Password: Admin@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
