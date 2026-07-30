import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createWaiterUser() {
  try {
    // Check if waiter already exists
    const existingWaiter = await prisma.user.findFirst({
      where: {
        email: 'waiter@meatlovers.com'
      }
    });

    if (existingWaiter) {
      console.log('Waiter user already exists:', existingWaiter.email);
      console.log('Updating password to: Waiter@1234');
      
      const password_hash = await bcrypt.hash('Waiter@1234', 12);
      
      await prisma.user.update({
        where: { id: existingWaiter.id },
        data: {
          password_hash,
          is_active: true,
          failed_login_attempts: 0,
          account_locked_until: null,
        }
      });
      
      console.log('✅ Waiter password updated successfully');
      return;
    }

    // Create new waiter user
    const password_hash = await bcrypt.hash('Waiter@1234', 12);

    const waiter = await prisma.user.create({
      data: {
        full_name: 'Restaurant Waiter',
        email: 'waiter@meatlovers.com',
        phone: '+254777777777',
        password_hash,
        role: Role.WAITER,
        is_active: true,
      }
    });

    console.log('✅ Waiter user created successfully');
    console.log('Email:', waiter.email);
    console.log('Phone:', waiter.phone);
    console.log('Password: Waiter@1234');
    console.log('Role:', waiter.role);
  } catch (error) {
    console.error('Error creating waiter user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createWaiterUser();
