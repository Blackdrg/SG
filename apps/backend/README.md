# SpiceGarden Backend

NestJS 10 API (TypeScript, CommonJS) on port 3001 for Internal Alpha testing.

## Test Results

```
Test Suites: 9 passed, 9 total
Tests:       56 passed, 56 total
```

## Development

```bash
npm run dev -w @spicegarden/backend    # Start dev server (watch mode)
npm run build -w @spicegarden/backend  # Production build
npm run test -w @spicegarden/backend   # Run tests
```

## Architecture

### Module Structure
```
src/
├── app.module.ts       # Root module
├── app.controller.ts   # Health endpoint
├── main.ts             # Bootstrap (Sentry, Metrics)
├── services/
│   ├── auth/           # JWT auth (unstable - mock user)
│   ├── order/          # Order lifecycle (working)
│   ├── payments/       # Stripe integration (unstable)
│   ├── restaurant/     # Restaurant search (working - fallback)
│   ├── delivery/       # Driver services (working)
│   └── admin/          # Admin endpoints (working)
├── modules/
│   ├── kitchen/        # KDS workflows (working)
│   └── driver-assignment/ # Dispatch engine (working)
├── metrics/           # Prometheus service
├── security/          # Encryption (AES-256)
├── audit/             # Audit logging
└── compliance/        # Data retention
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /metrics | Prometheus metrics |
| POST | /api/orders | Create order |
| GET | /api/orders | List orders |
| GET | /restaurants | List all restaurants |
| GET | /admin/stats | Dashboard stats |

## Key Changes (May 2026)

- `restaurant.service.ts` - Fallback for PostGIS queries
- `packages/shared/api.ts` - Fallback mock data for frontends
- `admin.controller.ts` - No auth guards (alpha testing)
- `order.controller.ts` - No auth guards (alpha testing)

## Dependencies

| Package | Version |
|---------|---------|
| @nestjs/core | ^10.0.0 |
| typeorm | ^0.3.17 |
| stripe | ^15.0.0 |
| prom-client | ^15.0.0 |
| socket.io | ^4.7.0 |
| argon2 | ^0.40.0 |
| jest | ^29.5.0 |