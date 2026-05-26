import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics
const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const signup_errors = new Counter('signup_errors');
const order_errors = new Counter('order_errors');
const payment_errors = new Counter('payment_errors');

// Test configuration
export const options = {
  scenarios: {
    // 10k users scenario
    low_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10000 }, // Ramp up to 10k users over 2 minutes
        { duration: '5m', target: 10000 }, // Stay at 10k users for 5 minutes
        { duration: '2m', target: 0 },    // Ramp down to 0 users over 2 minutes
      ],
      exec: 'test10kUsers',
      tags: { load: '10k' },
    },
    // 20k users scenario
    high_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 20000 }, // Ramp up to 20k users over 3 minutes
        { duration: '10m', target: 20000 }, // Stay at 20k users for 10 minutes
        { duration: '3m', target: 0 },     // Ramp down to 0 users over 3 minutes
      ],
      exec: 'test20kUsers',
      startTime: '10m', // Start after the 10k test
      tags: { load: '20k' },
    },
  },
  thresholds: {
    http_req_success: ['rate>0.95'], // 95% success rate
    http_req_duration: ['p(95)<500'], // 95% under 500ms
    'http_req_duration{load:20k}': ['p(95)<1000'], // 95% under 1s at 20k load
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function generateUser(index: number) {
  return {
    email: `loadtest${index}@example.com`,
    password: `Password${index}!`,
    fullName: `Load Test User ${index}`,
    phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  };
}

function generateOrder(index: number) {
  return {
    restaurantId: `restaurant-${(index % 10) + 1}`,
    items: [
      { itemId: `item-${(index % 5) + 1}`, quantity: 1, price: 100 + (index % 10) * 50 },
    ],
    deliveryAddressId: `address-${(index % 3) + 1}`,
    subtotal: 100 + (index % 10) * 50,
    tax: 10,
    deliveryFee: 20,
    discount: 0,
    tip: 10,
    grandTotal: 130 + (index % 10) * 50,
  };
}

export function test10kUsers() {
  const user = generateUser(__VU);
  const order = generateOrder(__VU);

  group('10k Users Test - Signup', () => {
    const res = http.post(`${BASE_URL}/auth/signup`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });

    const success = check(res, {
      'signup status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    });

    http_req_success.add(success);
    if (!success) signup_errors.add(1);
  });

  sleep(1);

  group('10k Users Test - Login', () => {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      'login status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('10k Users Test - Place and Pay Order', () => {
    // Place order
    const placeRes = http.post(`${BASE_URL}/orders`, JSON.stringify(order), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken(user.email)}`,
      },
    });

    const placeSuccess = check(placeRes, {
      'place order status is 201': (r) => r.status === 201,
    });

    http_req_success.add(placeSuccess);
    if (!placeSuccess) order_errors.add(1);

    sleep(0.5);

    // Create payment intent
    if (placeSuccess && placeRes.json('id')) {
      const paymentRes = http.post(`${BASE_URL}/payments/intent`, JSON.stringify({
        amount: order.grandTotal,
        currency: 'INR',
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken(user.email)}`,
        },
      });

      const paymentSuccess = check(paymentRes, {
        'payment intent created': (r) => r.status === 201,
      });

      http_req_success.add(paymentSuccess);
      http_req_duration.add(paymentRes.timings.duration);
      if (!paymentSuccess) payment_errors.add(1);
    }
  });

  sleep(2);
}

export function test20kUsers() {
  const user = generateUser(__VU);
  const order = generateOrder(__VU);

  group('20k Users Test - Signup', () => {
    const res = http.post(`${BASE_URL}/auth/signup`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '60s',
    });

    const success = check(res, {
      '20k signup status is 201 or 200': (r) => r.status === 201 || r.status === 200 || r.status === 409, // 409 is ok for existing users
    });

    http_req_success.add(success);
    if (!success) signup_errors.add(1);
  });

  sleep(2);

  group('20k Users Test - Login', () => {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

    check(res, {
      '20k login status is 200': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('20k Users Test - Place Order', () => {
    const placeRes = http.post(`${BASE_URL}/orders`, JSON.stringify(order), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken(user.email)}`,
      },
    });

    const placeSuccess = check(placeRes, {
      '20k place order status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    });

    http_req_success.add(placeSuccess);
    http_req_duration.add(placeRes.timings.duration);
    if (!placeSuccess) order_errors.add(1);
  });

  sleep(3);
}

function getAuthToken(email: string): string {
  // In a real test, this would be stored in a shared context
  // For simplicity, we return a mock token
  return `mock-token-for-${email}`;
}