import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@test.com' },
          { email: 'admin@meatlovers.local' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Updating password to: Admin@1234');
      
      const password_hash = await bcrypt.hash('Admin@1234', 12);
      
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          password_hash,
          is_active: true,
          failed_login_attempts: 0,
          account_locked_until: null,
        }
      });
      
      console.log('✅ Admin password updated successfully');
      return;
    }

    // Create new admin user
    const password_hash = await bcrypt.hash('Admin@1234', 12);

    const admin = await prisma.user.create({
      data: {
        full_name: 'System Administrator',
        email: 'admin@test.com',
        password_hash,
        role: Role.ADMIN,
        is_active: true,
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('Email:', admin.email);
    console.log('Password: Admin@1234');
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
