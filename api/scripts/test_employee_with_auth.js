const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testWithAuth() {
  try {
    console.log('\n=== TESTING EMPLOYEE CREATION WITH AUTHENTICATION ===\n');

    // Step 1: Login first to get token
    console.log('1️⃣  Logging in to get auth token...');
    const loginResponse = await axios.post(
      `${API_BASE}/auth/login`,
      {
        email: 'admin@meatlovers.com',
        password: 'admin123', // Adjust if needed
      },
      { validateStatus: () => true }
    );

    if (loginResponse.status !== 200) {
      console.log('   ❌ Login failed! Trying alternative credentials...');
      
      // Try alternative admin account
      const altLogin = await axios.post(
        `${API_BASE}/auth/login`,
        {
          email: 'admin@test.com',
          password: 'admin123',
        },
        { validateStatus: () => true }
      );

      if (altLogin.status !== 200) {
        console.log('   ❌ Could not login with any admin account');
        console.log('   Please check admin credentials');
        return;
      }

      var token = altLogin.data.access_token;
      console.log('   ✅ Logged in with admin@test.com');
    } else {
      var token = loginResponse.data.access_token;
      console.log('   ✅ Logged in successfully!');
    }

    // Step 2: Create employee with auth token
    const testEmployee = {
      full_name: 'Test Employee ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      phone: `+25471${Math.floor(Math.random() * 10000000)}`,
      password: 'TestPass123!',
      role: 'WAITER',
      employment_start_date: new Date().toISOString().split('T')[0],
      employment_type: 'PERMANENT',
      employment_status: 'ACTIVE',
      department: 'Service',
      position_title: 'Test Waiter',
      nationality: 'Kenya',
      country: 'Kenya',
    };

    console.log('\n2️⃣  Creating test employee...');
    console.log(`   Name: ${testEmployee.full_name}`);
    console.log(`   Email: ${testEmployee.email}`);

    const createResponse = await axios.post(
      `${API_BASE}/hrm/employees`,
      testEmployee,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        validateStatus: () => true,
      }
    );

    console.log(`   Response Status: ${createResponse.status}`);

    if (createResponse.status === 201 || createResponse.status === 200) {
      console.log('   ✅ Employee created successfully!');
      console.log(`   User ID: ${createResponse.data.id}`);
      console.log(`   Has Profile: ${createResponse.data.employee_profile ? 'YES ✅' : 'NO ❌'}`);

      const userId = createResponse.data.id;

      // Step 3: Verify in employee list
      console.log('\n3️⃣  Checking employee list...');
      const listResponse = await axios.get(`${API_BASE}/hrm/employees`, {
        headers: { 'Authorization': `Bearer ${token}` },
        validateStatus: () => true,
      });

      if (listResponse.status === 200) {
        const employees = listResponse.data;
        console.log(`   Total employees: ${employees.length}`);

        const found = employees.find(emp => emp.id.toString() === userId.toString());
        if (found) {
          console.log(`   ✅ Employee FOUND in list!`);
          console.log(`   Name: ${found.full_name}`);
          console.log(`   Email: ${found.email}`);
          console.log(`   Has Profile: ${found.employee_profile ? 'YES' : 'NO'}`);
        } else {
          console.log(`   ❌ Employee NOT FOUND in list!`);
          console.log(`   \n   🔍 Debugging: Checking all recent users...`);
          const recent = employees.slice(-5);
          recent.forEach(emp => {
            console.log(`      - ${emp.full_name} (ID: ${emp.id})`);
          });
        }
      } else {
        console.log(`   ❌ Failed to get employee list: ${listResponse.status}`);
      }

      // Step 4: Check database
      console.log('\n4️⃣  Verifying in database...');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
        include: { employee_profile: true },
      });

      if (dbUser) {
        console.log(`   ✅ User exists in database!`);
        console.log(`   Name: ${dbUser.full_name}`);
        console.log(`   Email: ${dbUser.email}`);
        console.log(`   Role: ${dbUser.role}`);
        console.log(`   Active: ${dbUser.is_active}`);
        console.log(`   Has Profile: ${dbUser.employee_profile ? 'YES ✅' : 'NO ❌'}`);
        
        if (dbUser.employee_profile) {
          console.log(`\n   Profile Details:`);
          console.log(`     Department: ${dbUser.employee_profile.department || 'Not set'}`);
          console.log(`     Position: ${dbUser.employee_profile.position_title || 'Not set'}`);
          console.log(`     Status: ${dbUser.employee_profile.employment_status}`);
          console.log(`     Type: ${dbUser.employee_profile.employment_type}`);
        }
      } else {
        console.log(`   ❌ User NOT found in database!`);
      }

      await prisma.$disconnect();

      console.log('\n✅ TEST COMPLETE');
      console.log('\n📋 SUMMARY:');
      console.log(`   - Employee created: YES ✅`);
      console.log(`   - Has profile: ${createResponse.data.employee_profile ? 'YES ✅' : 'NO ❌'}`);
      console.log(`   - In database: ${dbUser ? 'YES ✅' : 'NO ❌'}`);
      
    } else {
      console.log('   ❌ Failed to create employee!');
      console.log(`   Status: ${createResponse.status}`);
      console.log(`   Response: ${JSON.stringify(createResponse.data, null, 2)}`);
      
      if (createResponse.status === 500) {
        console.log('\n   🔍 This is a server error. Check:');
        console.log('      1. Database connection');
        console.log('      2. Required fields in the payload');
        console.log('      3. Server logs for detailed error');
      }
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }

  console.log('\n=== TEST FINISHED ===\n');
}

testWithAuth();
