# SpiceGarden — Business Architecture (Phase 0)

## Primary Business Models
1. Food Delivery
2. Self Pickup
3. Dining Reservation
4. Subscription Membership
5. Scheduled Orders
6. Corporate/Bulk Orders
7. Loyalty & Rewards

## Core Platform Ecosystem (5 Frontends + Backend)

1. Customer Platform
- Customer-facing app + website
- Browse menu, order food, track order, subscription plans, dining booking, self pickup
- Tech: React Native + React/Next.js

2. Restaurant Management Platform
- Outlet/Kitchen dashboard
- Manage incoming orders, kitchen workflow, menu management, inventory sync, pricing control
- Tech: React dashboard

3. Delivery Partner Platform
- Accept orders, navigation, earnings tracking, delivery proof
- Tech: React Native

4. Super Admin Platform
- Entire platform control: revenue, promotions, support, disputes, analytics
- Tech: React admin panel

5. Backend Core Infrastructure
- Authentication, order processing, real-time tracking, payments, notifications, analytics
- Tech: Node.js + NestJS

## Customer Order Lifecycle
Customer places order
→ Payment verified
→ Restaurant receives order
→ Kitchen accepts
→ Preparation starts
→ Driver assigned
→ Pickup
→ Live tracking
→ Delivered
→ Rating request
→ Loyalty points awarded

## Notes
This repo is a monorepo. Backends/SDKs/contracts will be shared via `packages/*`.

