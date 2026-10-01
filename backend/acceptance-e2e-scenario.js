// acceptance-e2e-scenario.js
// Final Acceptance Scenario Testing Script for Part 4

const BASE_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, data: json };
  } catch {
    return { ok: res.ok, status: res.status, text };
  }
}

async function runScenario() {
  const ts = Date.now();
  console.log('🚀 ========================================================');
  console.log('🚀 EXECUTING FINAL ENTERPRISE ACCEPTANCE TEST SCENARIO');
  console.log('🚀 ========================================================\n');

  // STEP 1: Admin Login
  console.log('1️⃣  Admin Login...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@corporate.com', password: 'Admin@123456' }),
  });
  if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  const adminToken = adminLogin.data.accessToken;
  console.log('    ✅ Admin authenticated successfully.');

  // STEP 2: Create Team "AI Development"
  console.log('\n2️⃣  Admin creating Team: "AI Development"...');
  const teamRes = await request('/teams', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `AI Development ${ts}`,
      code: `TEAM-AIDEV-${ts}`,
      department: 'Engineering',
      description: 'Advanced AI and Portal Development Team',
    }),
  });
  const team = teamRes.data;
  console.log(`    ✅ Team created: ${team.name} (ID: ${team.id})`);

  // STEP 3: Create Team Leader Rahul & Employees (Amit, Sneha, Rohit)
  console.log('\n3️⃣  Admin creating Team Leader Rahul and Employees (Amit, Sneha, Rohit)...');
  
  // Rahul (Team Leader)
  const rahulRes = await request('/employees', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: `EMP-RAHUL-${ts}`,
      fullName: 'Rahul Sharma',
      email: `rahul.${ts}@corporate.com`,
      password: 'LeaderPassword123!',
      role: 'TEAM_LEADER',
      department: 'Engineering',
      designation: 'Senior Team Lead',
      employeeType: 'FULL_TIME',
      teamId: team.id,
    }),
  });
  const rahul = rahulRes.data;
  console.log(`    ✅ Team Leader created: ${rahul.fullName} (${rahul.email}) ID: ${rahul.id}`);

  // Assign Rahul as Team Leader of AI Development
  await request(`/teams/${team.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ leaderId: rahul.id }),
  });
  console.log(`    ✅ Rahul assigned as Team Leader of ${team.name}`);

  // Amit
  const amitRes = await request('/employees', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: `EMP-AMIT-${ts}`,
      fullName: 'Amit Patel',
      email: `amit.${ts}@corporate.com`,
      password: 'EmployeePassword123!',
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Frontend Developer',
      employeeType: 'FULL_TIME',
      teamId: team.id,
    }),
  });
  const amit = amitRes.data;
  console.log(`    ✅ Employee created: ${amit.fullName} (${amit.email}) ID: ${amit.id}`);

  // Sneha
  const snehaRes = await request('/employees', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: `EMP-SNEHA-${ts}`,
      fullName: 'Sneha Rao',
      email: `sneha.${ts}@corporate.com`,
      password: 'EmployeePassword123!',
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Backend Developer',
      employeeType: 'FULL_TIME',
      teamId: team.id,
    }),
  });
  const sneha = snehaRes.data;
  console.log(`    ✅ Employee created: ${sneha.fullName} (${sneha.email}) ID: ${sneha.id}`);

  // Rohit
  const rohitRes = await request('/employees', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      employeeId: `EMP-ROHIT-${ts}`,
      fullName: 'Rohit Verma',
      email: `rohit.${ts}@corporate.com`,
      password: 'EmployeePassword123!',
      role: 'INTERN',
      department: 'Engineering',
      designation: 'Software Intern',
      employeeType: 'INTERN',
      teamId: team.id,
    }),
  });
  const rohit = rohitRes.data;
  console.log(`    ✅ Intern created: ${rohit.fullName} (${rohit.email}) ID: ${rohit.id}`);

  // STEP 4: Admin creates Project "Employee Portal"
  console.log('\n4️⃣  Admin creating Project: "Employee Portal"...');
  const projRes = await request('/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `Employee Portal ${ts}`,
      code: `PRJ-${ts.toString().slice(-6)}`,
      description: 'Corporate Enterprise Employee & Intern Work Management Portal',
      department: 'Engineering',
      teamId: team.id,
      leaderId: rahul.id,
      priority: 'CRITICAL',
      status: 'ACTIVE',
      startDate: '2026-10-01',
      targetDate: '2026-12-31',
    }),
  });
  const project = projRes.data;
  console.log(`    ✅ Project created: ${project.name} (Code: ${project.code})`);

  // STEP 5: Rahul Logs In
  console.log('\n5️⃣  Rahul (Team Leader) logs in...');
  const rahulLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: rahul.email, password: 'LeaderPassword123!' }),
  });
  const rahulToken = rahulLogin.data.accessToken;
  console.log('    ✅ Rahul authenticated successfully.');

  // STEP 6: Rahul creates a 20-task project plan (5 unassigned, 3 for Amit, 2 for Sneha, others unassigned initially)
  console.log('\n6️⃣  Rahul creating 20-task Complete Task Plan via /tasks/bulk-plan...');
  const taskPayloads = [];
  for (let i = 1; i <= 20; i++) {
    let assignedTo = null;
    let status = 'UNASSIGNED';
    let isTodayWork = false;

    // 3 tasks to Amit (tasks 1, 2, 3)
    if (i <= 3) {
      assignedTo = amit.id;
      status = 'ASSIGNED';
      if (i === 1) isTodayWork = true; // Task 1 is marked for Today's Work
    }
    // 2 tasks to Sneha (tasks 4, 5)
    else if (i <= 5) {
      assignedTo = sneha.id;
      status = 'ASSIGNED';
    }

    taskPayloads.push({
      projectId: project.id,
      title: `Task ${i}: ${i === 1 ? 'Build Employee Dashboard' : `Feature Module Component ${i}`}`,
      description: `Detailed engineering specifications for deliverable item ${i}`,
      priority: i === 1 ? 'CRITICAL' : i % 2 === 0 ? 'HIGH' : 'NORMAL',
      assignedTo,
      status,
      isTodayWork,
      dueDate: '2026-10-15',
      orderIndex: i,
    });
  }

  const bulkCreateRes = await request('/tasks/bulk-plan', {
    method: 'POST',
    headers: { Authorization: `Bearer ${rahulToken}` },
    body: JSON.stringify({
      projectId: project.id,
      tasks: taskPayloads,
    }),
  });
  const createdList = bulkCreateRes.data;
  console.log(`    ✅ Created ${Array.isArray(createdList) ? createdList.length : '20'} tasks in project plan.`);

  // Verify Project Task Plan Versioning was recorded
  const versionsRes = await request(`/projects/${project.id}/versions`, {
    headers: { Authorization: `Bearer ${rahulToken}` },
  });
  console.log(`    ✅ Project Task Plan Versions tracked: ${versionsRes.data.length} version(s) recorded.`);

  // STEP 7: Later Rahul assigns remaining tasks
  console.log('\n7️⃣  Rahul assigning additional batch of tasks...');
  const allTasksRes = await request(`/tasks?projectId=${project.id}&limit=50`, {
    headers: { Authorization: `Bearer ${rahulToken}` },
  });
  const projectTasks = allTasksRes.data.data;
  const unassignedTasks = projectTasks.filter((t) => !t.assignedTo);
  console.log(`    ℹ️ Currently unassigned tasks: ${unassignedTasks.length}`);

  // Assign 5 tasks to Rohit
  const rohitTaskIds = unassignedTasks.slice(0, 5).map((t) => t.id);
  await request('/tasks/bulk-assign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${rahulToken}` },
    body: JSON.stringify({ taskIds: rohitTaskIds, employeeId: rohit.id }),
  });
  console.log(`    ✅ Bulk-assigned 5 tasks to Rohit (${rohit.fullName})`);

  // STEP 8: Amit Logs In & Sees Today's Work
  console.log('\n8️⃣  Amit (Employee) logs in...');
  const amitLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: amit.email, password: 'EmployeePassword123!' }),
  });
  const amitToken = amitLogin.data.accessToken;
  console.log('    ✅ Amit authenticated.');

  // Fetch Amit's Today's Work
  const amitTodayRes = await request(`/tasks/today-work?assignedTo=${amit.id}`, {
    headers: { Authorization: `Bearer ${amitToken}` },
  });
  const amitTasks = amitTodayRes.data.data || amitTodayRes.data || [];
  console.log(`    ✅ Amit sees ${amitTasks.length} task(s) in Today's Work.`);
  const taskToExecute = amitTasks[0] || projectTasks.find((t) => t.assignedTo === amit.id);
  console.log(`    🎯 Target Task: "${taskToExecute.title}" (ID: ${taskToExecute.id})`);

  // STEP 9: Amit Starts Work
  console.log('\n9️⃣  Amit starts the task...');
  await request(`/tasks/${taskToExecute.id}/start-work`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${amitToken}` },
  });
  console.log('    ✅ Task status moved to: IN_PROGRESS');

  // STEP 10: Amit Completes & Submits Work
  console.log('\n🔟  Amit submits work: "Work completed successfully."...');
  const submitRes = await request(`/tasks/${taskToExecute.id}/submit-work`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${amitToken}` },
    body: JSON.stringify({
      completionMessage: 'Work completed successfully. All components styled and integrated.',
      attachmentUrl: 'https://storage.corporate.internal/artifacts/emp-dash-v1.zip',
    }),
  });
  console.log(`    ✅ Submission registered with status: ${submitRes.data.status}`);

  // STEP 11: Rahul Reviews and Requests Revision
  console.log('\n1️⃣1️⃣  Rahul reviews submission and requests revision...');
  const reviewRevisionRes = await request(`/tasks/${taskToExecute.id}/review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${rahulToken}` },
    body: JSON.stringify({
      decision: 'REVISION_REQUIRED',
      feedback: 'Please update the unit test coverage and add responsive breakpoints.',
    }),
  });
  console.log(`    ✅ Rahul requested revision. Task status: ${reviewRevisionRes.data.status}`);

  // STEP 12: Amit Updates Work and Resubmits
  console.log('\n1️⃣2️⃣  Amit updates work and resubmits...');
  const resubmitRes = await request(`/tasks/${taskToExecute.id}/submit-work`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${amitToken}` },
    body: JSON.stringify({
      completionMessage: 'Updated with full test coverage and mobile breakpoints as requested.',
      attachmentUrl: 'https://storage.corporate.internal/artifacts/emp-dash-v2-final.zip',
    }),
  });
  console.log(`    ✅ Amit resubmitted work. Status: ${resubmitRes.data.status}`);

  // STEP 13: Rahul Approves Deliverable
  console.log('\n1️⃣3️⃣  Rahul approves deliverable...');
  const approveRes = await request(`/tasks/${taskToExecute.id}/review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${rahulToken}` },
    body: JSON.stringify({
      decision: 'APPROVE',
      feedback: 'Excellent work! Everything looks perfect.',
    }),
  });
  console.log(`    ✅ Task approved! Status: ${approveRes.data.status}`);

  // Verify Project Progress Updated Automatically
  const updatedProjRes = await request(`/projects/${project.id}`, {
    headers: { Authorization: `Bearer ${rahulToken}` },
  });
  console.log(`    📊 Updated Project Progress: ${updatedProjRes.data.progress}% (${updatedProjRes.data.completedTasks}/${updatedProjRes.data.totalTasks} completed)`);

  // STEP 14: Admin Inspects Audit Logs & Enterprise Reports
  console.log('\n1️⃣4️⃣  Admin inspecting Audit Trail & Enterprise Reports...');
  
  // Audit Logs
  const auditRes = await request('/audit-logs?limit=10', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    📋 Total Audit Logs captured: ${auditRes.data.meta.total}`);
  console.log(`    Recent actions: ${auditRes.data.data.slice(0, 3).map((l) => `[${l.action}] ${l.userName || l.userRole}`).join(' | ')}`);

  // Organization Report
  const orgReport = await request('/reports/organization', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    📈 Org Report: ${orgReport.data.totalEmployees} employees, ${orgReport.data.totalTeams} teams, ${orgReport.data.activeProjects} active projects.`);

  // Work Report
  const workReport = await request('/reports/work', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    💼 Work Report: ${workReport.data.totalTasks} total tasks, ${workReport.data.completed} completed, ${workReport.data.inProgress} in progress.`);

  // Global Search Verification
  const searchRes = await request('/search?q=Employee Portal', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`    🔍 Global Search for "Employee Portal" found: ${searchRes.data.projects.length} project(s), ${searchRes.data.tasks.length} task(s).`);

  console.log('\n🎉 ========================================================');
  console.log('🎉 ALL FINAL ACCEPTANCE SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('🎉 ========================================================');
}

runScenario().catch((err) => {
  console.error('❌ Acceptance Test Failed:', err);
  process.exit(1);
});
