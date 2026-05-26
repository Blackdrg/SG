# UX_PHASE_2_TODO.md

## Objective
Phase 2: Implement core user flows based on the Figma UX architecture from Phase 1.

## Priority Order

### D1 Customer Web
Priority order:
- [x] Auth
- [x] Home/Search
- [x] Restaurant/Menu
- [x] Cart/Checkout
- [x] Tracking
- [x] Profile/Orders

Then polish.

### D2 Mobile App
Only essential flows first.
Must work flawlessly:
- [x] open app
- [x] order food
- [x] track order
- [x] pay
- [x] reorder

Ignore visual perfection initially.

### D3 KDS Dashboard
Critical.
Kitchen is your business.
Need:
- [x] real-time order queue
- [x] sound alerts
- [x] delay flags
- [x] prep timers
- [x] bulk order handling

### D4 Driver App
Must be extremely simple.
Need:
- [x] accept
- [x] navigate
- [x] pickup
- [x] deliver
- [x] earnings

Fast UX > fancy UI.

## Detailed Tasks

### D1 Customer Web

#### Auth
- [x] Implement login page with email/password
- [x] Implement signup page with validation
- [x] Implement JWT token storage and refresh
- [x] Implement logout functionality
- [x] Add password reset flow
- [x] Add social login (Google/Facebook) - optional for phase 2 (UI placeholders added)

#### Home/Search
- [x] Implement homepage with restaurant listings
- [x] Implement search functionality with filters
- [x] Implement category browsing
- [x] Add restaurant cards with ratings/distance
- [x] Implement loading states and error handling
- [x] Add banner/promotion sections

#### Restaurant/Menu
- [x] Implement restaurant detail page
- [x] Implement menu categorization
- [x] Implement item selection with quantity controls
- [x] Add item customization options
- [x] Add special instructions field
- [ ] Implement menu item images and descriptions

#### Cart/Checkout
- [x] Implement cart page with item list
- [x] Implement quantity adjustment in cart
- [x] Implement remove item functionality
- [x] Implement price calculation (subtotal, tax, delivery)
- [x] Implement checkout form with address selection
- [x] Implement payment method selection (card, UPI, cash)
- [x] Implement order placement with API integration
- [x] Add promo code/discount field

#### Tracking
- [x] Implement order tracking page
- [x] Implement real-time order status updates
- [x] Implement driver location tracking (map view)
- [x] Implement ETA calculation and display
- [x] Add contact driver/call restaurant buttons
- [x] Implement order timeline/history

#### Profile/Orders
- [x] Implement user profile page
- [x] Implement order history listing
- [x] Implement order details view
- [x] Implement reorder functionality
- [x] Implement address management
- [x] Implement payment method management
- [x] Implement notification preferences

### D2 Mobile App

#### Essential Flows
- [x] Implement app splash screen (App.tsx with navigation)
- [x] Implement authentication flow (login/signup)
- [x] Implement home screen with restaurant discovery
- [x] Implement restaurant menu browsing
- [x] Implement cart management
- [x] Implement checkout flow
- [x] Implement order tracking
- [x] Implement payment processing
- [x] Implement reorder from history
- [ ] Implement push notifications for order updates

### D3 KDS Dashboard

#### Core Features
- [x] Implement real-time order queue display
- [x] Implement order cards with item details
- [x] Implement order status updating (received, preparing, ready)
- [x] Implement sound alerts for new orders
- [x] Implement delay flags/warning system
- [x] Implement prep timers for each order
- [x] Implement bulk order handling (batch actions)
- [x] Implement kitchen performance metrics
- [x] Implement order filtering by status/priority
- [x] Implement ticket printing integration

### D4 Driver App

#### Core Features
- [x] Implement driver login/authentication
- [x] Implement available orders list
- [x] Implement order acceptance flow
- [x] Implement navigation to pickup location
- [x] Implement navigation to delivery location
- [x] Implement order status updates (picked up, delivered)
- [x] Implement earnings tracking/display
- [x] Implement daily/weekly summary
- [x] Implement break/shift management
- [x] Implement customer contact/call functionality

## Dependencies
- Backend APIs must be implemented and tested
- Database schema must support all features
- Authentication service must be functional
- Payment gateway integration (Stripe/Razorpay)
- Real-time capabilities (WebSockets/Socket.io)
- Push notification service (FCM/APNS)
- Mapping/geolocation service (Google Maps/Maps)

## Definition of Done
Each feature is considered complete when:
- [ ] UI implements all required functionality
- [ ] API integration works with error handling
- [ ] Loading and error states are handled
- [ ] Responsive design works on target devices
- [ ] Basic accessibility considerations are met
- [ ] Code follows established patterns and conventions
- [ ] Unit tests cover critical paths (where applicable)
- [ ] Manual testing validates core user flows

## Notes
- Focus on functionality over pixel-perfect design initially
- Prioritize happy path flows before edge cases
- Use mock data where backend APIs are not ready
- Implement proper error boundaries and fallback UIs
- Ensure all critical paths work without authentication in dev mode