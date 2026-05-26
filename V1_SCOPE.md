# V1 Scope - Frozen

> **Last Updated:** 2026-05-25
> **Status:** Ready for Production Testing

## Core Features (Must Have)

### Customer
- [x] Signup/Login (`apps/customer-web/src/pages/auth.tsx`)
- [x] Browse restaurants (`apps/customer-web/src/pages/search.tsx`, `index.tsx`)
- [x] Menu (`apps/customer-web/src/pages/restaurant.tsx`, `menu.tsx`)
- [x] Cart (`apps/customer-web/src/pages/cart.tsx`, `redux/slices/cartSlice.ts`)
- [x] Checkout (`apps/customer-web/src/pages/checkout.tsx`)
- [x] Order tracking (`apps/customer-web/src/pages/tracking.tsx`, `hooks/useTracking.ts`)
- [x] Orders history (`apps/customer-web/src/pages/history.tsx`)
- [x] Wallet (basic) (`apps/customer-web/src/pages/wallet.tsx`)
- [x] Profile (`apps/customer-web/src/pages/profile.tsx`)

### Kitchen
- [x] Accept order (`apps/restaurant-dashboard/src/pages/index.tsx`)
- [x] Preparing status (`apps/restaurant-dashboard/src/pages/index.tsx`)
- [x] Ready status (`apps/restaurant-dashboard/src/pages/index.tsx`)
- [x] Inventory (basic) (`apps/restaurant-dashboard/src/pages/index.tsx`)
- [x] Prep timers (`apps/restaurant-dashboard/src/pages/index.tsx`)

### Driver
- [x] Accept delivery (`apps/delivery-partner/App.tsx`)
- [x] Navigation (`apps/delivery-partner/App.tsx`)
- [x] OTP verification (`apps/delivery-partner/App.tsx`)
- [x] Proof of delivery (`apps/delivery-partner/App.tsx`)
- [x] Earnings (basic) (`apps/delivery-partner/App.tsx`)

### Admin
- [x] Live orders (`apps/super-admin/src/pages/index.tsx`)
- [x] Refunds (`apps/super-admin/src/pages/index.tsx`)
- [x] Kitchen monitoring (`apps/super-admin/src/pages/index.tsx`)
- [x] User management (`apps/super-admin/src/pages/index.tsx`)
- [x] Analytics (basic) (`apps/super-admin/src/pages/index.tsx`)

---

## Cut Temporarily (NOT in V1)

- Corporate ordering
- Advanced AI
- Voice assistant
- Hyper personalization
- Complex loyalty
- Deep gamification

---

## Development Commands

```bash
# Run all apps
npm run dev

# Run specific workspace
npm run dev -w @spicegarden/backend
npm run dev -w @spicegarden/customer-web
npm run dev -w @spicegarden/restaurant-dashboard
npm run dev -w @spicegarden/super-admin
```