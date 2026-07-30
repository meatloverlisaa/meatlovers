import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createHRUser() {
  try {
    // Check if HR already exists
    const existingHR = await prisma.user.findFirst({
      where: {
        email: 'hr@meatlovers.com'
      }
    });

    if (existingHR) {
      console.log('HR user already exists:', existingHR.email);
      console.log('Updating password to: HR@1234');
      
      const password_hash = await bcrypt.hash('HR@1234', 12);
      
      await prisma.user.update({
        where: { id: existingHR.id },
        data: {
          password_hash,
          is_active: true,
          failed_login_attempts: 0,
          account_locked_until: null,
        }
      });
      
      console.log('✅ HR password updated successfully');
      return;
    }

    // Create new HR user
    const password_hash = await bcrypt.hash('HR@1234', 12);

    const hr = await prisma.user.create({
      data: {
        full_name: 'Human Resources Manager',
        email: 'hr@meatlovers.com',
        phone: '+254744444444',
        password_hash,
        role: Role.HR,
        is_active: true,
      }
    });

    console.log('✅ HR user created successfully');
    console.log('Email:', hr.email);
    console.log('Phone:', hr.phone);
    console.log('Password: HR@1234');
    console.log('Role:', hr.role);
  } catch (error) {
    console.error('Error creating HR user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createHRUser();
