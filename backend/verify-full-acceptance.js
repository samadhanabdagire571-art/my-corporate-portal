// Full Acceptance & Stabilization Test Suite for Part 1
// Tests every acceptance criterion in the specification

const API = 'http://localhost:4000/api';

async function testAll() {
  console.log('================================================================');
  console.log('   PART 1 ACCEPTANCE CRITERIA & REGRESSION VERIFICATION');
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

  // -------------------------------------------------------------------------
  // 1. Admin Login & Landing Route
  // -------------------------------------------------------------------------
  console.log('1. Verifying Admin Login & Landing Route (/admin/dashboard)...');
  const adminLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'Admin@123456' }),
  });
  const adminData = await adminLogin.json();
  assert(adminLogin.status === 200, 'Admin login responded with HTTP 200');
  assert(adminData.redirectUrl === '/admin/dashboard', 'Admin lands on /admin/dashboard');
  assert(adminData.user.role === 'ADMIN', 'Admin role is ADMIN');
  const adminToken = adminData.accessToken;

  // -------------------------------------------------------------------------
  // 2. Team Leader Login & Landing Route
  // -------------------------------------------------------------------------
  console.log('\n2. Verifying Team Leader Login & Landing Route (/leader/dashboard)...');
  const tlLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'leader@corporate.com', password: 'Leader@123456' }),
  });
  const tlData = await tlLogin.json();
  assert(tlLogin.status === 200, 'Team Leader login responded with HTTP 200');
  assert(tlData.redirectUrl === '/leader/dashboard', 'Team Leader lands on /leader/dashboard');
  assert(tlData.user.role === 'TEAM_LEADER', 'Team Leader role is TEAM_LEADER');
  const tlToken = tlData.accessToken;

  // -------------------------------------------------------------------------
  // 3. Employee & Intern Login & Landing Route
  // -------------------------------------------------------------------------
  console.log('\n3. Verifying Employee & Intern Login & Landing Route (/employee/dashboard)...');
  const empLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee@corporate.com', password: 'Employee@123456' }),
  });
  const empData = await empLogin.json();
  assert(empLogin.status === 200, 'Employee login responded with HTTP 200');
  assert(empData.redirectUrl === '/employee/dashboard', 'Employee lands on /employee/dashboard');
  const empToken = empData.accessToken;

  const internLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'intern@corporate.com', password: 'Intern@123456' }),
  });
  const internData = await internLogin.json();
  assert(internLogin.status === 200, 'Intern login responded with HTTP 200');
  assert(internData.redirectUrl === '/employee/dashboard', 'Intern lands on /employee/dashboard');

  // Test invalid credentials
  const badLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'WrongPassword@999' }),
  });
  assert(badLogin.status === 401, 'Invalid password correctly rejected with HTTP 401');

  // -------------------------------------------------------------------------
  // 4. Password Recovery & Reset Lifecycle
  // -------------------------------------------------------------------------
  console.log('\n4. Verifying Password Recovery & Reset Flow...');
  const forgotRes = await fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee@corporate.com' }),
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200 && forgotData.devResetToken, 'Forgot password generated reset token');

  const resetRes = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: forgotData.devResetToken, newPassword: 'UpdatedEmp@987654' }),
  });
  assert(resetRes.status === 200, 'Reset password endpoint returned HTTP 200');

  // Verify login with new password
  const testNewPassLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee@corporate.com', password: 'UpdatedEmp@987654' }),
  });
  assert(testNewPassLogin.status === 200, 'Successfully authenticated using updated password');

  // Restore original password for ongoing tests
  const forgotRestore = await fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee@corporate.com' }),
  });
  const forgotRestoreData = await forgotRestore.json();
  await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: forgotRestoreData.devResetToken, newPassword: 'Employee@123456' }),
  });

  // -------------------------------------------------------------------------
  // 5. Admin Dashboard Metrics Verification
  // -------------------------------------------------------------------------
  console.log('\n5. Verifying Admin Dashboard Overview & Metrics...');
  const dashRes = await fetch(`${API}/dashboard/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dashData = await dashRes.json();
  assert(dashRes.status === 200, 'Dashboard overview responded with HTTP 200');
  assert(typeof dashData.cards?.totalEmployees === 'number', 'Card metric: Total Employees');
  assert(typeof dashData.cards?.totalInterns === 'number', 'Card metric: Total Interns');
  assert(typeof dashData.cards?.totalTeamLeaders === 'number', 'Card metric: Total Team Leaders');
  assert(typeof dashData.cards?.totalTeams === 'number', 'Card metric: Total Teams');
  assert(typeof dashData.cards?.activeProjects === 'number', 'Card metric: Active Projects');
  assert(typeof dashData.cards?.activeEmployees === 'number', 'Card metric: Active Employees');
  assert(typeof dashData.workCompletionRate?.rate === 'number' && dashData.workCompletionRate?.rate >= 0, 'Work completion rate gauge computed from real tasks');
  assert(Array.isArray(dashData.departmentDistribution), 'Department distribution array present');
  assert(Array.isArray(dashData.recentActivities), 'Live audit activities present');

  // -------------------------------------------------------------------------
  // 6. Employee CRUD & Management Verification
  // -------------------------------------------------------------------------
  console.log('\n6. Verifying Employee Management (CRUD, Search, Filter, Status)...');
  // Create Employee
  const newEmpPayload = {
    fullName: 'Sophia Bennett',
    employeeId: 'EMP-ENG-881',
    email: 'sophia.bennett@corporate.com',
    phone: '+1 (555) 019-3344',
    department: 'Engineering',
    designation: 'Staff Backend Architect',
    employeeType: 'EMPLOYEE',
    joiningDate: '2024-04-01',
  };
  const createEmpRes = await fetch(`${API}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newEmpPayload),
  });
  const createdEmp = await createEmpRes.json();
  assert(createEmpRes.status === 201 && createdEmp.id, `Admin created employee: ${createdEmp.fullName}`);

  // Edit Employee
  const editEmpRes = await fetch(`${API}/employees/${createdEmp.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ designation: 'Principal Backend Architect' }),
  });
  const editedEmp = await editEmpRes.json();
  assert(editedEmp.designation === 'Principal Backend Architect', 'Admin updated employee designation');

  // Search Employee
  const searchRes = await fetch(`${API}/employees?search=Bennett`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const searchData = await searchRes.json();
  assert(searchData.data.some((e) => e.id === createdEmp.id), 'Employee search by name succeeded');

  // Filter by department
  const filterDeptRes = await fetch(`${API}/employees?department=Engineering`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const filterDeptData = await filterDeptRes.json();
  assert(filterDeptData.data.every((e) => e.department === 'Engineering'), 'Filter by department Engineering verified');

  // Filter by type
  const filterTypeRes = await fetch(`${API}/employees?type=INTERN`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const filterTypeData = await filterTypeRes.json();
  assert(filterTypeData.data.every((e) => e.employeeType === 'INTERN'), 'Filter by type INTERN verified');

  // Pagination
  const pageRes = await fetch(`${API}/employees?page=1&limit=3`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pageData = await pageRes.json();
  assert(pageData.data.length === 3 && pageData.meta.totalPages > 1, 'Pagination limit=3 returns correct chunk and meta');

  // Deactivate Employee
  const deactRes = await fetch(`${API}/employees/${createdEmp.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'INACTIVE' }),
  });
  const deactData = await deactRes.json();
  assert(deactData.status === 'INACTIVE', 'Employee deactivated to INACTIVE');

  // Activate Employee back
  const actRes = await fetch(`${API}/employees/${createdEmp.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'ACTIVE' }),
  });
  const actData = await actRes.json();
  assert(actData.status === 'ACTIVE', 'Employee reactivated to ACTIVE');

  // Admin Reset Employee Password
  const adminResetPassRes = await fetch(`${API}/employees/${createdEmp.id}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
  });
  const adminResetPassData = await adminResetPassRes.json();
  assert(adminResetPassRes.status === 201 && adminResetPassData.temporaryPassword, 'Admin generated temporary password for employee');

  // Protect Root Administrator from Deletion
  const adminEmp = searchData.data.find(e => e.employeeId === 'EMP-ADM-001') || { id: 'c0000000-0000-0000-0000-000000000001' };
  const delAdminRes = await fetch(`${API}/employees/${adminEmp.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(delAdminRes.status === 400, 'Safety protection: Primary root admin deletion rejected with HTTP 400');

  // -------------------------------------------------------------------------
  // 7. Team Leader Management Verification
  // -------------------------------------------------------------------------
  console.log('\n7. Verifying Team Leader Management (Appoint, Edit, Status)...');
  const newTLPayload = {
    fullName: 'Lucas Ramirez',
    employeeId: 'EMP-TL-099',
    email: 'lucas.ramirez@corporate.com',
    phone: '+1 (555) 018-7711',
    department: 'Engineering',
    designation: 'DevOps Lead',
  };
  const createTLRes = await fetch(`${API}/team-leaders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newTLPayload),
  });
  const createdTL = await createTLRes.json();
  assert(createTLRes.status === 201 && createdTL.id, `Appointed new team leader: ${createdTL.fullName}`);

  // Edit Team Leader
  const editTLRes = await fetch(`${API}/team-leaders/${createdTL.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ designation: 'Site Reliability Engineering Lead' }),
  });
  const editedTL = await editTLRes.json();
  assert(editedTL.designation === 'Site Reliability Engineering Lead', 'Updated team leader profile');

  // Toggle TL Status
  const toggleTLRes = await fetch(`${API}/team-leaders/${createdTL.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'INACTIVE' }),
  });
  const toggledTL = await toggleTLRes.json();
  assert(toggledTL.status === 'INACTIVE', 'Team leader status changed to INACTIVE');

  // -------------------------------------------------------------------------
  // 8. Team Management Verification (Create, Edit, Assign Leader, Add/Remove Members)
  // -------------------------------------------------------------------------
  console.log('\n8. Verifying Corporate Team Management...');
  const newTeamPayload = {
    name: 'SRE & Disaster Recovery',
    department: 'Engineering',
    description: 'Autonomous multi-region failover and cluster self-healing.',
    leaderId: createdTL.id,
  };
  const createTeamRes = await fetch(`${API}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(newTeamPayload),
  });
  const createdTeam = await createTeamRes.json();
  assert(createTeamRes.status === 201 && createdTeam.id, `Created team: ${createdTeam.name}`);
  assert(createdTeam.leaderId === createdTL.id, 'Team leader assigned during creation');

  // Re-assign Team Leader
  const assignLeaderRes = await fetch(`${API}/teams/${createdTeam.id}/leader`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ leaderId: 'c0000000-0000-0000-0000-000000000002' }), // Marcus Sterling
  });
  const assignedTeam = await assignLeaderRes.json();
  assert(assignedTeam.leaderId === 'c0000000-0000-0000-0000-000000000002', 'Re-assigned team leader to Marcus Sterling');

  // Add Employee to Team
  const addMemberRes = await fetch(`${API}/teams/${createdTeam.id}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ employeeId: createdEmp.id, roleInTeam: 'MEMBER' }),
  });
  assert(addMemberRes.status === 201, 'Added employee to team roster');

  // Verify team details has member
  const getTeamRes = await fetch(`${API}/teams/${createdTeam.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getTeamData = await getTeamRes.json();
  assert(getTeamData.members.some((m) => m.id === createdEmp.id), 'Team inspection confirms employee is in roster');

  // Remove Employee from Team
  const removeMemberRes = await fetch(`${API}/teams/${createdTeam.id}/members/${createdEmp.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(removeMemberRes.status === 200, 'Removed employee from team roster');

  // Verify removal
  const getTeamRes2 = await fetch(`${API}/teams/${createdTeam.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const getTeamData2 = await getTeamRes2.json();
  assert(!getTeamData2.members.some((m) => m.id === createdEmp.id), 'Team inspection confirms employee is removed');

  // -------------------------------------------------------------------------
  // 9. Independent Backend RBAC Security Enforcement
  // -------------------------------------------------------------------------
  console.log('\n9. Verifying Independent Backend RBAC Security...');
  // Employee trying to access Admin overview
  const empAccessDash = await fetch(`${API}/dashboard/overview`, {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert(empAccessDash.status === 403, 'Employee blocked from Admin Dashboard overview (HTTP 403)');

  // Employee trying to create employee
  const empCreateEmp = await fetch(`${API}/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${empToken}`,
    },
    body: JSON.stringify(newEmpPayload),
  });
  assert(empCreateEmp.status === 403, 'Employee blocked from creating employee (HTTP 403)');

  // Employee trying to create team
  const empCreateTeam = await fetch(`${API}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${empToken}`,
    },
    body: JSON.stringify(newTeamPayload),
  });
  assert(empCreateTeam.status === 403, 'Employee blocked from creating team (HTTP 403)');

  // Team Leader trying to delete team
  const tlDeleteTeam = await fetch(`${API}/teams/${createdTeam.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tlToken}` },
  });
  assert(tlDeleteTeam.status === 403, 'Team Leader blocked from deleting team (HTTP 403)');

  // Team Leader CAN add member to team
  const tlAddMember = await fetch(`${API}/teams/${createdTeam.id}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tlToken}`,
    },
    body: JSON.stringify({ employeeId: createdEmp.id }),
  });
  assert(tlAddMember.status === 201, 'Team Leader permitted to add member to team roster (HTTP 201)');

  // Clean up test team
  await fetch(`${API}/teams/${createdTeam.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // Clean up test employee
  await fetch(`${API}/employees/${createdEmp.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // Clean up test team leader
  await fetch(`${API}/employees/${createdTL.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`  VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

testAll().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
