const http = require('http');
const https = require('https');
const { URL } = require('url');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3001';

const SECURITY_TESTS = {
  sqlInjection: {
    payloads: [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1#",
    ],
    endpoints: ['/auth/login', '/users/search', '/orders', '/restaurants'],
    description: 'SQL Injection Tests',
  },
  xss: {
    payloads: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(document.cookie)',
      '<svg onload=alert(1)>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
    ],
    endpoints: ['/auth/signup', '/reviews', '/comments'],
    description: 'XSS Injection Tests',
  },
  pathTraversal: {
    payloads: [
      '../../../etc/passwd',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd',
      '..%252f..%252f..%252fetc/passwd',
      '/proc/self/environ',
    ],
    endpoints: ['/files', '/images', '/static'],
    description: 'Path Traversal Tests',
  },
  rateLimiting: {
    requests: 100,
    duration: 1000,
    endpoint: '/auth/login',
    description: 'Rate Limiting Tests',
  },
  authBypass: {
    payloads: [
      { Authorization: 'Bearer invalid-token' },
      { Authorization: '' },
      { 'X-Forwarded-For': '127.0.0.1' },
      { 'X-Original-URL': '/admin' },
    ],
    endpoints: ['/admin', '/users', '/orders'],
    description: 'Authentication Bypass Tests',
  },
  jsonInjection: {
    payloads: [
      { email: 'test@test.com', role: 'admin' },
      { id: 1, role: 'superuser' },
      { $where: 'this.password.match(/.*/)' },
      { constructor: { prototype: { isAdmin: true } } },
    ],
    endpoints: ['/auth/signup', '/users/profile'],
    description: 'JSON Injection Tests',
  },
};

function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url, TARGET_URL.startsWith('https') ? undefined : TARGET_URL);
    const isHttps = TARGET_URL.startsWith('https') || parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 3001),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    };

    const req = client.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body, headers: res.headers });
      });
    });

    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runSqlInjectionTests() {
  console.log('\n=== SQL Injection Tests ===');
  let vulnerabilities = 0;

  for (const endpoint of SECURITY_TESTS.sqlInjection.endpoints) {
    for (const payload of SECURITY_TESTS.sqlInjection.payloads) {
      try {
        const res = await makeRequest(`${TARGET_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { email: payload, password: 'test' },
        });

        if (res.status === 200 || res.status === 201) {
          console.log(`POTENTIAL SQLi: ${endpoint} - payload returned 200`);
          vulnerabilities++;
        }
      } catch (e) {
        // Expected for most cases
      }
    }
  }

  return { type: 'SQL Injection', vulnerabilities };
}

async function runXsstests() {
  console.log('\n=== XSS Tests ===');
  let vulnerabilities = 0;

  for (const endpoint of SECURITY_TESTS.xss.endpoints) {
    for (const payload of SECURITY_TESTS.xss.payloads) {
      const res = await makeRequest(`${TARGET_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { content: payload, comment: payload },
      });

      if (res.body && res.body.includes(payload)) {
        console.log(`POTENTIAL XSS: ${endpoint} - payload reflected in response`);
        vulnerabilities++;
      }
    }
  }

  return { type: 'XSS', vulnerabilities };
}

async function runRateLimitTests() {
  console.log('\n=== Rate Limiting Tests ===');
  const { endpoint, requests, duration } = SECURITY_TESTS.rateLimiting;
  let rateLimited = 0;

  const promises = [];
  for (let i = 0; i < requests; i++) {
    promises.push(makeRequest(`${TARGET_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: `test${i}@test.com`, password: 'wrongpass' },
    }));
  }

  const results = await Promise.all(promises);
  for (const r of results) {
    if (r.status === 429) rateLimited++;
  }

  console.log(`Rate limited responses: ${rateLimited}/${requests}`);
  return { type: 'Rate Limiting', vulnerabilities: rateLimited > 0 ? 0 : requests };
}

async function runAuthBypassTests() {
  console.log('\n=== Authentication Bypass Tests ===');
  let vulnerabilities = 0;

  for (const endpoint of SECURITY_TESTS.authBypass.endpoints) {
    for (const headers of SECURITY_TESTS.authBypass.payloads) {
      const res = await makeRequest(`${TARGET_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (res.status === 200) {
        console.log(`POTENTIAL Auth Bypass: ${endpoint} - accessed without valid auth`);
        vulnerabilities++;
      }
    }
  }

  return { type: 'Auth Bypass', vulnerabilities };
}

async function runPathTraversalTests() {
  console.log('\n=== Path Traversal Tests ===');
  let vulnerabilities = 0;

  for (const endpoint of SECURITY_TESTS.pathTraversal.endpoints) {
    for (const payload of SECURITY_TESTS.pathTraversal.payloads) {
      const res = await makeRequest(`${TARGET_URL}${endpoint}/${payload}`);

      if (res.status === 200 && (res.body.includes('root:') || res.body.includes('passwd'))) {
        console.log(`CRITICAL: Path traversal possible on ${endpoint}`);
        vulnerabilities++;
      }
    }
  }

  return { type: 'Path Traversal', vulnerabilities };
}

async function runSecuritySuite() {
  console.log('=== SPICEGARDEN SECURITY TEST SUITE ===\n');
  console.log('Running security vulnerability assessments...\n');

  const results = await Promise.all([
    runSqlInjectionTests(),
    runXsstests(),
    runRateLimitTests(),
    runAuthBypassTests(),
    runPathTraversalTests(),
  ]);

  console.log('\n=== SECURITY TEST SUMMARY ===');
  let totalVulns = 0;

  for (const result of results) {
    const status = result.vulnerabilities > 0 ? 'VULNERABLE' : 'SECURE';
    console.log(`${result.type}: ${status} (${result.vulnerabilities} issues)`);
    totalVulns += result.vulnerabilities;
  }

  console.log('============================');
  console.log(`Total vulnerabilities found: ${totalVulns}`);

  if (totalVulns > 0) {
    console.log('WARNING: System has security vulnerabilities - review immediately');
    process.exit(1);
  } else {
    console.log('All security tests passed - system appears secure');
  }
}

runSecuritySuite();