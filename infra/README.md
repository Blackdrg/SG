# SpiceGarden Infrastructure

## Quick Start

```bash
# 1. Generate secrets
bash ./infra/scripts/setup-secrets.sh

# 2. Copy environment example
cp .env.example .env

# 3. Start all services
docker-compose -f compose.infra.yaml up -d

# 4. Run tests
node ./infra/scripts/fake-orders.js
node ./infra/scripts/breaking-point.js
```

## Services

| Service | Port | Purpose |
|---------|------|---------|
| Backend API | 3001 | Main application |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & queue |
| MongoDB | 27017 | Document store |
| Prometheus | 9090 | Metrics |
| Grafana | 3000 | Dashboards |
| OpenSearch | 9200 | Logging |
| OpenSearch Dashboards | 5601 | Log UI |
| Alertmanager | 9093 | Alerts |
| Sentry | 9000 | Error tracking |

## Scripts

- `setup-secrets.sh` - Generate Docker secrets
- `backup.sh` - Backup all databases
- `restore.sh` - Restore from backup
- `fake-orders.js` - Simulate order flow
- `breaking-point.js` - Breaking point tests

## Configuration

- `infra/prometheus/` - Prometheus config
- `infra/grafana/` - Grafana dashboards
- `infra/alertmanager/` - Alert routing
- `infra/filebeat/` - Log shipping
- `secrets/` - Docker secrets (gitignored)