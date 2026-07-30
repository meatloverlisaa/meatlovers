import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface UserConfig {
  role: Role;
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

const users: UserConfig[] = [
  {
    role: Role.SUPER_ADMIN,
    full_name: 'Super Administrator',
    email: 'superadmin@meatlovers.com',
    phone: '+254799999999',
    password: 'SuperAdmin@1234',
  },
  {
    role: Role.ADMIN,
    full_name: 'System Administrator',
    email: 'admin@meatlovers.com',
    phone: '+254788888888',
    password: 'Admin@1234',
  },
  {
    role: Role.MANAGER,
    full_name: 'Restaurant Manager',
    email: 'manager@meatlovers.com',
    phone: '+254777777777',
    password: 'Manager@1234',
  },
  {
    role: Role.CASHIER,
    full_name: 'Cashier Officer',
    email: 'cashier@meatlovers.com',
    phone: '+254766666666',
    password: 'Cashier@1234',
  },
  {
    role: Role.WAITER,
    full_name: 'Restaurant Waiter',
    email: 'waiter@meatlovers.com',
    phone: '+254755555555',
    password: 'Waiter@1234',
  },
  {
    role: Role.CHEF,
    full_name: 'Head Chef',
    email: 'chef@meatlovers.com',
    phone: '+254744444444',
    password: 'Chef@1234',
  },
  {
    role: Role.STOREKEEPER,
    full_name: 'Store Keeper',
    email: 'storekeeper@meatlovers.com',
    phone: '+254733333333',
    password: 'Storekeeper@1234',
  },
  {
    role: Role.BARMAN,
    full_name: 'Bar Attendant',
    email: 'barman@meatlovers.com',
    phone: '+254722222222',
    password: 'Barman@1234',
  },
  {
    role: Role.DISPATCHER,
    full_name: 'Dispatch Officer',
    email: 'dispatcher@meatlovers.com',
    phone: '+254711111111',
    password: 'Dispatcher@1234',
  },
  {
    role: Role.ACCOUNTANT,
    full_name: 'Financial Accountant',
    email: 'accountant@meatlovers.com',
    phone: '+254700000000',
    password: 'Accountant@1234',
  },
  {
    role: Role.HR,
    full_name: 'Human Resources Manager',
    email: 'hr@meatlovers.com',
    phone: '+254799000000',
    password: 'HR@1234',
  },
];

async function seedAllUsers() {
  console.log('🌱 Starting user seeding...\n');

  for (const userConfig of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userConfig.email },
            { role: userConfig.role }
          ]
        }
      });

      if (existingUser) {
        console.log(`📝 Updating existing ${userConfig.role} user...`);
        
        const password_hash = await bcrypt.hash(userConfig.password, 12);
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            full_name: userConfig.full_name,
            email: userConfig.email,
            phone: userConfig.phone,
            password_hash,
            is_active: true,
            failed_login_attempts: 0,
            account_locked_until: null,
          }
        });
        
        console.log(`   ✅ ${userConfig.role} updated: ${userConfig.email}`);
      } else {
        // Create new user
        const password_hash = await bcrypt.hash(userConfig.password, 12);

        const newUser = await prisma.user.create({
          data: {
            full_name: userConfig.full_name,
            email: userConfig.email,
            phone: userConfig.phone,
            password_hash,
            role: userConfig.role,
            is_active: true,
          }
        });

        console.log(`   ✅ ${userConfig.role} created: ${userConfig.email}`);
      }
      
      console.log(`      Password: ${userConfig.password}\n`);
    } catch (error) {
      console.error(`   ❌ Error with ${userConfig.role}:`, error);
    }
  }

  console.log('\n🎉 User seeding completed!\n');
  console.log('📋 Summary of all users:');
  console.log('═'.repeat(70));
  
  const allUsers = await prisma.user.findMany({
    orderBy: { role: 'asc' },
    select: {
      role: true,
      full_name: true,
      email: true,
      phone: true,
      is_active: true,
    }
  });

  for (const user of allUsers) {
    const status = user.is_active ? '🟢' : '🔴';
    const email = user.email || 'N/A';
    console.log(`${status} ${user.role.padEnd(15)} | ${email.padEnd(30)} | ${user.phone || 'N/A'}`);
  }
  
  console.log('═'.repeat(70));
  console.log(`\nTotal users: ${allUsers.length}`);
  console.log('\n✨ All users are ready to use!\n');
}

seedAllUsers()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
