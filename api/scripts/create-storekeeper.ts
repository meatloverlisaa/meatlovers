import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createStorekeeper() {
  try {
    // Check if storekeeper already exists
    const existingStorekeeper = await prisma.user.findFirst({
      where: { role: 'STOREKEEPER' }
    });

    if (existingStorekeeper) {
      console.log('Storekeeper user already exists:');
      console.log(`Email: ${existingStorekeeper.email || 'N/A'}`);
      console.log(`Phone: ${existingStorekeeper.phone || 'N/A'}`);
      console.log(`Password: Admin@1234`);
      console.log(`Role: ${existingStorekeeper.role}`);
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    // Create storekeeper user
    const storekeeper = await prisma.user.create({
      data: {
        full_name: 'Storekeeper User',
        email: 'storekeeper@meatlovers.com',
        phone: '+254799000000',
        role: 'STOREKEEPER',
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    console.log('\n✅ Storekeeper user created successfully!\n');
    console.log('Login Credentials:');
    console.log(`Email: ${storekeeper.email}`);
    console.log(`Phone: ${storekeeper.phone}`);
    console.log(`Password: Admin@1234`);
    console.log(`Role: ${storekeeper.role}`);
    console.log(`Active: ${storekeeper.is_active ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('Error creating storekeeper user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createStorekeeper();
