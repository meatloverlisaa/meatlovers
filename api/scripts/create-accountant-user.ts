import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAccountantUser() {
  try {
    // Check if accountant already exists
    const existingAccountant = await prisma.user.findFirst({
      where: {
        email: 'accountant@meatlovers.com'
      }
    });

    if (existingAccountant) {
      console.log('Accountant user already exists:', existingAccountant.email);
      console.log('Updating password to: Accountant@1234');
      
      const password_hash = await bcrypt.hash('Accountant@1234', 12);
      
      await prisma.user.update({
        where: { id: existingAccountant.id },
        data: {
          password_hash,
          is_active: true,
          failed_login_attempts: 0,
          account_locked_until: null,
        }
      });
      
      console.log('✅ Accountant password updated successfully');
      return;
    }

    // Create new accountant user
    const password_hash = await bcrypt.hash('Accountant@1234', 12);

    const accountant = await prisma.user.create({
      data: {
        full_name: 'Financial Accountant',
        email: 'accountant@meatlovers.com',
        phone: '+254755555555',
        password_hash,
        role: Role.ACCOUNTANT,
        is_active: true,
      }
    });

    console.log('✅ Accountant user created successfully');
    console.log('Email:', accountant.email);
    console.log('Phone:', accountant.phone);
    console.log('Password: Accountant@1234');
    console.log('Role:', accountant.role);
  } catch (error) {
    console.error('Error creating accountant user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAccountantUser();
