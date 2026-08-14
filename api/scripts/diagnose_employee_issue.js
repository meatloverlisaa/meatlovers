const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function diagnoseIssue() {
  try {
    console.log('\n=== EMPLOYEE ONBOARDING DIAGNOSTIC ===\n');

    // Get the most recent user
    const latestUser = await prisma.user.findFirst({
      orderBy: { created_at: 'desc' },
      include: {
        employee_profile: true,
      },
    });

    console.log('📋 MOST RECENT USER CREATED:');
    if (latestUser) {
      console.log(`  ID: ${latestUser.id}`);
      console.log(`  Name: ${latestUser.full_name}`);
      console.log(`  Email: ${latestUser.email || 'N/A'}`);
      console.log(`  Phone: ${latestUser.phone || 'N/A'}`);
      console.log(`  Role: ${latestUser.role}`);
      console.log(`  Active: ${latestUser.is_active}`);
      console.log(`  Created: ${latestUser.created_at}`);
      console.log(`  Has Employee Profile: ${latestUser.employee_profile ? 'YES ✅' : 'NO ❌'}`);
      
      if (latestUser.employee_profile) {
        console.log('\n  Employee Profile Details:');
        console.log(`    Department: ${latestUser.employee_profile.department || 'N/A'}`);
        console.log(`    Position: ${latestUser.employee_profile.position_title || 'N/A'}`);
        console.log(`    Employment Status: ${latestUser.employee_profile.employment_status}`);
        console.log(`    Employment Type: ${latestUser.employee_profile.employment_type}`);
        console.log(`    Start Date: ${latestUser.employee_profile.employment_start_date}`);
      } else {
        console.log('\n  ⚠️  WARNING: User created without employee profile!');
      }
    }

    // Count all users vs users with profiles
    const totalUsers = await prisma.user.count();
    const usersWithProfiles = await prisma.user.count({
      where: {
        employee_profile: {
          isNot: null,
        },
      },
    });

    console.log(`\n\n📊 DATABASE STATISTICS:`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Users with Employee Profiles: ${usersWithProfiles}`);
    console.log(`  Users WITHOUT Profiles: ${totalUsers - usersWithProfiles}`);

    // Get staff roles (exclude SUPER_ADMIN and potential customer roles)
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'BARMAN', 'CASHIER', 'STOREKEEPER', 'DISPATCHER', 'ACCOUNTANT', 'HR'],
        },
      },
      include: {
        employee_profile: {
          select: {
            id: true,
            department: true,
            position_title: true,
            employment_status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`\n\n👥 STAFF USERS (${staffUsers.length}):`);
    staffUsers.forEach((user, index) => {
      const hasProfile = user.employee_profile ? '✅' : '❌';
      console.log(`\n  ${index + 1}. ${hasProfile} ${user.full_name}`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email: ${user.email || 'N/A'}`);
      console.log(`     Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`     Has Profile: ${user.employee_profile ? 'Yes' : 'No'}`);
      if (user.employee_profile) {
        console.log(`     Department: ${user.employee_profile.department || 'N/A'}`);
        console.log(`     Position: ${user.employee_profile.position_title || 'N/A'}`);
        console.log(`     Status: ${user.employee_profile.employment_status}`);
      }
    });

    // Check what the API would return for GET /hrm/employees
    console.log(`\n\n🔍 SIMULATING API CALL: GET /hrm/employees`);
    const apiResult = await prisma.user.findMany({
      include: {
        employee_profile: true,
      },
      orderBy: { full_name: 'asc' },
    });

    console.log(`  Total records returned: ${apiResult.length}`);
    console.log(`  Records with employee_profile: ${apiResult.filter(u => u.employee_profile).length}`);
    console.log(`  Records WITHOUT employee_profile: ${apiResult.filter(u => !u.employee_profile).length}`);

    // Check if there are any users created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsers = await prisma.user.findMany({
      where: {
        created_at: {
          gte: oneHourAgo,
        },
      },
      include: {
        employee_profile: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (recentUsers.length > 0) {
      console.log(`\n\n🕐 USERS CREATED IN THE LAST HOUR (${recentUsers.length}):`);
      recentUsers.forEach((user, index) => {
        console.log(`\n  ${index + 1}. ${user.full_name}`);
        console.log(`     Created: ${user.created_at}`);
        console.log(`     Has Profile: ${user.employee_profile ? 'YES ✅' : 'NO ❌'}`);
      });
    } else {
      console.log(`\n\n🕐 No users created in the last hour`);
    }

    console.log('\n\n=== DIAGNOSTIC COMPLETE ===\n');

  } catch (error) {
    console.error('Error during diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseIssue();
