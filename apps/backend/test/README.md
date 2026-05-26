# SpiceGarden Backend Test Suite

Comprehensive testing strategy targeting 80%+ code coverage.

## Test Types

### Unit Tests (80%+ Target)
```bash
npm run test:unit
```

Services covered:
- `order.service.spec.ts` - Order placement, payment confirmation, cancellations
- `payments.service.spec.ts` - Payment intent, refunds, webhook processing
- `wallet.service.spec.ts` - Credit/debit, COD payments, fraud prevention
- `delivery.service.spec.ts` - Driver assignment, fraud detection, ETA correction
- `kitchen.service.spec.ts` - Inventory, recipes, SLA monitoring
- `auth.service.spec.ts` - Authentication, password hashing, sessions
- `notification.service.spec.ts` - Push notifications, device registration

### Integration Tests
```bash
npm run test:integration
```

Flows covered:
- `payment-order.integration.spec.ts` - Payment → Order
- `order-kds.integration.spec.ts` - Order → Kitchen Display System
- `driver-customer.integration.spec.ts` - Driver → Customer
- `refund-wallet.integration.spec.ts` - Refund → Wallet
- `delivery.integration.spec.ts` - End-to-end delivery flow

### E2E Tests
```bash
npm run test:e2e
```

Scenarios covered:
- `e2e-spec.ts` - Complete user journey: signup → order → pay → track → deliver → review

### Load Testing
```bash
# 10k users
npm run test:load

# 20k users
npm run test:load:20k

# Breaking point test
npm run test:load:breaking
```

See `load/` directory for k6 scripts.

### Chaos Testing
```bash
npm run test:chaos
```

See `chaos/` directory for Kubernetes chaos experiments.

## Coverage Report
```bash
npm run test:cov
```

Targets:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Structure

```
test/
├── unit/                  # Individual service tests
│   ├── order.service.spec.ts
│   ├── payments.service.spec.ts
│   └── ...
├── integration/           # Service integration tests
│   ├── payment-order.integration.spec.ts
│   ├── order-kds.integration.spec.ts
│   ├── driver-customer.integration.spec.ts
│   └── refund-wallet.integration.spec.ts
├── e2e-spec.ts           # End-to-end user flow
├── load/                 # k6 load testing scripts
│   ├── 10k-users.js
│   ├── 20k-users.js
│   └── breaking-point.js
└── chaos/                # Chaos engineering experiments
    ├── chaos-redis-pod-failure.yaml
    ├── chaos-postgres-pod-failure.yaml
    ├── chaos-websocket-delay.yaml
    ├── chaos-payment-timeout.yaml
    └── PLAYBOOK.md
```