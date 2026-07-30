import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating manager user...\n');

  // Check if manager already exists
  const existingManager = await prisma.user.findUnique({
    where: { email: 'manager@meatlovers.com' },
  });

  if (existingManager) {
    console.log('❌ Manager user already exists:');
    console.log('   Email: manager@meatlovers.com');
    console.log('   Role:', existingManager.role);
    console.log('   Active:', existingManager.is_active);
    return;
  }

  const hashedPassword = await bcrypt.hash('Manager@1234', 10);

  const manager = await prisma.user.create({
    data: {
      full_name: 'Restaurant Manager',
      email: 'manager@meatlovers.com',
      phone: '+254788888888',
      role: 'MANAGER',
      password_hash: hashedPassword,
      is_active: true,
    },
  });

  console.log('✅ Manager user created successfully!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Email: manager@meatlovers.com');
  console.log('Password: Manager@1234');
  console.log('Role: MANAGER');
  console.log('Phone: +254788888888');
  console.log('========================\n');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
