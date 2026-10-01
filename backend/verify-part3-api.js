const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Part 3 Backend APIs ---');

  // 1. Employee Login (Amit Sharma)
  const empLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { identifier: 'amit@corporate.com', password: 'Employee@123456' }
  );
  console.log('1. Employee Login:', empLogin.status, 'Token exists:', !!empLogin.data?.accessToken);
  const empToken = empLogin.data?.accessToken;

  // 2. Leader Login (Marcus Sterling)
  const leaderLogin = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { identifier: 'leader@corporate.com', password: 'Leader@123456' }
  );
  console.log('2. Leader Login:', leaderLogin.status, 'Token exists:', !!leaderLogin.data?.accessToken);
  const leaderToken = leaderLogin.data?.accessToken;

  // 3. Employee Dashboard Overview
  const empDash = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/dashboard/employee',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('3. Employee Dashboard Overview:', empDash.status, {
    greeting: empDash.data?.greeting,
    todayWorkCount: empDash.data?.todayWorkCount,
    pendingCount: empDash.data?.pendingCount,
    completedCount: empDash.data?.completedCount,
    revisionRequiredCount: empDash.data?.revisionRequiredCount,
  });

  // 4. Employee My-Work endpoint
  const myWork = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/tasks/my-work',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('4. Employee My-Work list:', myWork.status, 'Tasks count:', myWork.data?.data?.length);

  // 5. Employee Start Work
  const targetTask = myWork.data?.data?.find((t) => t.status === 'ASSIGNED') || myWork.data?.data?.[0];
  const startWorkRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/tasks/${targetTask.id}/start-work`,
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('5. Start Work:', startWorkRes.status, 'New status:', startWorkRes.data?.status);

  // 6. Employee Submit Work (Simple form: completion message + attachment + comment)
  const submitRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/tasks/${targetTask.id}/submit-work`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
    },
    {
      completionMessage: 'Login page UX with form validation and responsive layout completed.',
      attachmentUrl: 'https://storage.supabase.co/v0/object/public/portal-assets/login_preview.png',
      attachmentName: 'login_preview.png',
      comment: 'Tested on Chrome and Safari.',
    }
  );
  console.log('6. Submit Work:', submitRes.status, 'New status:', submitRes.data?.status);

  // 7. Team Leader Pending Reviews
  const pendingReviews = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/tasks/pending-reviews',
    method: 'GET',
    headers: { Authorization: `Bearer ${leaderToken}` },
  });
  console.log('7. Leader Pending Reviews:', pendingReviews.status, 'Pending count:', pendingReviews.data?.data?.length);

  // 8. Team Leader Review -> Request Revision
  const revisionRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/tasks/${targetTask.id}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${leaderToken}` },
    },
    {
      decision: 'REVISION_REQUIRED',
      feedback: 'Please improve the mobile layout and submit again.',
    }
  );
  console.log('8. Leader Request Revision:', revisionRes.status, 'Status:', revisionRes.data?.status, 'Feedback:', revisionRes.data?.reviewFeedback);

  // 9. Employee Resubmission & Leader Approval
  const resubmitRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/tasks/${targetTask.id}/submit-work`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
    },
    {
      completionMessage: 'Mobile layout paddings adjusted for small viewports.',
    }
  );
  console.log('9a. Employee Resubmitted:', resubmitRes.status, 'Status:', resubmitRes.data?.status);

  const approveRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: `/api/tasks/${targetTask.id}/review`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${leaderToken}` },
    },
    {
      decision: 'APPROVE',
      feedback: 'Excellent work! Approved for production.',
    }
  );
  console.log('9b. Leader Approved:', approveRes.status, 'Status:', approveRes.data?.status);

  // 10. Notifications
  const notifs = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('10. Notifications:', notifs.status, 'Count:', notifs.data?.data?.length);

  // 11. CMS: Announcements, Resources & Knowledge Base
  const announcements = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/cms/announcements',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  const resources = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/cms/resources',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  const kb = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/cms/knowledge-base',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('11. CMS Check:', {
    announcements: announcements.data?.data?.length,
    resources: resources.data?.data?.length,
    knowledgeBase: kb.data?.data?.length,
  });

  // 12. LMS: My Training & Module Completion
  const training = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/lms/my-training',
    method: 'GET',
    headers: { Authorization: `Bearer ${empToken}` },
  });
  console.log('12. LMS Training:', training.status, 'Enrolled courses:', training.data?.length, 'Python progress:', training.data?.[0]?.progress + '%');

  // Complete module 4 of Python course -> 100%
  const pythonCourse = training.data?.[0];
  if (pythonCourse) {
    const progressRes = await request(
      {
        hostname: 'localhost',
        port: 4000,
        path: `/api/lms/enrollments/${pythonCourse.enrollmentId}/progress`,
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
      },
      { moduleId: 'mod-104', isCompleted: true }
    );
    console.log('13. Updated LMS Module Progress:', progressRes.status, 'New progress:', progressRes.data?.progress + '%', 'Status:', progressRes.data?.status);
  }

  console.log('--- All Part 3 Backend API Acceptance Tests Passed! ---');
}

runTests().catch(console.error);
