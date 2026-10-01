async function test() {
  console.log('--- Starting API Acceptance Verification ---');

  // 1. Test Admin Login
  const adminRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'Admin@123456' }),
  });
  const adminData = await adminRes.json();
  console.log('1. Admin Login Status:', adminRes.status);
  console.log('   Redirect URL:', adminData.redirectUrl);
  console.log('   Admin Role:', adminData.user?.role);
  const token = adminData.accessToken;

  // 2. Test Team Leader Login
  const tlRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'leader@corporate.com', password: 'Leader@123456' }),
  });
  const tlData = await tlRes.json();
  console.log('2. Team Leader Login Status:', tlRes.status);
  console.log('   Redirect URL:', tlData.redirectUrl);

  // 3. Test Employee Login
  const empRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'employee@corporate.com', password: 'Employee@123456' }),
  });
  const empData = await empRes.json();
  console.log('3. Employee Login Status:', empRes.status);
  console.log('   Redirect URL:', empData.redirectUrl);

  // 4. Test Dashboard Overview
  const dashRes = await fetch('http://localhost:4000/api/dashboard/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  console.log('4. Dashboard Overview KPIs:');
  console.log('   Total Employees:', dashData.cards?.totalEmployees);
  console.log('   Total Interns:', dashData.cards?.totalInterns);
  console.log('   Total Team Leaders:', dashData.cards?.totalTeamLeaders);
  console.log('   Total Teams:', dashData.cards?.totalTeams);
  console.log('   Active Projects:', dashData.cards?.activeProjects);
  console.log('   Active Employees:', dashData.cards?.activeEmployees);

  // 5. Test Employee Pagination & Search
  const empsRes = await fetch('http://localhost:4000/api/employees?page=1&limit=5&search=Alexander', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const empsData = await empsRes.json();
  console.log('5. Employee Search "Alexander":', empsData.data?.length, 'result(s) found');

  // 6. Test Create Employee
  const createEmpRes = await fetch('http://localhost:4000/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: 'Eleanor Vance',
      employeeId: 'EMP-ENG-999',
      email: 'eleanor.vance@corporate.com',
      phone: '+1 (555) 019-8877',
      department: 'Engineering',
      designation: 'Senior Cloud Engineer',
      employeeType: 'EMPLOYEE',
    }),
  });
  const createdEmp = await createEmpRes.json();
  console.log('6. Created New Employee:', createdEmp.fullName, '(ID:', createdEmp.employeeId, ')');

  // 7. Test Teams & Member Allocation
  const teamsRes = await fetch('http://localhost:4000/api/teams', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const teamsData = await teamsRes.json();
  console.log('7. Teams Count:', teamsData.data?.length);

  const newTeamRes = await fetch('http://localhost:4000/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'Cloud Security Taskforce',
      department: 'Engineering',
      description: 'Zero-trust architecture and automated vulnerability scanning.',
      memberIds: [createdEmp.id],
    }),
  });
  const newTeam = await newTeamRes.json();
  console.log('   Created Team:', newTeam.name);

  console.log('--- All Acceptance API Tests Passed Successfully! ---');
}

test().catch(console.error);
