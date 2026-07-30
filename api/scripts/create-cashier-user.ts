import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createCashierUser() {
  try {
    const password = 'Admin@1234';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if cashier user already exists
    const existingCashier = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'cashier@meatlovers.com' },
          { phone: '+254799222222' }
        ]
      }
    });

    if (existingCashier) {
      console.log('Cashier user already exists. Updating role to CASHIER...');
      await prisma.user.update({
        where: { id: existingCashier.id },
        data: { role: Role.CASHIER }
      });
      console.log('✅ Updated existing user to CASHIER role');
    } else {
      // Create new cashier user
      const cashier = await prisma.user.create({
        data: {
          full_name: 'Cashier User',
          email: 'cashier@meatlovers.com',
          phone: '+254799222222',
          password_hash: hashedPassword,
          role: Role.CASHIER,
          is_active: true,
        }
      });
      console.log('✅ Created new CASHIER user');
      console.log(`   ID: ${cashier.id}`);
      console.log(`   Email: ${cashier.email}`);
      console.log(`   Phone: ${cashier.phone}`);
      console.log(`   Role: ${cashier.role}`);
    }

    console.log('\n=== CASHIER LOGIN CREDENTIALS ===');
    console.log('Email: cashier@meatlovers.com');
    console.log('Phone: +254799222222');
    console.log('Password: Admin@1234');
    console.log('Role: CASHIER');
  } catch (error) {
    console.error('Error creating cashier user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCashierUser();
