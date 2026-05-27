const net = require('net');
const { URL } = require('url');

const TARGET_HOST = process.env.TARGET_HOST || 'localhost';
const TARGET_PORT = parseInt(process.env.TARGET_PORT || '3001');

const PEN_TESTS = {
  portScan: {
    ports: [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3000, 3001, 5432, 6379, 27017, 9000],
    description: 'Open Port Scan',
  },
  headers: {
    required: [
      'strict-transport-security',
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
    ],
    description: 'Security Headers Check',
  },
  cors: {
    origins: ['http://evil.com', 'http://attacker.com', 'null'],
    description: 'CORS Misconfiguration',
  },
  methods: {
    dangerous: ['TRACE', 'TRACK', 'DEBUG', 'CONNECT', 'PUT', 'DELETE'],
    description: 'Dangerous HTTP Methods',
  },
  ssl: {
    protocols: ['SSLv2', 'SSLv3', 'TLSv1.0', 'TLSv1.1'],
    description: 'Weak SSL/TLS Protocols',
  },
};

function scanPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve({ port, open: true });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ port, open: false });
    });

    socket.on('error', () => resolve({ port, open: false }));
    socket.connect(port, TARGET_HOST);
  });
}

async function runPortScan() {
  console.log('\n=== Port Scan ===');
  const results = await Promise.all(
    PEN_TESTS.portScan.ports.map((port) => scanPort(port))
  );

  const openPorts = results.filter((r) => r.open);
  console.log(`Open ports found: ${openPorts.map((p) => p.port).join(', ') || 'none'}`);

  const dangerousOpen = openPorts.filter((p) => [5432, 6379, 27017, 9000].includes(p.port));
  if (dangerousOpen.length > 0) {
    console.log(`WARNING: Dangerous ports open: ${dangerousOpen.map((p) => p.port).join(', ')}`);
  }

  return { type: 'Port Scan', vulnerabilities: dangerousOpen.length };
}

async function checkSecurityHeaders() {
  console.log('\n=== Security Headers ===');
  const http = require('http');

  const res = await new Promise((resolve) => {
    http.get(`http://${TARGET_HOST}:${TARGET_PORT}/health`, (res) => {
      resolve(res);
    });
  });

  const headers = res.headers;
  let missing = [];

  for (const header of PEN_TESTS.headers.required) {
    if (!headers[header]) {
      missing.push(header);
    }
  }

  if (missing.length > 0) {
    console.log(`Missing security headers: ${missing.join(', ')}`);
  }

  return { type: 'Security Headers', vulnerabilities: missing.length };
}

async function checkCorsMisconfiguration() {
  console.log('\n=== CORS Misconfiguration ===');
  const http = require('http');

  let vulnerabilities = 0;

  for (const origin of PEN_TESTS.cors.origins) {
    try {
      const res = await new Promise((resolve) => {
        const req = http.request({
          hostname: TARGET_HOST,
          port: TARGET_PORT,
          path: '/health',
          method: 'OPTIONS',
          headers: { Origin: origin },
        }, (res) => resolve(res));
      });

      const corsHeader = res.headers['access-control-allow-origin'];
      if (corsHeader === '*' || corsHeader === origin) {
        console.log(`CORS allows origin: ${origin}`);
        vulnerabilities++;
      }
    } catch (e) {
      // Expected
    }
  }

  return { type: 'CORS', vulnerabilities };
}

async function checkHttpMethods() {
  console.log('\n=== HTTP Methods Check ===');
  const http = require('http');

  let vulnerabilities = 0;

  for (const method of PEN_TESTS.methods.dangerous) {
    try {
      const res = await new Promise((resolve) => {
        const req = http.request({
          hostname: TARGET_HOST,
          port: TARGET_PORT,
          path: '/health',
          method,
        }, (res) => resolve(res));
      });

      if (res.statusCode !== 405 && res.statusCode !== 501) {
        console.log(`Dangerous method ${method} allowed`);
        vulnerabilities++;
      }
    } catch (e) {
      // Expected for blocked methods
    }
  }

  return { type: 'HTTP Methods', vulnerabilities };
}

async function runPenetrationTests() {
  console.log('=== SPICEGARDEN PENETRATION TEST SUITE ===\n');
  console.log('Target:', `${TARGET_HOST}:${TARGET_PORT}`);

  const results = await Promise.all([
    runPortScan(),
    checkSecurityHeaders(),
    checkCorsMisconfiguration(),
    checkHttpMethods(),
  ]);

  console.log('\n=== PENETRATION TEST SUMMARY ===');
  let totalVulns = 0;

  for (const result of results) {
    const status = result.vulnerabilities > 0 ? 'VULNERABILITIES' : 'SECURE';
    console.log(`${result.type}: ${status} (${result.vulnerabilities} issues)`);
    totalVulns += result.vulnerabilities;
  }

  console.log('==================================');
  console.log(`Total issues found: ${totalVulns}`);

  if (totalVulns > 0) {
    console.log('WARNING: Security issues detected - review configuration');
    process.exit(1);
  } else {
    console.log('Penetration tests passed - system appears hardened');
  }
}

runPenetrationTests();