import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createDispatcherUser() {
  try {
    const password = 'Admin@1234';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if dispatcher user already exists
    const existingDispatcher = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'dispatcher@meatlovers.com' },
          { phone: '+254799333333' }
        ]
      }
    });

    if (existingDispatcher) {
      console.log('Dispatcher user already exists. Updating role to DISPATCHER...');
      await prisma.user.update({
        where: { id: existingDispatcher.id },
        data: { role: Role.DISPATCHER }
      });
      console.log('✅ Updated existing user to DISPATCHER role');
    } else {
      // Create new dispatcher user
      const dispatcher = await prisma.user.create({
        data: {
          full_name: 'Dispatcher User',
          email: 'dispatcher@meatlovers.com',
          phone: '+254799333333',
          password_hash: hashedPassword,
          role: Role.DISPATCHER,
          is_active: true,
        }
      });
      console.log('✅ Created new DISPATCHER user');
      console.log(`   ID: ${dispatcher.id}`);
      console.log(`   Email: ${dispatcher.email}`);
      console.log(`   Phone: ${dispatcher.phone}`);
      console.log(`   Role: ${dispatcher.role}`);
    }

    console.log('\n=== DISPATCHER LOGIN CREDENTIALS ===');
    console.log('Email: dispatcher@meatlovers.com');
    console.log('Phone: +254799333333');
    console.log('Password: Admin@1234');
    console.log('Role: DISPATCHER');
  } catch (error) {
    console.error('Error creating dispatcher user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDispatcherUser();
