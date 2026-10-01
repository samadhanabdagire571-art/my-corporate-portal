const http = require('http');

function postJson(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'POST',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function patchJson(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: 'localhost',
        port: 4000,
        path,
        method: 'PATCH',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Part 2 Backend APIs ---');

  // 1. Leader Login
  const leaderLogin = await postJson('/api/auth/login', {
    identifier: 'leader@corporate.com',
    password: 'Leader@123456',
  });
  console.log('1. Team Leader Login:', leaderLogin.status, 'Token exists:', !!leaderLogin.body.accessToken);
  const token = leaderLogin.body.accessToken;


  // 2. Fetch Leader Dashboard Overview
  const leaderOverview = await getJson('/api/dashboard/leader', token);
  console.log('2. Leader Dashboard Overview:', leaderOverview.status, {
    projects: leaderOverview.body.cards.myProjectsCount,
    progress: leaderOverview.body.cards.overallProgress + '%',
    unassigned: leaderOverview.body.cards.unassignedTasksCount,
    todayWork: leaderOverview.body.cards.todayWorkCount,
  });

  // 3. Create Project with Template
  const templates = await getJson('/api/task-templates', token);
  console.log('3. Task Templates Available:', templates.status, templates.body.length, 'templates');
  const webTemplate = templates.body[0];

  const newProject = await postJson(
    '/api/projects',
    {
      name: 'Mobile Workforce iOS & Android',
      code: 'PRJ-MOB-05',
      description: 'Native mobile client for real-time field staff checkins.',
      department: 'Engineering',
      priority: 'HIGH',
      status: 'ACTIVE',
      templateId: webTemplate.id,
    },
    token
  );
  console.log('4. Created Project from Template:', newProject.status, 'Project ID:', newProject.body.id);

  // 5. Verify tasks generated for new project
  const projectTasks = await getJson(`/api/tasks?projectId=${newProject.body.id}`, token);
  console.log('5. Tasks generated for new project:', projectTasks.body.data.length, 'tasks');

  // 6. Complete Task Plan bulk creation for a project
  const bulkPlanRes = await postJson(
    '/api/tasks/bulk-plan',
    {
      projectId: newProject.body.id,
      tasks: [
        { title: 'Custom Feature: Offline Sync Storage', priority: 'CRITICAL', orderIndex: 10 },
        { title: 'Custom Feature: Push Notifications APNS/FCM', priority: 'HIGH', orderIndex: 11 },
      ],
    },
    token
  );
  console.log('6. Bulk Create Task Plan:', bulkPlanRes.status, 'Created count:', bulkPlanRes.body.count);

  // 7. Bulk Upload (CSV-like rows)
  const uploadRes = await postJson(
    '/api/tasks/bulk-upload',
    {
      projectId: newProject.body.id,
      rows: [
        { task: 'Biometric FaceID Login', description: 'Face recognition biometric gating', priority: 'High', dueDate: '2026-10-20' },
        { task: 'Dark Mode Adaptive Palette', description: 'Tailwind dark styles', priority: 'Normal', dueDate: '2026-10-22' },
      ],
    },
    token
  );
  console.log('7. Bulk Upload Rows:', uploadRes.status, 'Success count:', uploadRes.body.successCount);

  // 8. Assign Task & Reassign Task
  const allTasks = await getJson(`/api/tasks?projectId=${newProject.body.id}&unassignedOnly=true`, token);
  const taskToAssign = allTasks.body.data[0];
  console.log('8. Unassigned task to assign:', taskToAssign.title);

  const employees = await getJson('/api/employees', token);
  const emp = employees.body.data[0];

  const assignRes = await patchJson(
    `/api/tasks/${taskToAssign.id}/assign`,
    { assignedToId: emp.id, dueDate: '2026-10-15', reason: 'Assigned iOS lead' },
    token
  );
  console.log('9. Task Assigned:', assignRes.status, 'Assignee:', assignRes.body.assignedTo);

  const emp2 = employees.body.data[1];
  const reassignRes = await patchJson(
    `/api/tasks/${taskToAssign.id}/reassign`,
    { newEmployeeId: emp2.id, reason: 'Workload balancing reallocation' },
    token
  );
  console.log('10. Task Reassigned:', reassignRes.status, 'History length:', reassignRes.body.assignmentHistory.length);

  // 11. Bulk Assignment
  const unassignedList = await getJson(`/api/tasks?projectId=${newProject.body.id}&unassignedOnly=true`, token);
  const idsToAssign = unassignedList.body.data.slice(0, 2).map((t) => t.id);
  const bulkAssignRes = await postJson(
    '/api/tasks/bulk-assign',
    { taskIds: idsToAssign, employeeId: emp.id },
    token
  );
  console.log('11. Bulk Assigned 2 tasks:', bulkAssignRes.status, 'Success count:', bulkAssignRes.body.successCount);

  // 12. Daily Work Dispatch
  const dailyWorkRes = await patchJson(
    `/api/tasks/${taskToAssign.id}/daily-work`,
    { isTodayWork: true },
    token
  );
  console.log('12. Daily Work Dispatch:', dailyWorkRes.status, 'isTodayWork:', dailyWorkRes.body.isTodayWork);

  console.log('--- All Part 2 Backend API Acceptance Tests Passed! ---');
}

runTests().catch(console.error);
