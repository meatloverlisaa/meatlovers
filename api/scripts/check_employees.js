const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEmployees() {
  try {
    console.log('\n=== CHECKING EMPLOYEE DATA ===\n');

    // Check all users
    const allUsers = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    console.log(`Total Users Found: ${allUsers.length}`);
    console.log('\nRecent Users:');
    allUsers.forEach((user) => {
      console.log(`- ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}, Created: ${user.created_at}`);
    });

    // Check staff users (non-customer roles)
    const staffRoles = ['ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'BARTENDER', 'CASHIER', 'STOREKEEPER', 'DISPATCHER', 'HR'];
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: staffRoles,
        },
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    console.log(`\n\nTotal Staff Users: ${staffUsers.length}`);
    console.log('\nStaff Users:');
    staffUsers.forEach((user) => {
      console.log(`- ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}, Active: ${user.is_active}`);
    });

    // Check employee profiles
    const employeeProfiles = await prisma.employeeProfile.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`\n\nTotal Employee Profiles: ${employeeProfiles.length}`);
    console.log('\nEmployee Profiles:');
    employeeProfiles.forEach((profile) => {
      console.log(`- User ID: ${profile.user_id}, Name: ${profile.user.full_name}, Department: ${profile.department}, Position: ${profile.position_title}, Status: ${profile.employment_status}`);
    });

    // Check for staff users WITHOUT employee profiles
    const staffWithoutProfiles = await prisma.user.findMany({
      where: {
        role: {
          in: staffRoles,
        },
        employee_profile: null,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    console.log(`\n\n⚠️  Staff Users WITHOUT Employee Profiles: ${staffWithoutProfiles.length}`);
    if (staffWithoutProfiles.length > 0) {
      console.log('\nMissing Profiles:');
      staffWithoutProfiles.forEach((user) => {
        console.log(`- ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}, Created: ${user.created_at}`);
      });
    }

    // Check most recent user creation
    const latestUser = await prisma.user.findFirst({
      orderBy: { created_at: 'desc' },
      include: {
        employee_profile: true,
      },
    });

    console.log('\n\n=== MOST RECENT USER ===');
    if (latestUser) {
      console.log(`ID: ${latestUser.id}`);
      console.log(`Name: ${latestUser.full_name}`);
      console.log(`Email: ${latestUser.email}`);
      console.log(`Role: ${latestUser.role}`);
      console.log(`Active: ${latestUser.is_active}`);
      console.log(`Created: ${latestUser.created_at}`);
      console.log(`Has Employee Profile: ${latestUser.employee_profile ? 'YES' : 'NO'}`);
      if (latestUser.employee_profile) {
        console.log(`Profile Department: ${latestUser.employee_profile.department}`);
        console.log(`Profile Position: ${latestUser.employee_profile.position_title}`);
        console.log(`Employment Status: ${latestUser.employee_profile.employment_status}`);
      }
    }

  } catch (error) {
    console.error('Error checking employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmployees();
