import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('Super Admin user already exists:');
      console.log(`Email: ${existingSuperAdmin.email || 'N/A'}`);
      console.log(`Phone: ${existingSuperAdmin.phone || 'N/A'}`);
      console.log(`Password: Admin@1234`);
      console.log(`Role: ${existingSuperAdmin.role}`);
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        full_name: 'Super Administrator',
        email: 'superadmin@meatlovers.com',
        phone: '+254799999999',
        role: 'SUPER_ADMIN',
        password_hash: hashedPassword,
        is_active: true,
      },
    });

    console.log('\n✅ Super Admin user created successfully!\n');
    console.log('Login Credentials:');
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Phone: ${superAdmin.phone}`);
    console.log(`Password: Admin@1234`);
    console.log(`Role: ${superAdmin.role}`);
    console.log(`Active: ${superAdmin.is_active ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('Error creating super admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
