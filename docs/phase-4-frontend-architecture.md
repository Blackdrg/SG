# PHASE 4 — Enterprise Frontend Architecture (React Native + React + Next.js)

## Scope (6 production applications)
1. Customer App
2. Customer Website
3. Delivery Partner App
4. Restaurant Dashboard
5. Admin Panel
6. Consumer Landing Page + Admin Landing Page

## 4.1 Frontend Ecosystem
You are not building one frontend. You are building 6 production applications.

- Customer Website
- Customer App
- Delivery App
- Restaurant Dashboard
- Admin Dashboard
- Landing Pages

## 4.2 Enterprise Tech Stack
### Customer Website
- React.js
- Next.js 15+

Why:
- SEO
- Server-side rendering
- Fast loading & better Google ranking

### Mobile Apps
- React Native (Expo Bare workflow)

Why:
- Single codebase
- Android + iOS
- Native performance
- Faster development

### Dashboards
- React.js + Next.js

Why:
- Admin-heavy workflows
- Faster rendering
- Large tables support

### State Management (recommended hybrid)
- Redux Toolkit
  - Auth
  - Cart
  - User state
  - Order state
- React Query / TanStack Query
  - API caching
  - Server state
  - Auto refetching
- Zustand
  - Temporary UI state
  - Modals
  - Filters
  - Animations

## 4.3 Project Monorepo Architecture
Do NOT build separate chaotic projects.

Recommended:
- `food-platform/`
  - `apps/`
    - `customer-app/`
    - `customer-web/`
    - `delivery-app/`
    - `restaurant-panel/`
    - `admin-panel/`
    - `landing-pages/`
  - `packages/`
    - `ui-library/`
    - `shared-hooks/`
    - `shared-types/`
    - `utils/`
    - `api-sdk/`
    - `animations/`
  - `backend/`
  - `devops/`

Benefits:
- Shared code
- Less bugs
- Faster development
- Easy maintenance

## 4.4 Customer App Architecture (React Native)
Structure:
- `customer-app/`
  - `src/`
  - `assets/`
  - `components/`
  - `screens/`
  - `navigation/`
  - `services/`
  - `redux/`
  - `hooks/`
  - `animations/`
  - `constants/`
  - `utils/`
  - `api/`
  - `types/`

## 4.5 Screen Architecture
Organize by feature.

Good example:
- `screens/`
  - `auth/`
  - `home/`
  - `search/`
  - `restaurant/`
  - `cart/`
  - `checkout/`
  - `tracking/`
  - `profile/`
  - `support/`
  - `subscription/`

## 4.6 Navigation System
React Navigation.

Architecture:
- Root Navigator
  - Auth Stack
  - Main Tabs
    - Home
    - Search
    - Orders
    - Subscription
    - Profile
  - Modal Stack

Deep Linking (required):
- `restaurant/123`
- `menu/pizza`
- `offer/discount50`

Helps:
- Marketing
- SEO
- Push notifications
- Sharing

## 4.7 Component Architecture
Reusable components only. Never duplicate UI.

Example:
- `components/`
  - `buttons/`
  - `cards/`
  - `inputs/`
  - `loaders/`
  - `modals/`
  - `maps/`
  - `tracking/`
  - `animations/`
  - `charts/`

Example component props:
- FoodCard
  - image, title, price, rating, deliveryTime, discount
- RestaurantCard
  - name, distance, rating, deliveryTime, offers
- AddToCartButton
  - animated, reuse everywhere

## 4.8 API Layer Architecture (service layer)
Do NOT call APIs directly.

Use a service layer under `api/`:
- `auth.api.ts`
- `order.api.ts`
- `payment.api.ts`
- `tracking.api.ts`
- `restaurant.api.ts`

Flow:
- UI
- Redux Action
- API Service
- Backend
- React Query Cache
- UI update

## 4.9 Offline-First Architecture (critical)
Bad internet exists.

Support:
- Offline cart
- Cached menus
- Recent orders
- Address cache
- Search history

Technology:
- MMKV Storage (fast local storage)
- AsyncStorage (backup)

## 4.10 Real-Time Frontend
Need live updates.

Technology:
- Socket.IO Client

Used for:
- Order status
- Tracking
- Notifications
- Support chat

Flow:
- Backend Socket
- React Native Socket Client
- Redux Update
- Instant UI update

## 4.11 UI Performance Optimization
Must implement:
- Lazy Loading
- Image Optimization
- Virtualized Lists
- Memoization
- Pagination
- Skeleton Loaders
- Code Splitting

Rule of thumb:
- Never load 1000 restaurants at once
- Load 20 at a time

## 4.12 Animation System (premium)
Stack:
- Lottie
- After Effects
- Reanimated
- Framer Motion

App animations:
- Splash
- Animated logo
- Add to Cart
- Order Success package animation
- Tracking moving bike
- Loading skeleton shimmer

Animation rule:
- Do NOT overuse
- Premium > flashy

## 4.13 Customer Website (Next.js)
Architecture (pages):
- home
- restaurants
- menu
- offers
- subscription
- about
- contact
- checkout

SEO strategy:
- SSR
- metadata
- structured schema
- sitemap
- lazy images
- SEO keywords:
  - Food near me
  - Best burgers
  - Fast delivery
  - Restaurant name

## 4.14 Consumer Landing Page (conversion)
Structure:
- Hero
- CTA
- Popular Dishes
- Subscription
- Reviews
- App Download
- FAQ
- Footer

Motion:
- Apple-style scrolling

## 4.15 Delivery App Frontend
Specialized UX.
Needs:
- Fast battery-efficient UI

Structure:
- dashboard/
- incoming-orders/
- map-navigation/
- earnings/
- profile/

Cards:
- Today's earning
- Active orders
- Distance travelled
- Online toggle

Incoming order screen:
- distance
- payout
- pickup time
- accept/reject

## 4.16 Restaurant Panel (kitchen-first)
Real-time.
Sections:
- Orders
- Menu
- Inventory
- Analytics
- Staff
- Settings

Live order queue:
- New order sound
- Blinking card
- Timer countdown

## 4.17 Admin Panel
Technology:
- Next.js

Structure:
- dashboard/
  - analytics
  - orders
  - users
  - restaurants
  - drivers
  - support
  - finance
  - marketing

Charts:
- Recharts

Charts:
- revenue
- orders
- retention
- top dishes
- peak time

## 4.18 Theme Engine
Support:
- Light Mode
- Dark Mode

Persisted user preference.

## 4.19 Security Frontend
Must include:
- Token refresh
- Protected routes
- Role guards
- Session expiration
- Biometric login

## 4.20 Frontend Testing
Testing stack:
- Jest
- React Testing Library
- Detox
- Cypress

Coverage:
- Authentication
- Checkout
- Payments
- Tracking
- Cart

## 4.21 Enterprise Performance Targets
- App load: < 2 sec
- Menu load: < 1 sec
- Tracking update: < 2 sec
- Checkout: < 500ms
- Crash-free rate: 99.5%+

## 4.22 Development Order
Step 1: Design system
Step 2: Auth
Step 3: Home
Step 4: Menu
Step 5: Cart
Step 6: Checkout
Step 7: Tracking
Step 8: Profile
Step 9: Support
Step 10: Subscription

