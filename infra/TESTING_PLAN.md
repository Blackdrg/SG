# Internal Alpha Testing Plan - Phase I

## Overview
Break system. Fix everything. Test with friends, family, team.

## Test Matrix

| Category | Test Type | Tool | Target | Success Criteria |
|----------|-----------|------|--------|------------------|
| **Functional** | Order Placement | fake-orders.js | 50 orders | 95% success |
| **Functional** | Order Tracking | manual | real-time | Updates within 2s |
| **Functional** | Payments | manual | 20 payments | All succeed |
| **Performance** | Concurrent Users | breaking-point.js | 50 users | <5% error rate |
| **Reliability** | Chaos | chaos-mesh | Redis/Postgres | Graceful degradation |
| **Observability** | Logs | filebeat | all services | Indexed in OpenSearch |
| **Observability** | Metrics | prometheus | all services | Data flowing |
| **Observability** | Alerts | alertmanager | critical paths | Slack notification |
| **Observability** | Errors | sentry | error paths | Captured with context |

## Test Groups

### Group 1: Friends (2-3 users)
- Simple order flow
- Menu browsing
- Basic tracking
- Report any UI issues

### Group 2: Family (3-4 users)  
- Multiple orders per user
- Wallet top-up
- Order history
- Delivery feedback

### Group 3: Team (5-6 users)
- Breaking point scenarios
- Concurrent chaos
- Performance testing
- Monitoring verification

## Breaking Scenarios

1. **Redis Down** - Cache unavailable
2. **PostgreSQL Down** - Database unavailable  
3. **High Concurrency** - 50 simultaneous orders
4. **Invalid Payloads** - Malformed requests
5. **Payment Timeout** - Stripe unreachable
6. **Network Delay** - WebSocket latency

## Run Tests

```bash
# Start infrastructure
docker-compose -f compose.infra.yaml up -d

# Functional test
node infra/scripts/fake-orders.js

# Breaking point test
node infra/scripts/breaking-point.js

# Monitor
open http://localhost:3000  # Grafana
open http://localhost:9090  # Prometheus
open http://localhost:5601  # OpenSearch Dashboards
open http://localhost:9000  # Sentry

# Backup
bash infra/scripts/backup.sh
```

## Success Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Order Success Rate | >95% | <90% |
| API Latency (95th %) | <500ms | >1000ms |
| Error Rate | <1% | >5% |
| Recovery Time | <30s | >60s |