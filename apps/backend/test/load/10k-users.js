import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const errors = new Counter('errors_total');

export const options = {
  stages: [
    { duration: '2m', target: 10000 },  // Ramp up to 10k users
    { duration: '5m', target: 10000 },  // Stay at 10k users
    { duration: '2m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_success: ['rate>0.95'],
    http_req_duration: ['p(95)<500'],
    'http_req_duration{type:api}': ['p(95)<300'],
    'http_req_duration{type:auth}': ['p(95)<200'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const userIndex = `${__VU}-${__ITER}`;
  
  group('Load Test - Signup', () => {
    const payload = JSON.stringify({
      email: `load${userIndex}@test.com`,
      password: 'Password123!',
      fullName: `Load Test ${userIndex}`,
    });

    const res = http.post(`${BASE_URL}/auth/signup`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'auth' },
    });

    const success = check(res, {
      'signup successful or user exists': (r) => r.status === 201 || r.status === 200 || r.status === 409,
    });
    
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) errors.add(1);
  });

  sleep(1);

  group('Load Test - Login', () => {
    const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: `load${userIndex}@test.com`,
      password: 'Password123!',
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { type: 'auth' },
    });

    check(res, {
      'login successful': (r) => r.status === 200,
    });
  });

  sleep(1);

  group('Load Test - Place Order', () => {
    const orderPayload = JSON.stringify({
      restaurantId: 'rest-1',
      items: [{ itemId: 'item-1', quantity: 2, price: 150 }],
      deliveryAddressId: 'addr-1',
      grandTotal: 320,
      subtotal: 300,
      tax: 20,
    });

    const res = http.post(`${BASE_URL}/orders`, orderPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer mock-token-${userIndex}`,
      },
      tags: { type: 'api' },
    });

    const success = check(res, {
      'order placed': (r) => r.status === 201,
    });
    
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) errors.add(1);
  });

  sleep(2);
}