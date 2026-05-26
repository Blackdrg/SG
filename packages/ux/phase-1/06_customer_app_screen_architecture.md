# 06 — Customer App Screen Architecture (100–150 baseline)

> This is a taxonomy + state model. Total screens will expand when you add loading/empty/error/reduced-motion variants.

## State Modeling (applies to all screens)
Each screen should be represented as variants:
- Loading
- Empty
- Error (with retry)
- Offline
- Reduced motion

---

## A) AUTH FLOW (12+ Screens)
1. Splash Screen (auto login check)
2. Welcome Screen (get started)
3. Login (phone/email)
4. Signup (create account)
5. Guest mode
6. OTP Login (phone)
7. OTP auto detect
8. Email Login
9. Social Login (Google)
10. Social Login (Apple)
11. Forgot Password
12. Account Creation
13. Permission Screens
   - Location
   - Notifications
   - Camera (if required)

---

## B) HOME FLOW (15+ Screens)
1. Home Dashboard
   - search bar, categories, featured meals, trending
   - offers + subscription banner
   - reorder section
   - nearby branches
   - live order widget
2. Food Category Screen (Pizza)
3. Food Category Screen (Burger)
4. Food Category Screen (Drinks)
5. Food Category Screen (Combos)
6. Food Category Screen (Desserts)
7. Featured Campaign Page (festival offers)
8. Subscription Benefits Preview
9. Nearby Branch Selector
10. Live Order Widget (mini)
11. Empty Home (no offers)
12. Offline Home
13. Home Loading Skeletons
14. Reorder List
15. Subscription Upsell Modal

---

## C) SEARCH SYSTEM (10 Screens)
1. Smart Search (query entry)
2. Auto-complete Suggestions
3. Recent Searches
4. Voice Search
5. AI recommendations (if enabled)
6. Filters
7. Filter results state
8. Cuisine filter
9. Price filter
10. Ratings + Veg/Non-veg + Spice level + Delivery time

---

## D) MENU SYSTEM (20+ Screens)
1. Restaurant Detail Page (hero, ratings, time, offers, categories)
2. Menu Categories List
3. Menu Listing (all items)
4. Food Item Detail
5. Add-ons Modal
6. Customization Screen
7. Instructions Screen
8. Combo Builder
9. Combo Preview
10. Variant Selection (size/crust/etc.)
11. Food image gallery (if multiple images)
12. Nutrition info (modal)
13. Out-of-stock state
14. Price update state
15. Restaurant offers detail
16. Similar items
17. Allergy/ingredient info
18. Delivery time estimate component view
19. Menu loading skeletons
20. Menu error/retry

---

## E) CART FLOW (12 Screens)
1. Cart Page
2. Coupons
3. Taxes breakdown
4. Instructions
5. Delivery time picker
6. Address selection
7. Checkout entry
8. Payment method selection
9. Wallet & credits
10. Subscription benefits (apply automatically)
11. Success Screen (premium animation)
12. Cart error / payment failed

---

## F) LIVE TRACKING (10+ Screens)
1. Real-time Map
2. Driver tracking overlay
3. Restaurant progress states
4. ETA card
5. Contact driver
6. Support button
7. Order timeline (preparing → delivered)
8. Timeline nearby screen
9. Delivery proof preview
10. Delivered confirmation
11. Tracking offline/reconnect

---

## G) PROFILE SYSTEM (15 Screens)
1. Profile Dashboard
2. Orders list
3. Addresses list
4. Wallet & credits
5. Coupons
6. Subscription
7. Support
8. Preferences
9. Saved Addresses management
10. Home/Office custom labeling
11. Map pinning
12. Payment preferences (if needed)
13. Rewards summary
14. Refund history
15. Accessibility settings (font size, reduced motion toggle)

---

## H) REVIEW FLOW
1. Review entry (food + delivery)
2. Photo upload
3. Text review
4. Delivery rating
5. Food rating
6. Submit success + thank you

