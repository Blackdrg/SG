const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3001;

// Breaking-point scenarios focused on Phase I Internal Alpha
const SCENARIOS = {
  HIGH_CONCURRENCY: {
    users: 50,
    ordersPerUser: 10,
    description: 'High concurrency order placement',
  },
  RAPID_ORDER_BURST: {
    users: 20,
    ordersPerUser: 1,
    parallel: true,
    description: 'All users place order simultaneously',
  },
  INVALID_PAYLOAD: {
    users: 10,
    ordersPerUser: 5,
    malformed: true,
    description: 'Malformed order payloads',
  },
  MISSING_FIELDS: {
    users: 10,
    ordersPerUser: 5,
    incomplete: true,
    description: 'Orders with missing required fields',
  },
  NEGATIVE_VALUES: {
    users: 10,
    ordersPerUser: 5,
    negative: true,
    description: 'Orders with negative quantities/prices',
  },
};

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 0, error: e.message });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function generateBreakingOrder(scenario, index) {
  const base = {
    userId: `breaker-${index}`,
    restaurantId: Math.floor(Math.random() * 3) + 1,
    items: [],
    grandTotal: 0,
  };

  if (scenario === 'INVALID_PAYLOAD') {
    // Completely invalid JSON structure
    return { invalid: true, data: 'not an object', random: () => {} };
  }

  if (scenario === 'MISSING_FIELDS') {
    // Missing grandTotal
    delete base.grandTotal;
    base.items = [{ name: 'Test Item', quantity: 1 }];
    return base;
  }

  if (scenario === 'NEGATIVE') {
    base.items = [{ name: 'Test Item', quantity: -5 }];
    base.grandTotal = -1000;
    return base;
  }

  // Normal order
  base.items = [{ name: 'Menu Item', quantity: Math.floor(Math.random() * 5) + 1 }];
  base.grandTotal = Math.floor(Math.random() * 5000) + 500;
  return base;
}

async function runBreakingTest(scenarioName, config) {
  console.log(`\n=== RUNNING: ${config.description} ===`);
  console.log(`Users: ${config.users}, Orders each: ${config.ordersPerUser}`);

  const tasks = [];
  let completed = 0;
  let errors = 0;
  let serverErrors = 0;

  for (let u = 0; u < config.users; u++) {
    for (let o = 0; o < config.ordersPerUser; o++) {
      const order = generateBreakingOrder(
        scenarioName.replace(/_/g, ''),
        `${u}-${o}`
      );

      const task = makeRequest('/api/orders', 'POST', order)
        .then((result) => {
          if (result.status >= 500) serverErrors++;
          if (result.error || result.status >= 400) errors++;
          else completed++;
        });

      if (config.parallel) {
        tasks.push(task);
      } else {
        await task;
      }
    }

    if (!config.parallel && config.users > 1) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  if (config.parallel) {
    await Promise.all(tasks);
  }

  const total = config.users * config.ordersPerUser;
  console.log(`Completed: ${completed}/${total}`);
  console.log(`Client Errors: ${errors - serverErrors}/${total}`);
  console.log(`Server Errors (5xx): ${serverErrors}/${total}`);

  return { scenario: scenarioName, completed, total, serverErrors };
}

async function runBreakingTestSuite() {
  console.log('=== SPICEGARDEN BREAKING POINT TEST SUITE ===\n');
  console.log('This test suite attempts to break the system through:');
  console.log('- High concurrency');
  console.log('- Malformed payloads');
  console.log('- Invalid data structures');
  console.log('==========================================\n');

  // Health check
  const health = await makeRequest('/health');
  if (health.status !== 200) {
    console.error('System not healthy - aborting');
    process.exit(1);
  }
  console.log('Health check passed\n');

  const results = [];

  for (const [name, config] of Object.entries(SCENARIOS)) {
    const result = await runBreakingTest(name, config);
    results.push(result);
    
    // Wait between scenarios
    await new Promise(r => setTimeout(r, 2000));
  }

  // Final summary
  console.log('\n==========================================');
  console.log('BREAKING POINT TEST SUMMARY');
  console.log('==========================================');

  let allPassed = true;
  for (const r of results) {
    const passRate = (r.completed / r.total) * 100;
    const status = r.serverErrors === 0 && passRate > 50 ? 'PASS' : 'FAIL';
    if (status === 'FAIL') allPassed = false;
    console.log(`${r.scenario}: ${status} (${passRate.toFixed(1)}% success, ${r.serverErrors} server errors)`);
  }

  console.log('==========================================');
  
  if (!allPassed) {
    console.log('SYSTEM VULNERABLE TO TESTED SCENARIOS');
    process.exit(1);
  } else {
    console.log('SYSTEM WITHSTOOD BREAKING POINT TESTS');
  }
}

runBreakingTestSuite();