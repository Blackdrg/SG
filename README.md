# SpiceGarden — The Ultimate Enterprise Food Delivery Platform

SpiceGarden is a hyper-scale, production-ready food delivery ecosystem architected to support **200,000–300,000 users** with a concurrent load of up to **20,000 active sessions**.

**Current Phase:** Internal Alpha Testing (May 2026)

---

## 🏗️ Project Status

| Component | Status | Tests |
|-----------|--------|-------|
| Backend API | ✅ **Working** | 56 passing (9 suites) |
| Customer Web | ✅ **Working** | Real API integration |
| Customer Mobile | ✅ **Working** | Real API integration |
| Restaurant Dashboard | ✅ **Working** | WebSocket + fallback |
| Delivery Partner App | ✅ **Working** | Real API integration |
| Super Admin | ✅ **Working** | Live dashboards |

---

## 🗂️ Directory Map

| Path | Description |
| :--- | :--- |
| [`apps/backend`](apps/backend) | NestJS API (port 3001) |
| [`apps/customer-web`](apps/customer-web) | Next.js 14 storefront |
| [`apps/customer-mobile`](apps/customer-mobile) | React Native (Expo 51) |
| [`apps/restaurant-dashboard`](apps/restaurant-dashboard) | KDS dashboard |
| [`apps/delivery-partner`](apps/delivery-partner) | Driver app (React Native) |
| [`apps/super-admin`](apps/super-admin) | Admin panel |
| [`packages/ui`](packages/ui) | Design tokens (colors, spacing, typography) |
| [`packages/shared`](packages/shared) | Types & API client |
| [`infra/`](infra) | Docker infrastructure |

---

## 🧪 Test Results

```
Test Suites: 9 passed, 9 total
Tests:       56 passed, 56 total
```

Run with: `npm run test -w @spicegarden/backend`

---

## 🎯 Technical KPIs

| Metric | Target (Alpha) |
| :--- | :--- |
| **Concurrent Users** | 50 |
| **Orders** | 500 max |
| **API Latency** | < 300ms |
| **Order Confirmation** | < 2s |
| **Availability** | 99.9% |

---

## 🧠 Backend Architecture

**Framework:** NestJS 10 (TypeScript, CommonJS)

### Core Modules
| Module | Purpose |
| :----- | :------------- |
| `AuthService` | JWT auth, Argon2 hashing, RBAC |
| `OrderService` | 9-step order lifecycle |
| `PaymentService` | Stripe + webhooks |
| `RealtimeService` | Socket.IO gateways |
| `MetricsModule` | Prometheus observability |

### Order States
```
PLACED → PAYMENT_CONFIRMED → RESTAURANT_ACCEPTED → PREPARING → 
READY → DRIVER_ASSIGNED → PICKED_UP → ON_THE_WAY → DELIVERED
```

### Security
- Password Hashing: Argon2
- Encryption: AES-256 (field-level for PII)
- RBAC: 8+ roles
- Rate Limiting: Throttler (10 req/60s default)

---

## 💾 Database

| Database | Port | Usage |
| :--- | :--- | :--- |
| **PostgreSQL** | 5432 | Primary (orders, users) |
| **MongoDB** | 27017 | Documents (reviews, logs) |
| **Redis** | 6379 | Cache, sessions, queues |
| **OpenSearch** | 9200 | Logging & search |

Init script: `infra/postgres/init.sql` creates tables and test data (3 restaurants).

---

## 🚀 Quick Start

```bash
# 1. Generate secrets
bash ./infra/scripts/setup-secrets.sh

# 2. Copy env file
cp .env.example .env

# 3. Start infrastructure
docker-compose -f compose.infra.yaml up -d

# 4. Run backend
npm run dev -w @spicegarden/backend

# 5. Test endpoints
node ./infra/scripts/fake-orders.js
node ./infra/scripts/breaking-point.js
```

### Environment Variables (.env)

```bash
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=spicegarden
DB_PASS=spicegarden
DB_NAME=spicegarden
MONGO_URI=mongodb://localhost:27017/spicegarden
REDIS_HOST=redis
JWT_SECRET=secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_placeholder
SENTRY_DSN=http://localhost:9000/1
```

---

## 🐳 Infrastructure (Docker Compose)

| Service | Port | Status |
|---------|------|--------|
| Backend API | 3001 | Primary |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache/Queue |
| MongoDB | 27017 | Documents |
| Prometheus | 9090 | Metrics |
| Grafana | 3000 | Dashboards |
| OpenSearch | 9200 | Logging |
| Alertmanager | 9093 | Alerts |
| Sentry | 9000 | Errors |

**Health endpoint:** `GET http://localhost:3001/health`

---

## 🧪 Testing Scripts

### Fake Orders (`infra/scripts/fake-orders.js`)
- Simulates Internal Alpha testers (10 users)
- Places orders via REST API
- Variables: `API_HOST`, `API_PORT`, `CONCURRENT_USERS`, `ORDERS_PER_USER`

### Breaking Point (`infra/scripts/breaking-point.js`)
- HIGH_CONCURRENCY (50 users × 10 orders)
- RAPID_ORDER_BURST (parallel orders)
- INVALID_PAYLOAD (malformed JSON)
- MISSING_FIELDS (incomplete orders)
- NEGATIVE_VALUES (negative amounts)

---

## 📊 Monitoring

### Prometheus Metrics
- `http_request_duration_seconds` - Latency
- `http_request_duration_seconds_count` - Request rate
- `queue_failures_total` - Queue errors
- `payment_failures_total` - Payment errors
- `order_total` - Order counts

### Alerts (`infra/prometheus/rules/alerts.yml`)
- HighErrorRate: > 5% 5xx errors
- HighLatency: 95th percentile > 1s
- DatabaseDown: Backend unresponsive
- QueueFailures: Job processing issues
- PaymentFailures: > 5 failures

---

## 🎨 Design System

**Tokens:** `packages/ui/tokens.ts`

### Colors
- Primary: `#f04e31` (Appetite orange)
- Secondary: `#1a1a1a` (Dark)
- Success: `#4caf50`, Danger: `#f44336`, Warning: `#ff9800`

### Spacing
- `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`

### Typography
- Font: Inter, sans-serif
- Motion: 200ms (micro), 350ms (standard), 500ms (page)

---

## 📱 Frontend

All frontends have **real API integration** with fallback mock data when backend unavailable.

### Customer Web (`apps/customer-web`)
- **Framework:** Next.js 14.2.3
- **API:** `restaurantsApi.list()` → `/restaurants` (falls back to 3 test restaurants)
- **Deps:** React 18, Redux Toolkit, React Query, Socket.IO client
- **Status:** ✅ Real API integration

### Customer Mobile (`apps/customer-mobile`)
- **Framework:** React Native (Expo 51)
- **API:** Shared API client with backend connection
- **Screens:** Home, Cart, History, Tracking, OrderDetails
- **Status:** ✅ Real API integration

### Restaurant Dashboard (`apps/restaurant-dashboard`)
- **Framework:** Next.js 14.2.3
- **API:** Socket.IO for real-time order updates
- **Deps:** Recharts (charts), Socket.IO client
- **Status:** ✅ Real API + WebSocket integration

### Delivery Partner (`apps/delivery-partner`)
- **Framework:** React Native (Expo 51)
- **API:** Shared API client
- **Deps:** Socket.IO client
- **Status:** ✅ Real API integration

### Super Admin (`apps/super-admin`)
- **Framework:** Next.js 14.2.3
- **API:** `/admin/stats`, `/api/orders`, Socket.IO
- **Deps:** Recharts (dashboards), Socket.IO client
- **Status:** ✅ Real API + WebSocket integration

---

## 🛠️ Development

```bash
# Backend
npm run dev -w @spicegarden/backend    # Start dev server
npm run build -w @spicegarden/backend  # Production build
npm run test -w @spicegarden/backend    # Run tests (56 passing)

# Frontend (any)
npm run dev -w @spicegarden/customer-web

# Docker
docker-compose -f compose.infra.yaml up -d
docker-compose -f compose.infra.yaml logs -f spicegarden
```

---

## 📅 Development Status

### Completed
- ✅ Backend modular architecture (NestJS 10)
- ✅ All 56 tests passing (9 suites)
- ✅ Docker infrastructure (10 services)
- ✅ Prometheus + Grafana monitoring
- ✅ Health check endpoint (`/health`)
- ✅ Design tokens & shared types
- ✅ All frontend apps with real API integration
- ✅ Admin endpoints for live dashboards

### Next
- Configure real Stripe keys
- Implement FCM/Twilio notifications
- Add PostGIS for geo queries
- Real-time driver location tracking

---

## 🔍 Diagnostic Reference

### Database Entities (PostgreSQL)

| Entity | File | Fields |
|--------|------|--------|
| `UserEntity` | `apps/backend/src/db/entities/user.entity.ts` | id, email, phone, passwordHash, role, status |
| `RestaurantEntity` | `apps/backend/src/db/entities/restaurant.entity.ts` | id, name, slug, description, status, branches |
| `RestaurantBranchEntity` | `apps/backend/src/db/entities/restaurant-branch.entity.ts` | id, branchName, address, location (point), isOnline |
| `OrderEntity` | `apps/backend/src/db/entities/order.entity.ts` | id, userId, restaurantId, status, grandTotal, items |
| `DriverEntity` | `apps/backend/src/db/entities/driver.entity.ts` | id, userId, vehicleDetails, rating, isOnline |
| `SessionEntity` | `apps/backend/src/db/entities/session.entity.ts` | id, userId, deviceName, deviceType, ipAddress, refreshToken, expiresAt, isActive |
| `AuditLogEntity` | `apps/backend/src/db/entities/audit-log.entity.ts` | id, action, performedBy, entityType, entityId, metadata, ipAddress, timestamp |

### Backend Endpoints (Diagnostic)

| Endpoint | File | Returns |
|----------|------|---------|
| `GET /health` | `apps/backend/src/app.controller.ts:13` | `{status: 'ok', timestamp: ISO}` |
| `GET /metrics` | `apps/backend/src/main.ts:29` | Prometheus text format |
| `POST /api/orders` | `apps/backend/src/services/order/order.controller.ts:12` | Order response from DB |
| `GET /restaurants` | `apps/backend/src/services/restaurant/restaurant.controller.ts:12` | Restaurant list (or fallback) |
| `GET /admin/stats` | `apps/backend/src/services/admin/admin.controller.ts:19` | Dashboard stats + revenue data |
| `POST /auth/login` | `apps/backend/src/services/auth/auth.controller.ts:16` | JWT tokens |
| `POST /auth/register` | `apps/backend/src/services/auth/auth.controller.ts:32` | JWT tokens |

### Frontend API Integration

| App | API Import | Endpoint Used |
|-----|------------|---------------|
| Customer Web | `packages/shared/api.ts:44` | `/restaurants` |
| Super Admin | `packages/shared/api.ts:56` | `/orders`, `/admin/stats` |
| Restaurant Dashboard | Socket.IO | Real-time `newOrder` events |
| Delivery Partner | Socket.IO | Real-time updates |
| Customer Mobile | `packages/shared/api.ts` | All endpoints (fallback to mock) |

### Configuration Files

| File | Purpose |
|------|---------|
| `.env.example` | All env vars with defaults |
| `compose.infra.yaml` | Docker Compose (10 services) |
| `Dockerfile` | Multi-stage Node.js 20 build |
| `infra/prometheus/prometheus.yml` | Scrape `spicegarden:3001` |
| `infra/prometheus/rules/alerts.yml` | 5 alert rules (errors, latency) |
| `infra/grafana/dashboards/spicegarden.json` | 8-panel dashboard |
| `packages/shared/constants.ts` | API_URL = localhost:3001 |
| `packages/ui/tokens.ts` | Colors, spacing, typography |

---

## 📱 Frontend Screens

### Customer Web (`apps/customer-web/src/pages/`)
| Screen | File | API |
|--------|------|-----|
| Home | `index.tsx` | `/restaurants` |
| Search | `search.tsx` | `/restaurants/search` |
| Restaurant | `restaurant.tsx` | `/restaurants/:id` |
| Cart | `cart.tsx` | Local state |
| Checkout | `checkout.tsx` | `/api/orders` |
| Tracking | `tracking.tsx` | `/orders/:id/track` |
| History | `history.tsx` | `/orders` |
| Profile | `profile.tsx` | `/auth/me` |

### Customer Mobile (`apps/customer-mobile/src/screens/`)
| Screen | File | Lines | API |
|--------|------|-------|-----|
| Auth | `AuthScreen.tsx` | - | `/auth/login`, `/auth/register` |
| Home | `HomeScreen.tsx` | 332 | `/restaurants` (mock fallback) |
| Search | `SearchScreen.tsx` | - | `/restaurants/search` |
| Restaurant | `RestaurantScreen.tsx` | - | `/restaurants/:id/menu` |
| Cart | `CartScreen.tsx` | 351 | Local state |
| Checkout | `CheckoutScreen.tsx` | - | `/api/orders` |
| Tracking | `TrackingScreen.tsx` | 407 | Socket.IO or `/orders/:id/track` |
| Profile | `ProfileScreen.tsx` | - | `/auth/me` |

### Restaurant Dashboard (`apps/restaurant-dashboard/src/pages/`)
| Screen | File | Features |
|--------|------| ----- |
| Dashboard | `index.tsx` | KDS, Inventory, 6 order states |

### Super Admin (`apps/super-admin/src/pages/`)
| Screen | File | Features |
|--------|------| ----- |
| Dashboard | `index.tsx` | Overview, Orders, Branches, Support tabs |

### Test Files (Diagnostic)

| Test File | Tests | Purpose |
|-----------|-------|---------|
| `apps/backend/test/e2e.spec.ts` | 16 | Full order flow |
| `apps/backend/test/order.service.spec.ts` | 8 | Order validation |
| `apps/backend/test/delivery.service.spec.ts` | 5 | Driver services |
| `apps/backend/test/kitchen.service.spec.ts` | 5 | KDS workflow |
| `apps/backend/test/payment-order.integration.spec.ts` | 4 | Payment flow |
| `apps/backend/test/order-kds.integration.spec.ts` | 6 | KDS integration |
| `apps/backend/test/driver-customer.integration.spec.ts` | 4 | Matching |
| `apps/backend/test/refund-wallet.integration.spec.ts` | 4 | Refunds |
| `apps/backend/test/delivery.integration.spec.ts` | 4 | Delivery flow |

---

## 🔧 Configuration Reference

### Next.js Apps (`next.config.js`)
| App | Config | Packages |
|-----|--------|----------|
| Customer Web | `apps/customer-web/next.config.js` | @spicegarden/ui transpile |
| Super Admin | `apps/super-admin/next.config.js` | @spicegarden/ui transpile |
| Restaurant Dashboard | `apps/restaurant-dashboard/next.config.js` | @spicegarden/ui transpile |

### Backend Services (Diagnostic)
| Service | File | Methods |
|---------|------|---------|
| ComplianceService | `apps/backend/src/compliance/compliance.service.ts` | applyDataRetentionPolicies, shouldRetainUserData, deleteUserData, exportUserData, getRetentionStatistics |
| AuditService | `apps/backend/src/audit/audit.service.ts` | logAction, queryLogs |
| EncryptionService | `apps/backend/src/security/encryption.service.ts` | encrypt, decrypt, encryptPiiFields, decryptPiiFields |

---

## 🔗 API Endpoints

```
GET  /health              - Health check
GET  /metrics             - Prometheus metrics
POST /api/orders          - Create order (body: userId, restaurantId, grandTotal)
GET  /api/orders          - List orders
GET  /api/orders/:id      - Get order by ID
POST /api/payments/webhook - Stripe webhook handler
POST /auth/login          - User login (body: email, password)
POST /auth/register       - User registration (body: fullName, email, phone, password)
GET  /restaurants         - List all restaurants
GET  /restaurants/:id     - Get restaurant by ID
GET  /restaurants/search   - Search restaurants (query: q)
GET  /admin/stats         - Dashboard stats (dashboard + branches + tickets)
POST /admin/users/ban     - Ban user (body: userId, reason)
```

---

## 🧪 Test Configuration

### Backend Tests (`apps/backend/package.json`)
| Script | Command |
|--------|---------|
| `test` | `jest` (all tests) |
| `test:watch` | `jest --watch` |
| `test:cov` | `jest --coverage` (80% threshold) |
| `test:unit` | `order/*.service.spec, kitchen.service.spec` |
| `test:integration` | `*.integration.spec.ts` |
| `test:e2e` | `e2e.spec.ts` |
| `test:load` | `k6 run test/load/10k-users.js` |

### Customer Web Tests (`apps/customer-web/jest.config.js`)
| Config | Value |
|--------|-------|
| `testEnvironment` | `jest-environment-jsdom` |
| `setupFilesAfterEnv` | `jest.setup.js` |
| `transpilePackages` | `@spicegarden/ui` |

---

© 2026 SpiceGarden. All rights reserved.