const http = require('http');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3001;
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '10');
const ORDERS_PER_USER = parseInt(process.env.ORDERS_PER_USER || '5');

const restaurants = [
  { id: 1, name: 'Spice Garden - Downtown', menu: ['Biryani', 'Karahi', 'Naan'] },
  { id: 2, name: 'Spice Garden - Mall Road', menu: ['Burger', 'Fries', 'Shake'] },
  { id: 3, name: 'Spice Garden - Gulshan', menu: ['Pizza', 'Pasta', 'Salad'] },
];

const users = [
  { id: 'user-alpha-001', name: 'Alpha Tester' },
  { id: 'user-alpha-002', name: 'Beta Tester' },
  { id: 'user-alpha-003', name: 'Internal Friend 1' },
  { id: 'user-alpha-004', name: 'Internal Friend 2' },
  { id: 'user-alpha-005', name: 'Family Test Account' },
  { id: 'user-alpha-006', name: 'Team Member 1' },
  { id: 'user-alpha-007', name: 'Team Member 2' },
  { id: 'user-alpha-008', name: 'Team Member 3' },
  { id: 'user-alpha-009', name: 'Family Member 1' },
  { id: 'user-alpha-010', name: 'Family Member 2' },
];

function getRandomMenuItem(restaurant) {
  return restaurant.menu[Math.floor(Math.random() * restaurant.menu.length)];
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
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
        resolve({
          status: res.statusCode,
          body: body,
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function placeOrder(userId, restaurant) {
  const menuItem = getRandomMenuItem(restaurant);
  const order = {
    userId,
    restaurantId: restaurant.id,
    items: [{ name: menuItem, quantity: Math.floor(Math.random() * 3) + 1 }],
    total: Math.floor(Math.random() * 5000) + 500,
  };

  const result = await makeRequest('/api/orders', 'POST', order);
  return { userId, restaurant: restaurant.name, menuItem, status: result.status };
}

async function runUserScenario(user, workerId) {
  const scenariosCompleted = [];
  const errors = [];

  for (let i = 0; i < ORDERS_PER_USER; i++) {
    try {
      const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
      const result = await placeOrder(user.id, restaurant);
      scenariosCompleted.push(result);
      console.log(`[${workerId}] Order placed: ${user.name} -> ${restaurant.name} (${result.status})`);
      
      // Random delay between 100-500ms
      await new Promise(r => setTimeout(r, Math.random() * 400 + 100));
    } catch (error) {
      errors.push(error.message);
      console.error(`[${workerId}] Order failed: ${user.name}`, error.message);
    }
  }

  return { user: user.name, completed: scenariosCompleted.length, errors: errors.length };
}

async function runChaosScenarios() {
  console.log('=== SPICEGARDEN INTERNAL ALPHA TEST ===');
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Orders per User: ${ORDERS_PER_USER}`);
  console.log(`Target: http://${API_HOST}:${API_PORT}`);
  console.log('=========================================\n');

  // Health check first
  try {
    const health = await makeRequest('/health');
    console.log(`Health check: ${health.status}`);
  } catch (error) {
    console.error('Health check failed - is the server running?');
    process.exit(1);
  }

  // Run concurrent scenarios
  const workers = [];
  let workerId = 0;
  
  for (const user of users) {
    for (let i = 0; i < Math.ceil(CONCURRENT_USERS / users.length); i++) {
      workerId++;
      workers.push(runUserScenario(user, `Worker-${workerId}`));
    }
  }

  const results = await Promise.all(workers);
  
  // Summary
  const totalCompleted = results.reduce((sum, r) => sum + r.completed, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  
  console.log('\n=========================================');
  console.log('TEST SUMMARY');
  console.log('=========================================');
  console.log(`Total Orders Attempted: ${CONCURRENT_USERS * ORDERS_PER_USER}`);
  console.log(`Orders Completed: ${totalCompleted}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Success Rate: ${((totalCompleted / (CONCURRENT_USERS * ORDERS_PER_USER)) * 100).toFixed(1)}%`);
  console.log('=========================================');

  if (totalErrors > 0) {
    process.exit(1);
  }
}

runChaosScenarios();