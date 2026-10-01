// ==============================================================================
// Enterprise High-Availability Load Balancer & Reverse Proxy
// Round-Robin Traffic Distribution with Active Health-Checking & Auto-Failover
// Run: node load-balancer.js
// ==============================================================================

const http = require('http');

const LB_PORT = parseInt(process.env.LOAD_BALANCER_PORT || '8080', 10);
const TARGET_INSTANCES = (process.env.API_INSTANCES || 'http://127.0.0.1:4000,http://127.0.0.1:4001,http://127.0.0.1:4002')
  .split(',')
  .map((url, idx) => ({
    id: `instance-${idx + 1}`,
    url: url.trim(),
    parsed: new URL(url.trim()),
    isHealthy: true,
    consecutiveFailures: 0,
    totalRequests: 0,
    lastLatencyMs: 0,
    lastChecked: null,
  }));

let currentIndex = 0;

// Active Health Checker (Every 5 seconds)
async function checkInstanceHealth(instance) {
  const start = Date.now();
  try {
    const healthUrl = `${instance.url}/api/v1/health`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);
    instance.lastLatencyMs = Date.now() - start;
    instance.lastChecked = new Date().toISOString();

    if (res.status === 200) {
      if (!instance.isHealthy) {
        console.log(`[LoadBalancer] ✅ Restored healthy instance: ${instance.id} (${instance.url})`);
      }
      instance.isHealthy = true;
      instance.consecutiveFailures = 0;
    } else {
      markUnhealthy(instance, `HTTP status ${res.status}`);
    }
  } catch (err) {
    instance.lastLatencyMs = Date.now() - start;
    instance.lastChecked = new Date().toISOString();
    markUnhealthy(instance, err.message);
  }
}

function markUnhealthy(instance, reason) {
  instance.consecutiveFailures++;
  if (instance.isHealthy && instance.consecutiveFailures >= 2) {
    instance.isHealthy = false;
    console.warn(`[LoadBalancer] ⚠️ Evicted unhealthy instance: ${instance.id} (${instance.url}) — Reason: ${reason}`);
  }
}

// Start Background Health Checking Loop
function startHealthChecks() {
  TARGET_INSTANCES.forEach((inst) => checkInstanceHealth(inst));
  setInterval(() => {
    TARGET_INSTANCES.forEach((inst) => checkInstanceHealth(inst));
  }, 5000);
}

// Select Next Healthy Instance via Round Robin
function getNextHealthyInstance() {
  const healthy = TARGET_INSTANCES.filter((i) => i.isHealthy);
  if (healthy.length === 0) {
    // If all are marked unhealthy, attempt primary fallback instance
    return TARGET_INSTANCES[0];
  }
  const selected = healthy[currentIndex % healthy.length];
  currentIndex++;
  selected.totalRequests++;
  return selected;
}

// Reverse Proxy Server
const server = http.createServer(async (req, res) => {
  const requestId = req.headers['x-request-id'] || `lb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // Dedicated Load Balancer Status Endpoint
  if (req.url === '/lb/status' || req.url === '/api/v1/load-balancer/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      service: 'enterprise-load-balancer',
      port: LB_PORT,
      strategy: 'ROUND_ROBIN',
      instances: TARGET_INSTANCES.map((i) => ({
        id: i.id,
        url: i.url,
        isHealthy: i.isHealthy,
        totalRequests: i.totalRequests,
        lastLatencyMs: i.lastLatencyMs,
        lastChecked: i.lastChecked,
      })),
      totalHealthyInstances: TARGET_INSTANCES.filter((i) => i.isHealthy).length,
      totalInstances: TARGET_INSTANCES.length,
    }, null, 2));
  }

  const target = getNextHealthyInstance();
  const targetUrl = new URL(req.url, target.url);

  const proxyReq = http.request({
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      'x-forwarded-for': req.socket.remoteAddress,
      'x-forwarded-proto': 'http',
      'x-request-id': requestId,
      'x-load-balancer-target': target.id,
    },
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'x-load-balancer-target': target.id,
      'x-request-id': requestId,
    });
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`[LoadBalancer] Proxy error routing to ${target.id}: ${err.message}`);
    markUnhealthy(target, err.message);

    // Fallback response
    res.writeHead(503, { 'Content-Type': 'application/json', 'x-request-id': requestId });
    res.end(JSON.stringify({
      success: false,
      message: 'Service Temporarily Unavailable. Load balancer is re-routing traffic.',
      requestId,
    }));
  });

  req.pipe(proxyReq);
});

server.listen(LB_PORT, () => {
  console.log('================================================================');
  console.log(` 🚀 Enterprise High-Availability Load Balancer running on port ${LB_PORT}`);
  console.log(` Round-Robin Balancing across ${TARGET_INSTANCES.length} target instances:`);
  TARGET_INSTANCES.forEach((t) => console.log(`   - [${t.id}] ${t.url}`));
  console.log(` Status Endpoint: http://localhost:${LB_PORT}/lb/status`);
  console.log('================================================================');
  startHealthChecks();
});

module.exports = { server, TARGET_INSTANCES };
