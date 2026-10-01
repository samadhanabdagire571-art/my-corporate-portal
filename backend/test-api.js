// Comprehensive Automated Acceptance & Health-Check Test Suite
// Run: node test-api.js

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('  CORPORATE PORTAL - COMPREHENSIVE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {

      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Frontend Web Server Test
  console.log('1. Testing Frontend Server (port 5173)...');
  try {
    const feRes = await fetch('http://localhost:5173/');
    const feHtml = await feRes.text();
    assert(feRes.status === 200, 'Frontend responded with HTTP 200');
    assert(feHtml.includes('Corporate Portal') || feHtml.includes('root'), 'Frontend serves valid HTML structure');
  } catch (err) {
    assert(false, `Frontend connection error: ${err.message}`);
  }

  // 2. Authentication Flow Test for all roles
  console.log('\n2. Testing Authentication Flows...');
  let adminToken = '';
  let tlToken = '';
  let empToken = '';

  // Admin login
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'Admin@123456' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.accessToken && data.user.role === 'ADMIN', 'Admin Login authenticated successfully');
    assert(data.redirectUrl === '/admin/dashboard', 'Admin redirect URL is /admin/dashboard');
    adminToken = data.accessToken;
  } catch (err) {
    assert(false, `Admin login error: ${err.message}`);
  }

  // Team Leader login
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'leader@corporate.com', password: 'Leader@123456' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.accessToken && data.user.role === 'TEAM_LEADER', 'Team Leader Login authenticated successfully');
    assert(data.redirectUrl === '/leader/dashboard', 'Team Leader redirect URL is /leader/dashboard');
    tlToken = data.accessToken;
  } catch (err) {
    assert(false, `Team Leader login error: ${err.message}`);
  }

  // Employee login
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'employee@corporate.com', password: 'Employee@123456' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.accessToken && data.user.role === 'EMPLOYEE', 'Employee Login authenticated successfully');
    assert(data.redirectUrl === '/employee/dashboard', 'Employee redirect URL is /employee/dashboard');
    empToken = data.accessToken;
  } catch (err) {
    assert(false, `Employee login error: ${err.message}`);
  }

  // Intern login
  try {
    const res = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'intern@corporate.com', password: 'Intern@123456' }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.accessToken && data.user.role === 'INTERN', 'Intern Login authenticated successfully');
    assert(data.redirectUrl === '/employee/dashboard', 'Intern redirect URL is /employee/dashboard');
  } catch (err) {
    assert(false, `Intern login error: ${err.message}`);
  }

  // Session verification (/api/auth/me)
  try {
    const res = await fetch('http://localhost:4000/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.email === 'admin@corporate.com', 'Auth Session /api/auth/me verifies active user');
  } catch (err) {
    assert(false, `Auth verify error: ${err.message}`);
  }

  // 3. Admin Dashboard Metrics Test
  console.log('\n3. Testing Admin Dashboard Metrics & Analytics...');
  try {
    const res = await fetch('http://localhost:4000/api/dashboard/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200, 'Admin Dashboard Overview returns HTTP 200');
    assert(typeof data.cards?.totalEmployees === 'number' && data.cards.totalEmployees >= 1, `Total employees metric: ${data.cards?.totalEmployees}`);
    assert(typeof data.cards?.totalTeams === 'number' && data.cards.totalTeams >= 1, `Total teams metric: ${data.cards?.totalTeams}`);
    assert(Array.isArray(data.projectProgress), `Project progress tracking present (${data.projectProgress?.length} projects)`);
    assert(Array.isArray(data.recentActivities), 'Recent activities log present');
    assert(Array.isArray(data.departmentDistribution), `Department distribution data present (${data.departmentDistribution?.length} depts)`);
  } catch (err) {
    assert(false, `Dashboard overview error: ${err.message}`);
  }

  // 4. Employee Management Flow Test
  console.log('\n4. Testing Employee Management CRUD & Filter Operations...');
  let createdEmpId = '';
  try {
    // List employees
    const listRes = await fetch('http://localhost:4000/api/employees?page=1&limit=10', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    assert(listRes.status === 200 && Array.isArray(listData.data), `List employees retrieved ${listData.data.length} records`);

    // Create a new employee
    const timestamp = Date.now().toString().slice(-4);
    const empPayload = {
      fullName: `Test QA Engineer ${timestamp}`,
      employeeId: `EMP-T${timestamp}`,
      email: `test_qa_${timestamp}@corporate.com`,
      phone: '+1 555-0199',
      department: 'Quality Assurance',
      designation: 'Senior QA Engineer',
      employeeType: 'EMPLOYEE',
      joiningDate: new Date().toISOString().split('T')[0],
      role: 'EMPLOYEE',
    };
    const createRes = await fetch('http://localhost:4000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(empPayload),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.id, `Created new employee: ${createData.employeeId} (${createData.fullName})`);
    createdEmpId = createData.id;

    // Filter/Search for the created employee
    const searchRes = await fetch(`http://localhost:4000/api/employees?search=${empPayload.employeeId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const searchData = await searchRes.json();
    assert(searchData.data?.some(e => e.id === createdEmpId), 'Search correctly locates newly created employee');

    // Toggle status (deactivate / reactivate)
    const toggleRes = await fetch(`http://localhost:4000/api/employees/${createdEmpId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'SUSPENDED' }),
    });
    const toggleData = await toggleRes.json();
    assert(toggleData.status === 'SUSPENDED', 'Successfully updated employee status to SUSPENDED');
  } catch (err) {
    assert(false, `Employee management test error: ${err.message}`);
  }

  // 5. Team Leader Management Flow Test
  console.log('\n5. Testing Team Leader Management...');
  try {
    const tlListRes = await fetch('http://localhost:4000/api/team-leaders', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const tlListData = await tlListRes.json();
    assert(tlListRes.status === 200 && Array.isArray(tlListData.data), `Team leaders directory returned ${tlListData.data.length} leaders`);
    assert(tlListData.data.length >= 1, 'At least one Team Leader is listed');
  } catch (err) {
    assert(false, `Team leader management test error: ${err.message}`);
  }

  // 6. Team Management Flow Test
  console.log('\n6. Testing Team Management & Assignments...');
  try {
    const teamsRes = await fetch('http://localhost:4000/api/teams', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const teamsData = await teamsRes.json();
    assert(teamsRes.status === 200 && Array.isArray(teamsData.data), `Teams directory returned ${teamsData.data.length} teams`);

    // Create a new Team
    const newTeamRes = await fetch('http://localhost:4000/api/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Automated Test Squadron ${Date.now().toString().slice(-4)}`,
        description: 'Quality verification automated team',
        department: 'Engineering',
      }),
    });
    const newTeamData = await newTeamRes.json();
    assert(newTeamRes.status === 201 && newTeamData.id, `Created team: ${newTeamData.name}`);
  } catch (err) {
    assert(false, `Team management test error: ${err.message}`);
  }

  // 7. Role-Based Access Control (RBAC) Security Verification
  console.log('\n7. Testing RBAC Security Protections...');
  try {
    // Employee trying to access Admin Dashboard
    const rbacRes = await fetch('http://localhost:4000/api/dashboard/overview', {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert(rbacRes.status === 403, 'Employee correctly blocked from Admin Dashboard (HTTP 403 Forbidden)');

    // Employee trying to create another employee
    const rbacCreateRes = await fetch('http://localhost:4000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        fullName: 'Unauthorized Employee',
        employeeId: 'EMP-UNAUTH',
        email: 'hacker@forbidden.com',
        department: 'Security',
        designation: 'Intruder',
      }),
    });
    assert(rbacCreateRes.status === 403, 'Employee correctly blocked from creating staff (HTTP 403 Forbidden)');
  } catch (err) {
    assert(false, `RBAC security error: ${err.message}`);
  }

  // Summary
  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
