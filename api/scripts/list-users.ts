import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log('\n=== USER CREDENTIALS ===\n');
    console.log('Default password for all users: Admin@1234\n');
    console.log('Total users:', users.length);
    console.log('\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   Password: Admin@1234`);
      console.log(`   Created: ${user.created_at.toISOString()}`);
      console.log('');
    });

    console.log('\n=== LOGIN CREDENTIALS SUMMARY ===\n');
    users.forEach((user) => {
      const identifier = user.email || user.phone;
      if (identifier) {
        console.log(`${identifier} | Admin@1234 | ${user.role}`);
      }
    });
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
