# TODO — SpiceGarden Platform

## Phase 0 — Product Foundation & Business Architecture

- [x] 1) Create monorepo root (package.json + workspaces) and base scripts
- [x] 2) Create docs and business architecture notes
- [x] 3) Scaffold 6 major systems as empty apps/packages (README placeholders)
- [x] 4) Create shared design tokens package (colors/typography/spacing)
- [x] 5) Create backend NestJS skeleton (modules + folder structure)
- [x] 6) Create `packages/shared` with cross-platform types/constants placeholders


## Phase 1 — Backend core implementation

- [x] Initial module scaffolding (Auth, Orders, Payments, Notifications, Realtime, Analytics)
- [x] Service boundary restructuring

## Phase 2 — Enterprise backend architecture (microservices scaffolding)

- [x] 1) Add Phase 2 architecture doc: `docs/phase-2-backend-architecture.md`
- [x] 2) Restructure backend codebase under `apps/backend/src/` into gateway, services boundaries, shared contracts, infra scaffolds
- [x] 3) Add gateway module + middleware/correlation id scaffolding in `apps/backend/src/main.ts` and/or `app.module.ts`
- [x] 4) Add queue/worker scaffolding (BullMQ interface + queue name contracts)
- [x] 5) Add tracking scaffolding (Socket.IO gateway + pub/sub interface)
- [x] 6) Add observability scaffolding (Winston structured logger + correlation id)
- [x] 7) Add security scaffolding (JWT guard + RBAC role map + throttling profiles)
- [x] 8) Add shared contracts/DTO skeletons for cross-service communication
- [x] 9) Add minimal infra adapter interfaces (db/cache/search/storage)
- [x] 10) Run typecheck/build and ensure workspace scripts still work


## Phase 3 — Enterprise database architecture

- [x] 1) Add Phase 3 architecture doc: `docs/phase-3-database-architecture.md`
- [x] 2) Add DB adapter interfaces (Postgres/Mongo/Redis/Search/S3) under `apps/backend/src/db/` (Phase 2 dependency)
- [x] 3) Define indexing + partitioning + backup/failover implementation strategy (migrations + ops)
- [x] 4) Create read model strategy for tracking/order/customer views

## Phase 4 — Enterprise frontend architecture

- [x] 1) Scaffold 6 production applications (Customer Web, Customer Mobile, Delivery Partner, Restaurant Dashboard, Admin Panel, Landing Pages)
- [x] 2) Scaffold shared UI library and shared packages (hooks, types, utils)


