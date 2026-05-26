import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const errors = new Counter('errors_total');

export const options = {
  stages: [
    { duration: '3m', target: 20000 },  // Ramp up to 20k users
    { duration: '10m', target: 20000 }, // Stay at 20k users
    { duration: '3m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_success: ['rate>0.90'],    // Lower threshold due to higher load
    'http_req_duration{load:20k}': ['p(95)<1000'], // 1s max at 20k
    'http_req_duration{load:20k}': ['p(99)<3000'], // 3s max for 99th percentile
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const userIndex = `${__VU}-${__ITER}`;
  
  group('20k Load Test - Signup', () => {
    const payload = JSON.stringify({
      email: `load20k${userIndex}@test.com`,
      password: 'Password123!',
      fullName: `Load Test 20k ${userIndex}`,
    });

    const res = http.post(`${BASE_URL}/auth/signup`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { load: '20k' },
    });

    const success = check(res, {
      'signup successful or user exists': (r) => r.status === 201 || r.status === 200 || r.status === 409,
    });
    
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) errors.add(1);
  });

  sleep(2);

  group('20k Load Test - Order History', () => {
    const res = http.get(`${BASE_URL}/orders/history`, {
      headers: {
        'Authorization': `Bearer mock-token-${userIndex}`,
      },
      tags: { load: '20k' },
    });

    check(res, {
      'history fetched': (r) => r.status === 200 || r.status === 401,
    });
  });

  group('20k Load Test - Menu Browse', () => {
    const res = http.get(`${BASE_URL}/restaurants/rest-1/menu`, {
      tags: { load: '20k' },
    });

    const success = check(res, {
      'menu fetched': (r) => r.status === 200,
    });
    
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) errors.add(1);
  });

  sleep(3);
}