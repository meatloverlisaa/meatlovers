import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createChefUser() {
  try {
    const password = 'Admin@1234';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if chef user already exists
    const existingChef = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'chef@meatlovers.com' },
          { phone: '+254799111111' }
        ]
      }
    });

    if (existingChef) {
      console.log('Chef user already exists. Updating role to CHEF...');
      await prisma.user.update({
        where: { id: existingChef.id },
        data: { role: Role.CHEF }
      });
      console.log('✅ Updated existing user to CHEF role');
    } else {
      // Create new chef user
      const chef = await prisma.user.create({
        data: {
          full_name: 'Head Chef',
          email: 'chef@meatlovers.com',
          phone: '+254799111111',
          password_hash: hashedPassword,
          role: Role.CHEF,
          is_active: true,
        }
      });
      console.log('✅ Created new CHEF user');
      console.log(`   ID: ${chef.id}`);
      console.log(`   Email: ${chef.email}`);
      console.log(`   Phone: ${chef.phone}`);
      console.log(`   Role: ${chef.role}`);
    }

    console.log('\n=== CHEF LOGIN CREDENTIALS ===');
    console.log('Email: chef@meatlovers.com');
    console.log('Phone: +254799111111');
    console.log('Password: Admin@1234');
    console.log('Role: CHEF');
  } catch (error) {
    console.error('Error creating chef user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createChefUser();
