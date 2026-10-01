// ==============================================================================
// PART 6: ENTERPRISE INFRASTRUCTURE & SCALABILITY VERIFICATION SUITE
// Tests API Gateway, Redis Cache, Job Queue, Event Bus, Load Balancer & Monitoring
// Run: node backend/test-part6-infrastructure.js
// ==============================================================================

const http = require('http');

const API_BASE = 'http://localhost:4000';

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const reqHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : {},
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runPart6Suite() {
  console.log('================================================================');
  console.log('🏗️ PART 6: ENTERPRISE INFRASTRUCTURE & SCALABILITY TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. API Gateway & Security Headers
    // -------------------------------------------------------------------------
    console.log('--- 1. API Gateway & Security Verification ---');
    const health = await request('/api/v1/health');
    assert(health.statusCode === 200, 'Gateway routes /api/v1/health with HTTP 200');
    assert(health.headers['x-request-id'] !== undefined, `Gateway attached X-Request-ID: ${health.headers['x-request-id']}`);
    assert(health.headers['x-content-type-options'] === 'nosniff', 'Security header: X-Content-Type-Options is nosniff');
    assert(health.headers['x-frame-options'] === 'DENY', 'Security header: X-Frame-Options is DENY');
    assert(health.headers['x-ratelimit-limit'] !== undefined, `Rate Limiting header attached: ${health.headers['x-ratelimit-limit']} req/min`);

    const ready = await request('/api/v1/health/ready');
    assert(ready.statusCode === 200 && ready.data.status === 'READY', 'Deep readiness check /api/v1/health/ready returned READY');

    // -------------------------------------------------------------------------
    // 2. Authentication & Admin Token Acquisition
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Authenticated Session Handshake ---');
    const adminLogin = await request('/api/v1/auth/login', 'POST', {
      identifier: 'admin@corporate.com',
      password: 'Admin@123456',
    });
    assert(adminLogin.statusCode === 200 && adminLogin.data.accessToken, 'Admin authenticated via versioned Gateway route');
    const adminToken = adminLogin.data.accessToken;

    // -------------------------------------------------------------------------
    // 3. Background Job Queue & Worker Processing
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Background Job Queue & Worker Processing ---');
    const dispatchJob = await request('/api/v1/jobs', 'POST', {
      type: 'REPORT_EXPORT_CSV',
      payload: { filter: 'ALL_DEPARTMENTS', format: 'csv' },
    }, { Authorization: `Bearer ${adminToken}` });

    assert(dispatchJob.statusCode === 201 && dispatchJob.data.id, `Dispatched background job (ID: ${dispatchJob.data.id})`);
    const jobId = dispatchJob.data.id;

    // Wait 2.5s for worker processing
    await new Promise((r) => setTimeout(r, 2500));

    const checkJob = await request(`/api/v1/jobs/${jobId}`, 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(checkJob.data.status === 'COMPLETED', `Job transitioned to status: ${checkJob.data.status}`);
    assert(checkJob.data.progress === 100, `Job progress tracked: ${checkJob.data.progress}%`);

    // -------------------------------------------------------------------------
    // 4. Redis Caching & In-Memory Fallback Telemetry
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Caching Layer & Invalidation Telemetry ---');
    const monitorRes = await request('/api/v1/monitoring/metrics', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(monitorRes.statusCode === 200, 'Admin fetched full infrastructure telemetry');
    assert(monitorRes.data.cache !== undefined, `Cache Layer operational status: ${monitorRes.data.cache.status}`);
    assert(typeof monitorRes.data.cache.keysCount === 'number', `Active cached keys: ${monitorRes.data.cache.keysCount}`);

    // -------------------------------------------------------------------------
    // 5. Event-Driven Notification System
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Event-Driven Architecture & Domain Event Bus ---');
    // Trigger task creation event via API
    await request('/api/v1/tasks', 'POST', {
      projectId: 'f0000000-0000-0000-0000-000000000001',
      title: 'Infrastructure Scale Benchmark Event Task',
      priority: 'HIGH',
      status: 'UNASSIGNED',
    }, { Authorization: `Bearer ${adminToken}` });

    const updatedMonitor = await request('/api/v1/monitoring/metrics', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });

    assert(updatedMonitor.data.eventBus.activeListeners > 0, `Event bus has ${updatedMonitor.data.eventBus.activeListeners} active listeners`);
    assert(updatedMonitor.data.eventBus.totalEventsEmitted > 0, `Total domain events dispatched: ${updatedMonitor.data.eventBus.totalEventsEmitted}`);

    // -------------------------------------------------------------------------
    // 6. System Monitoring & Metrics Aggregation
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Executive System Observability ---');
    assert(monitorRes.data.apiGateway !== undefined, 'API Gateway telemetry metrics aggregated');
    assert(typeof monitorRes.data.apiGateway.totalRequests === 'number', `Total Gateway Ingress: ${monitorRes.data.apiGateway.totalRequests} reqs`);
    assert(monitorRes.data.database.status === 'healthy', 'Database connection health is HEALTHY');
    assert(monitorRes.data.aiService.status === 'healthy', `AI Service Provider: ${monitorRes.data.aiService.provider}`);

    console.log('\n================================================================');
    console.log(`🏁 PART 6 INFRASTRUCTURE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runPart6Suite();
