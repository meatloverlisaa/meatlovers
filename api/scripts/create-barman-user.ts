import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createBarmanUser() {
  try {
    // Check if barman already exists
    const existingBarman = await prisma.user.findFirst({
      where: {
        email: 'barman@meatlovers.com'
      }
    });

    if (existingBarman) {
      console.log('Barman user already exists:', existingBarman.email);
      console.log('Updating password to: Barman@1234');
      
      const password_hash = await bcrypt.hash('Barman@1234', 12);
      
      await prisma.user.update({
        where: { id: existingBarman.id },
        data: {
          password_hash,
          is_active: true,
          failed_login_attempts: 0,
          account_locked_until: null,
        }
      });
      
      console.log('✅ Barman password updated successfully');
      return;
    }

    // Create new barman user
    const password_hash = await bcrypt.hash('Barman@1234', 12);

    const barman = await prisma.user.create({
      data: {
        full_name: 'Bar Attendant',
        email: 'barman@meatlovers.com',
        phone: '+254766666666',
        password_hash,
        role: Role.BARMAN,
        is_active: true,
      }
    });

    console.log('✅ Barman user created successfully');
    console.log('Email:', barman.email);
    console.log('Phone:', barman.phone);
    console.log('Password: Barman@1234');
    console.log('Role:', barman.role);
  } catch (error) {
    console.error('Error creating barman user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createBarmanUser();
