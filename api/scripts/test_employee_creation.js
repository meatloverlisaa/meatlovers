const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testEmployeeCreation() {
  try {
    console.log('\n=== TESTING EMPLOYEE CREATION FLOW ===\n');

    // Test employee data
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

    console.log('📝 Creating test employee...');
    console.log(`   Name: ${testEmployee.full_name}`);
    console.log(`   Email: ${testEmployee.email}`);
    console.log(`   Role: ${testEmployee.role}`);

    // Step 1: Create employee
    console.log('\n1️⃣  Sending POST request to /hrm/employees...');
    const createResponse = await axios.post(
      `${API_BASE}/hrm/employees`,
      testEmployee,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Don't throw on any status
      }
    );

    console.log(`   Response Status: ${createResponse.status}`);

    if (createResponse.status === 201 || createResponse.status === 200) {
      console.log('   ✅ Employee created successfully!');
      console.log(`   Created User ID: ${createResponse.data.id}`);
      console.log(`   Has Profile: ${createResponse.data.employee_profile ? 'YES' : 'NO'}`);

      const createdUserId = createResponse.data.id;

      // Step 2: Verify employee appears in list
      console.log('\n2️⃣  Fetching employee list from /hrm/employees...');
      const listResponse = await axios.get(`${API_BASE}/hrm/employees`, {
        validateStatus: () => true,
      });

      console.log(`   Response Status: ${listResponse.status}`);

      if (listResponse.status === 200) {
        const employees = listResponse.data;
        console.log(`   Total employees in list: ${employees.length}`);

        const foundEmployee = employees.find(
          (emp) => emp.id.toString() === createdUserId.toString()
        );

        if (foundEmployee) {
          console.log('   ✅ New employee FOUND in list!');
          console.log(`   Name: ${foundEmployee.full_name}`);
          console.log(`   Has Profile: ${foundEmployee.employee_profile ? 'YES' : 'NO'}`);
        } else {
          console.log('   ❌ New employee NOT FOUND in list!');
          console.log('   This is the issue - employee created but not appearing.');
        }
      } else {
        console.log(`   ❌ Failed to fetch employee list: ${listResponse.status}`);
      }

      // Step 3: Try to get specific employee
      console.log(`\n3️⃣  Fetching specific employee from /hrm/employees/${createdUserId}...`);
      const getResponse = await axios.get(
        `${API_BASE}/hrm/employees/${createdUserId}`,
        {
          validateStatus: () => true,
        }
      );

      console.log(`   Response Status: ${getResponse.status}`);

      if (getResponse.status === 200) {
        console.log('   ✅ Employee retrieved successfully!');
        console.log(`   Name: ${getResponse.data.full_name}`);
        console.log(`   Has Profile: ${getResponse.data.employee_profile ? 'YES' : 'NO'}`);
      } else {
        console.log(`   ❌ Failed to get employee: ${getResponse.status}`);
      }

      // Step 4: Check database directly
      console.log('\n4️⃣  Checking database directly...');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const dbUser = await prisma.user.findUnique({
        where: { id: BigInt(createdUserId) },
        include: { employee_profile: true },
      });

      if (dbUser) {
        console.log('   ✅ User found in database!');
        console.log(`   Name: ${dbUser.full_name}`);
        console.log(`   Has Profile: ${dbUser.employee_profile ? 'YES' : 'NO'}`);
        if (dbUser.employee_profile) {
          console.log(`   Profile ID: ${dbUser.employee_profile.id}`);
          console.log(`   Department: ${dbUser.employee_profile.department || 'N/A'}`);
          console.log(`   Position: ${dbUser.employee_profile.position_title || 'N/A'}`);
        }
      } else {
        console.log('   ❌ User NOT found in database!');
      }

      await prisma.$disconnect();

      console.log('\n✅ TEST COMPLETE - Check results above');
    } else {
      console.log('   ❌ Failed to create employee!');
      console.log(`   Status: ${createResponse.status}`);
      console.log(`   Error: ${JSON.stringify(createResponse.data, null, 2)}`);
    }

    console.log('\n=== TEST FINISHED ===\n');
  } catch (error) {
    console.error('\n❌ ERROR DURING TEST:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testEmployeeCreation();
