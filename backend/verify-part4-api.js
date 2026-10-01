const API_URL = 'http://localhost:4000/api';

async function runTests() {
  console.log('--- Testing Part 4 Enterprise Backend APIs ---');

  // 1. Admin Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'Admin@123456' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log('1. Admin Login:', loginRes.status, 'Token exists:', !!token);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Organization Report
  const orgReportRes = await fetch(`${API_URL}/reports/organization`, { headers: authHeaders });
  const orgReport = await orgReportRes.json();
  console.log('2. Organization Report:', orgReportRes.status, 'Total employees:', orgReport.totalEmployees, 'Teams:', orgReport.totalTeams);

  // 3. Work Report
  const workReportRes = await fetch(`${API_URL}/reports/work`, { headers: authHeaders });
  const workReport = await workReportRes.json();
  console.log('3. Work Report:', workReportRes.status, 'Total tasks:', workReport.totalTasks, 'Completion rate:', `${workReport.completionRate}%`);

  // 4. Projects Report
  const projReportRes = await fetch(`${API_URL}/reports/projects`, { headers: authHeaders });
  const projReport = await projReportRes.json();
  console.log('4. Projects Report:', projReportRes.status, 'Projects count:', projReport.length);

  // 5. Employees Report
  const empReportRes = await fetch(`${API_URL}/reports/employees`, { headers: authHeaders });
  const empReport = await empReportRes.json();
  console.log('5. Employees Report:', empReportRes.status, 'Staff count:', empReport.length);

  // 6. Report CSV Export
  const exportRes = await fetch(`${API_URL}/reports/export?type=work&format=csv`, { headers: authHeaders });
  const csvText = await exportRes.text();
  console.log('6. Export CSV:', exportRes.status, 'CSV lines:', csvText.split('\n').length);

  // 7. Audit Logs
  const auditRes = await fetch(`${API_URL}/audit-logs?limit=5`, { headers: authHeaders });
  const auditData = await auditRes.json();
  console.log('7. Audit Logs:', auditRes.status, 'Count:', auditData.meta.total, 'First Action:', auditData.data[0]?.action);

  // 8. Global Search
  const searchRes = await fetch(`${API_URL}/search?q=portal`, { headers: authHeaders });
  const searchData = await searchRes.json();
  console.log('8. Global Search ("portal"):', searchRes.status, 'Projects:', searchData.projects.length, 'Tasks:', searchData.tasks.length);

  // 9. Organization Settings
  const getSettingsRes = await fetch(`${API_URL}/settings`, { headers: authHeaders });
  const settings = await getSettingsRes.json();
  console.log('9a. Get Settings:', getSettingsRes.status, 'Org name:', settings.organizationName);

  const patchSettingsRes = await fetch(`${API_URL}/settings`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ defaultTaskPriority: 'HIGH' }),
  });
  const updatedSettings = await patchSettingsRes.json();
  console.log('9b. Update Settings:', patchSettingsRes.status, 'New default priority:', updatedSettings.defaultTaskPriority);

  // 10. Task Plan Versioning
  const p1Id = 'f0000000-0000-0000-0000-000000000001';
  const getVersionsRes = await fetch(`${API_URL}/projects/${p1Id}/versions`, { headers: authHeaders });
  const versions = await getVersionsRes.json();
  console.log('10a. Project Versions:', getVersionsRes.status, 'Versions count:', versions.length);

  const createVersionRes = await fetch(`${API_URL}/projects/${p1Id}/versions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ summary: 'Version 2 release baseline with 9 deliverables' }),
  });
  const newVer = await createVersionRes.json();
  console.log('10b. Create Version:', createVersionRes.status, 'Version number:', newVer.versionNumber, 'Total tasks:', newVer.totalTasks);

  // 11. Admin View Mode / Impersonation
  const impersonateRes = await fetch(`${API_URL}/auth/impersonate`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ targetEmployeeId: 'c0000000-0000-0000-0000-000000000010' }), // Amit Sharma
  });
  const impData = await impersonateRes.json();
  console.log('11. Admin View Mode Impersonation:', impersonateRes.status, 'Is Impersonated:', impData.isImpersonated, 'Target Name:', impData.user.name);

  console.log('--- All Part 4 Enterprise Backend APIs Passed! ---');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
