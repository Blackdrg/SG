# PHASE 3 — Enterprise Database Architecture (Production-ready for 200k–300k users)

## 1) Database architecture overview (polyglot)
For a food delivery system, database architecture impacts:
- Speed
- Stability
- Scalability
- Real-time performance
- Order reliability

**Non-negotiable rule:** do **not** use one database for everything.

### Application → Database layer mapping
- **PostgreSQL (Relational)**: structured transactional data
  - Orders, users, payments, restaurant management
- **MongoDB (Flexible documents)**: semi-structured workloads
  - Chat, reviews, notification documents, logs, AI recommendation feature docs
- **Redis (Fast cache / memory)**: ultra-low latency operational data
  - Live tracking cache, OTP, sessions, cart cache, queue coordination
- **Elasticsearch (Search)**: discovery + search UX
  - Food search, autocomplete, typo tolerance, smart filtering
- **S3 (Object storage)**: media + receipts
  - Food photos, restaurant banners, profile photos, review images, invoices

## 2) Cluster architecture (primary + replicas)
For 200k–300k users:
- **Primary DB** handles writes
- **Read replicas** handle reads
- Optional: multi-AZ / multi-region replication for HA

Architecture:
- Primary DB
  - Replica 1
  - Replica 2

Benefits:
- Faster read performance
- High availability
- Reduced primary DB load

## 3) Core database domains
Target 25–35 database domains. Suggested set (from spec):
1. Users
2. Authentication
3. Restaurants
4. Menu
5. Categories
6. Orders
7. Payments
8. Delivery
9. Tracking
10. Coupons
11. Wallet
12. Subscription
13. Reviews
14. Dining
15. Pickup
16. Inventory
17. Support
18. Notifications
19. Promotions
20. Analytics
21. Referrals
22. Loyalty
23. Fraud
24. Audit logs
25. Settings

## 4) Schema & storage strategies (by domain)
> This doc is an **architecture blueprint**; actual migrations/ORM models are implemented later.

### 4.1 Users (PostgreSQL)
**Table: `users`**
- `id` UUID PK
- `full_name`
- `email`
- `phone`
- `password_hash`
- `profile_image`
- `role`
- `status`
- `email_verified` (bool)
- `phone_verified` (bool)
- `created_at`, `updated_at`, `deleted_at`

**Indexes:**
- `email` index
- `phone` index
- `role` index

**Sessions:** `user_sessions`
- `id`, `user_id`, `device_type`, `device_name`, `ip_address`
- `refresh_token`, `expires_at`, `created_at`

**Addresses:** `user_addresses`
- `id`, `user_id`, `label`, `latitude`, `longitude`, `address`, `landmark`
- `city`, `pincode`, `is_default`, `created_at`

**Preferences:** `user_preferences`
- `id`, `user_id`, `veg_mode`, `spice_level`, `favorite_cuisines`, `allergies`, `language`, `dark_mode`

### 4.2 Authentication (PostgreSQL)
- `otp_verifications`: `phone`, `otp_hash`, `expires_at`, `attempts`, `created_at`
- `password_reset_tokens`: `user_id`, `token`, `expires_at`

### 4.3 Restaurants (PostgreSQL)
**`restaurants`**
- `id`, `name`, `slug`, `brand_name`, `description`, `logo_url`, `banner_url`
- `email`, `phone`, `gst_number`, `license_number`, `rating`, `status`
- `created_at`

**`restaurant_branches`** (multi-outlet)
- `id`, `restaurant_id`, `branch_name`, `latitude`, `longitude`, `address`
- `opening_time`, `closing_time`, `delivery_radius`, `online_status`

**`restaurant_staff`**
- `id`, `restaurant_id`, `employee_name`, `role`, `phone`, `shift_start`, `shift_end`, `status`

### 4.4 Menu & variants (PostgreSQL)
**`categories`**
- `id`, `restaurant_id`, `name`, `image`, `sort_order`

**`menu_items`** (core table)
- `id`, `restaurant_id`, `category_id`, `name`, `slug`, `description`
- `base_price`, `discount_price`, `image_url`
- `veg`, `spice_level`, `calories`, `protein`, `status`, `created_at`

**`menu_variants`**
- `id`, `menu_item_id`, `variant_name`, `price`

**`menu_addons`**
- `id`, `menu_item_id`, `addon_name`, `price`

### 4.5 Cart system (Redis + PostgreSQL hybrid)
- Redis: fast ephemeral cart
- Postgres: persistent recovery

Suggested tables:
- `carts`: `id`, `user_id`, `restaurant_id`, `created_at`, `updated_at`
- `cart_items`: `id`, `cart_id`, `menu_item_id`, `quantity`, `customization`, `price`

### 4.6 Orders (PostgreSQL, mission critical)
**`orders`**
- `id`, `user_id`, `restaurant_id`, `driver_id`, `order_number`
- `status`, `payment_status`
- `subtotal`, `tax`, `delivery_fee`, `discount`, `tip`, `grand_total`, `coupon_id`
- `delivery_address_id`, `created_at`, `updated_at`

**`order_items`**
- `id`, `order_id`, `menu_item_id`, `quantity`, `variant`, `addons`, `special_instructions`, `price`

**`order_status_history`**
- `id`, `order_id`, `status`, `changed_by`, `timestamp`

### 4.7 Payments & refunds (PostgreSQL)
**`payments`**
- `id`, `order_id`, `user_id`, `gateway`, `transaction_id`
- `amount`, `currency`, `status`, `payment_method`, `created_at`

**`refunds`**
- `id`, `payment_id`, `refund_amount`, `reason`, `status`, `created_at`

### 4.8 Delivery & drivers (PostgreSQL)
- `drivers`: identity + vehicle + availability + rating
- `driver_documents`: KYC
- `driver_earnings`: earning/tips/bonus by date

### 4.9 Live tracking (Redis first, batch persistence)
- `driver_tracking` stored in Redis
- Batch-save to a persistent store later (architecture recommendation)

Update frequency: **every 3–5 seconds**
Fields:
- `driver_id`, `latitude`, `longitude`, `speed`, `battery_level`, `updated_at`

### 4.10 Reviews (MongoDB)
- `reviews` document with restaurantId, userId, ratings, text, images, deliveryRating/foodRating, createdAt

### 4.11 Subscription (PostgreSQL)
- `subscription_plans`: `id`, `name`, `price`, `duration`, `benefits`
- `user_subscriptions`: `id`, `user_id`, `plan_id`, `start_date`, `end_date`, `status`

### 4.12 Coupons (PostgreSQL)
- `coupons` and `coupon_usage` as described in spec

### 4.13 Loyalty (PostgreSQL)
- `loyalty_points`: `id`, `user_id`, `points`, `source`, `created_at`

### 4.14 Support & disputes (MongoDB recommended)
- `support_tickets`
- `support_messages` by ticket_id

### 4.15 Notifications (MongoDB preferred)
- Store notification documents with `userId`, `title`, `type`, `isRead`, `createdAt`

### 4.16 Analytics (separate analytics store)
- `analytics_events`, `user_behavior`, `conversion_metrics`

### 4.17 Audit logging (PostgreSQL strongly recommended)
- `audit_logs`: `id`, `action`, `entity_type`, `entity_id`, `performed_by`, `timestamp`, `metadata`

### 4.18 Settings & other operational configs
- Store in PostgreSQL with indexed keys

## 5) Indexing strategy
Goal: queries return under **100ms**.

Indexes to prioritize:
- `email`, `phone`
- `restaurant_id`, `user_id`
- `order_id`
- `created_at`, `status`
- `location` (for geo lookup)

## 6) Partitioning (orders growth)
Orders table grows rapidly. Recommendation:
- Partition by **month**
- Example: `orders_2026_jan`, `orders_2026_feb`

## 7) Backup plan
- Hourly incremental backup
- Daily backup
- Weekly full backup
- Multi-region backup

## 8) Failover strategy
- Replica auto-promotes to primary on failure
- Target **zero downtime** behavior for writes through automatic failover

## 9) Performance targets
- Menu load: **< 200ms**
- Checkout: **< 1 sec**
- Search: **< 100ms**
- Tracking: **< 2 sec latency**

---

## 10) Phase 3 repo-level deliverables (next implementation)
When you proceed to implementation, the repo should include:
- DB adapter interfaces (already planned for Phase 2 scaffolding)
- Migration framework setup (Postgres) + document model layer (Mongo)
- Elasticsearch index mapping + seed scripts
- Redis schema and TTL policies for OTP/sessions/cart/tracking cache
- Partitioning + index templates for orders
- Audit log write path + idempotency constraints

