const { PrismaClient, EmploymentType, EmploymentStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingProfiles() {
  try {
    console.log('\n=== CREATING MISSING EMPLOYEE PROFILES ===\n');

    // Find all staff users without employee profiles
    const usersWithoutProfiles = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'BARMAN', 'CASHIER', 
               'STOREKEEPER', 'DISPATCHER', 'ACCOUNTANT', 'HR']
        },
        employee_profile: null
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    console.log(`📋 Found ${usersWithoutProfiles.length} users without employee profiles\n`);

    if (usersWithoutProfiles.length === 0) {
      console.log('✅ All staff users already have employee profiles!');
      return;
    }

    // Create employee profiles for each
    for (const user of usersWithoutProfiles) {
      console.log(`Creating profile for: ${user.full_name} (ID: ${user.id})`);
      console.log(`  Email: ${user.email || 'N/A'}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Created: ${user.created_at}`);

      await prisma.employeeProfile.create({
        data: {
          user_id: user.id,
          employment_start_date: user.created_at,
          employment_type: EmploymentType.PERMANENT,
          employment_status: user.is_active 
            ? EmploymentStatus.ACTIVE 
            : EmploymentStatus.INACTIVE,
          department: null,
          position_title: null,
        }
      });

      console.log(`  ✅ Profile created successfully\n`);
    }

    console.log(`\n🎉 Successfully created ${usersWithoutProfiles.length} employee profiles!`);

    // Verify the fix
    const remainingWithoutProfiles = await prisma.user.count({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'BARMAN', 'CASHIER', 
               'STOREKEEPER', 'DISPATCHER', 'ACCOUNTANT', 'HR']
        },
        employee_profile: null
      }
    });

    console.log(`\n📊 Verification:`);
    console.log(`  Staff users without profiles: ${remainingWithoutProfiles}`);

    if (remainingWithoutProfiles === 0) {
      console.log(`  ✅ SUCCESS: All staff users now have employee profiles!`);
    } else {
      console.log(`  ⚠️  WARNING: ${remainingWithoutProfiles} staff users still without profiles`);
    }

    console.log('\n=== OPERATION COMPLETE ===\n');

  } catch (error) {
    console.error('\n❌ Error creating employee profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
createMissingProfiles()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
