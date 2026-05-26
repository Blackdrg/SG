# SpiceGarden Infrastructure

Docker-based infrastructure for Internal Alpha testing (May 2026).

## Quick Start

```bash
# 1. Generate Docker secrets
bash ./infra/scripts/setup-secrets.sh

# 2. Copy environment
cp .env.example .env

# 3. Start services
docker-compose -f compose.infra.yaml up -d

# 4. Run tests
node ./infra/scripts/fake-orders.js
node ./infra/scripts/breaking-point.js
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| **Backend API** | 3001 | Main NestJS application |
| **PostgreSQL** | 5432 | Primary database |
| **Redis** | 6379 | Cache & queue (BullMQ) |
| **MongoDB** | 27017 | Document store |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana** | 3000 | Dashboards (admin/admin) |
| **OpenSearch** | 9200 | Logging & search |
| **OpenSearch Dashboards** | 5601 | Log UI |
| **Alertmanager** | 9093 | Alert routing (Slack/PagerDuty) |
| **Sentry** | 9000 | Error tracking |

## Architecture

```
                    ┌─────────────────┐
                    │     Clients     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Backend:3001    │
                    │  (NestJS)       │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ PostgreSQL:5432│    │  Redis:6379   │    │ MongoDB:27017 │
│ (Primary DB)  │    │ (Cache/Queue) │    │ (Documents)   │
└───────────────┘    └───────────────┘    └───────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Prometheus:9090│    │   Sentry:9000 │    │ OpenSearch:9200│
│ Metrics       │    │ Errors        │    │ Logs          │
└───────────────┘    └───────────────┘    └───────────────┘
       │                                         │
       ▼                                         ▼
┌───────────────┐                       ┌───────────────┐
│ Alertmanager  │                       │ OpenSearch    │
│ :9093         │                       │ Dashboards    │
│ (Slack/      │                       │ :5601         │
│  PagerDuty)   │                       │               │
└───────────────┘                       └───────────────┘
```

## Scripts

| Script | Purpose |
|--------|---------|
| `setup-secrets.sh` | Generate 32-byte secrets for all services |
| `fake-orders.js` | Simulate 10 alpha testers placing orders |
| `breaking-point.js` | Stress test with invalid payloads (5 scenarios) |

## Configuration Files

| File | Description |
|------|-------------|
| `infra/prometheus/prometheus.yml` | Scrape targets (backend:3001) |
| `infra/prometheus/rules/alerts.yml` | Alert rules (HighErrorRate, QueueFailures, etc.) |
| `infra/grafana/dashboards/spicegarden.json` | Metrics dashboard (RPS, latency, errors) |
| `infra/alertmanager/alertmanager.yml` | Slack/PagerDuty routing |
| `infra/postgres/init.sql` | Schema + 3 test restaurants |

## Database Schema (PostgreSQL)

```sql
users (id, email, phone, password_hash, full_name, role, created_at)
restaurants (id, name, address, phone, is_active, created_at)
orders (id, user_id, restaurant_id, status, total, items, created_at)
```

**Test data:** 3 restaurants inserted on init (Downtown, Mall Road, Gulshan).

## Secrets

Generated in `./secrets/`:
- `db_password.txt` - PostgreSQL password
- `jwt_secret.txt` - JWT signing key
- `stripe_secret.txt` - Stripe API key
- `grafana_admin_password.txt` - Grafana admin
- `opensearch_admin_password.txt` - OpenSearch admin
- `sentry_secret_key.txt` - Sentry secret
- `sentry_db_password.txt` - Sentry database

All files are gitignored. Never commit secrets.

## Health Checks

```bash
# Backend
curl http://localhost:3001/health

# PostgreSQL
docker exec postgres pg_isready -U spicegarden

# Redis
docker exec redis redis-cli ping

# MongoDB
docker exec mongo mongosh --eval "db.adminCommand('ping')"
```

## Test Data

**fake-orders.js** creates orders with:
- 10 internal alpha testers (user-alpha-001 to user-alpha-010)
- 3 test restaurants (Biryani, Burger, Pizza menus)
- Random items, grandTotal: 500-5500

**breaking-point.js** tests:
- HIGH_CONCURRENCY: 50 users × 10 orders
- RAPID_ORDER_BURST: 20 users × 1 order (parallel)
- INVALID_PAYLOAD: Malformed JSON
- MISSING_FIELDS: No grandTotal
- NEGATIVE_VALUES: Negative quantities/prices

---

**Active:** May 2026 | Internal Alpha Phase