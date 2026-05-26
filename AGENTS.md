# SpiceGarden Development Commands

## Infrastructure
- `docker-compose -f compose.dev.yaml up -d` - Start dev infrastructure (Docker Desktop required)
- `docker-compose -f compose.dev.yaml down` - Stop infrastructure
- `powershell -File infra/scripts/generate-secrets.ps1` - Generate new secrets (Windows)
- `node infra/scripts/fake-orders.js` - Run fake order tests
- `node infra/scripts/breaking-point.js` - Run breaking point tests

## Backend
- `npm run dev` - Start all frontends in dev mode
- `npm run build` - Build all packages
- `npm run lint` - Lint all packages
- `cd apps/backend && npm run test` - Run backend tests
- `cd apps/backend && npm run test:unit` - Run unit tests
- `cd apps/backend && npm run dev` - Start backend with hot reload

## Testing
- `npm run test:unit` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - End-to-end tests
- `npm run test:all` - All tests combined

## Ports
- Backend: 3001
- Grafana: 3000
- Prometheus: 9090
- Alertmanager: 9093
- OpenSearch: 9200
- OpenSearch Dashboards: 5601

## Environment
- Copy `.env.example` to `.env` for local development
- Secrets stored in `./secrets/` (gitignored)