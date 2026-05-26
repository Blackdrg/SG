import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const http_req_success = new Rate('http_req_success');
const http_req_duration = new Trend('http_req_duration');
const errors = new Counter('errors_total');

export const options = {
  stages: [
    // Ramp up aggressively to find breaking point
    { duration: '1m', target: 5000 },   // 5k users
    { duration: '1m', target: 10000 },  // 10k users
    { duration: '1m', target: 15000 },  // 15k users
    { duration: '2m', target: 20000 },  // 20k users
    { duration: '2m', target: 25000 },  // 25k users - pushing limits
    { duration: '2m', target: 30000 },  // 30k users - likely breaking point
    { duration: '2m', target: 35000 },  // 35k users - stress test
    { duration: '1m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_success: ['rate>0.85'],     // 85% threshold at breaking point
    'http_req_duration{load:stress}': ['p(95)<2000'], // 2s max under stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function() {
  const userIndex = `${__VU}-${__ITER}`;
  
  group('Breaking Point Test - Quick Signup', () => {
    const res = http.post(`${BASE_URL}/auth/signup`, JSON.stringify({
      email: `stress${userIndex}@test.com`,
      password: 'Password123!',
      fullName: `Stress ${userIndex}`,
    }), {
      headers: { 'Content-Type': 'application/json' },
      tags: { load: 'stress' },
    });

    const success = check(res, {
      'request handled': (r) => r.status < 500, // Any response other than server error is OK
    });
    
    http_req_success.add(success);
    http_req_duration.add(res.timings.duration);
    if (!success) errors.add(1);
  });

  sleep(0.5);

  group('Breaking Point Test - List Restaurants', () => {
    const res = http.get(`${BASE_URL}/restaurants`, {
      tags: { load: 'stress' },
    });

    check(res, {
      'response received': (r) => r.status < 500,
    });
  });

  group('Breaking Point Test - Place Order', () => {
    const res = http.post(`${BASE_URL}/orders`, JSON.stringify({
      restaurantId: 'rest-1',
      items: [{ itemId: 'item-1', quantity: 1, price: 100 }],
      grandTotal: 120,
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer mock-token-${userIndex}`,
      },
      tags: { load: 'stress' },
    });

    check(res, {
      'request handled': (r) => r.status < 500,
    });
  });

  sleep(1);
}