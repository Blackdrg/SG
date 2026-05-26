# Phase I - Internal Alpha Testing

## Goal
Break the system. Fix everything.

## Test Groups

### 1. Friends (2-3 users)
- Focus: Basic functionality
- Test: Place orders, track orders, basic navigation

### 2. Family (3-4 users)  
- Focus: Real-world usage patterns
- Test: Multiple orders, wallet transactions, order history

### 3. Team (5-6 users)
- Focus: Breaking point scenarios
- Test: Concurrent orders, edge cases, failure recovery

## Breaking Point Tests

| Scenario | Target | Success Criteria |
|----------|--------|----------------|
| High Concurrency | 50 concurrent users | < 5% error rate |
| Payload Fuzzing | Invalid payloads | Graceful error handling |
| Missing Fields | Incomplete orders | Validation errors only |
| Negative Values | Negative amounts | Rejected with clear error |
| Network Partition | Redis down | Orders still process |
| Database Failover | Postgres down | Writes buffered, no data loss |
| Payment Timeout | Stripe unavailable | Pending state, retry |

## Monitoring Endpoints

- **Metrics**: http://localhost:9090/metrics
- **Grafana**: http://localhost:3000 (admin/grafana_admin_password.txt)
- **Alerts**: http://localhost:9093
- **Logs**: http://localhost:5601
- **Sentry**: http://localhost:9000

## Quick Start

```bash
# 1. Generate secrets
bash ./infra/scripts/setup-secrets.sh

# 2. Start infrastructure
docker-compose -f compose.infra.yaml up -d

# 3. Run fake orders test
node ./infra/scripts/fake-orders.js

# 4. Run breaking point test
node ./infra/scripts/breaking-point.js

# 5. Create backup
bash ./infra/scripts/backup.sh
```

## Test Scripts

- `fake-orders.js` - Simulates real user order flow
- `breaking-point.js` - Attempts to break the system
- `chaos/*.yaml` - Kubernetes chaos experiments