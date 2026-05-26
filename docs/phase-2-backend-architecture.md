# PHASE 2 — Enterprise Backend Architecture (Scalable Backend for 200k–300k users)

## 1) Objectives & non-negotiables
Target scale and reliability:
- Users: 200,000–300,000
- Concurrent: 10,000–20,000
- Peak load: 5,000–8,000 orders/hour
- Availability: 99.9%
- Downtime: near zero
- API latency: < 300ms average
- Order confirmation: < 2 seconds
- Live tracking delay: < 3 seconds

Non-negotiables:
- Modular microservice boundaries (even if deployed as one Nest runtime early)
- Event-driven workflows for reliability (no order loss)
- Observability (structured logs + correlation IDs)
- Security baseline (JWT, refresh tokens, RBAC, throttling)
- Failure recovery workflows (compensation/reassignment/retries)

## 2) Architecture approach (modular microservices)
### 2.1 Runtime model
Because this repo currently contains a NestJS skeleton with empty modules, Phase 2 starts with **scaffolding**:
- Code is organized by service boundaries (microservice-like folders)
- A single Nest runtime can be used initially (to ship faster)
- Later, services can be deployed independently without changing contracts

### 2.2 Service boundaries
Service boundaries (implemented as folders/modules inside `apps/backend/src/services/*`):
- auth-service
- order-service
- payment-service
- tracking-service
- restaurant-service
- delivery-service
- analytics-service
- support-service
- notification-service
- coupon-service
- subscription-service
- search-service
- recommendation-service
- inventory-service

## 3) API entry (Gateway)
A gateway provides:
- single entry point for all clients
- authentication validation
- request rate limiting
- caching hooks
- centralized logging
- routing to domain handlers (internally for now)

Suggested placement:
- `apps/backend/src/gateway/*`

## 4) Reliability core (Redis Queue)
Use BullMQ + Redis for background processing:
- Order lifecycle transitions
- driver assignment scoring
- notifications outbox
- refunds processing
- analytics event ingestion

Queue naming contracts should live in shared constants, e.g.:
- `apps/backend/src/shared/contracts/queues/*`

## 5) Order lifecycle engine
`order-service` owns the canonical order lifecycle state machine:
- PLACED
- PAYMENT_CONFIRMED
- RESTAURANT_ACCEPTED
- PREPARING
- READY
- DRIVER_ASSIGNED
- PICKED_UP
- ON_THE_WAY
- DELIVERED

Key enterprise requirements:
- Idempotent transitions
- Retry and dead-letter patterns
- Compensation workflows when downstream steps fail

## 6) Live tracking
tracking-service provides real-time updates:
- Socket.IO WebSocket gateway for customers
- Driver location ingestion endpoint
- Redis pub/sub or stream interface for fanout
- DB throttling/batching so tracking does not overload primary DB

## 7) Search & recommendation
- search-service uses Elasticsearch (index mapping planning + query contracts)
- recommendation-service uses async event pipelines (future Python engine)

## 8) Notifications
notification-service:
- in-app + push + SMS + email (via integrations)
- outbox pattern to avoid losing notification intent
- triggers from order/payment/tracking events

## 9) Customer support & refunds
support-service owns:
- tickets + escalation
- refund/dispute processing workflows
- refund eligibility rules (late/delay thresholds)

## 10) Data architecture (polyglot + read models)
Use multiple datastore types with read model separation:
- PostgreSQL: orders, users, payments (relational)
- MongoDB: chat, reviews, activity logs (document)
- Redis: cache, sessions, tracking cache, queues
- Elasticsearch: search indices
- S3: images, receipts

Implement adapters/interfaces first, then plug real providers later.

## 11) Observability
- Structured JSON logging (Winston)
- correlation IDs end-to-end
- metrics scaffolding (request latency, error rates)
- event logging for lifecycle transitions + tracking throughput

## 12) Security baseline
- JWT access token (short TTL), refresh token (long TTL)
- HTTP-only cookie storage strategy scaffold
- RBAC roles:
  - Customer, Restaurant, Kitchen Staff, Delivery Partner, Admin, Super Admin, Support Staff, Finance Staff
- Throttling profiles:
  - OTP, login, payment attempts, search abuse

## 13) Phase 2 deliverables (repo-level)
Create/introduce:
1. `docs/phase-2-backend-architecture.md` (this file)
2. Gateway scaffolding under `apps/backend/src/gateway/`
3. Service boundary folders under `apps/backend/src/services/`
4. Shared contracts under `apps/backend/src/shared/contracts/`
5. Infra scaffolds under `apps/backend/src/infra/`:
   - queue
   - observability
   - tracking pub/sub interface
6. Security scaffolds under `apps/backend/src/security/`
7. Minimal adapter interfaces under `apps/backend/src/db/` and `apps/backend/src/search/`

## 14) Suggested next implementation order (vertical slice)
1) Gateway + JWT scaffolding
2) Order placed → enqueue lifecycle event
3) Payment webhook stub → transition PAYMENT_CONFIRMED
4) Worker consumes lifecycle transitions
5) Tracking gateway stub → publish updates interface


