# SpiceGarden — Backend Core Infrastructure

The central engine of the SpiceGarden platform, built with **NestJS**. This service handles the mission-critical business logic, transactional integrity, and real-time coordination for the entire ecosystem.

## 🛠 Tech Stack
- **Framework**: NestJS (TypeScript)
- **Persistence**: 
  - **TypeORM** (PostgreSQL + PostGIS) for transactions and geo-search.
  - **Mongoose** (MongoDB) for reviews and logs.
  - **Redis** for caching, session management, and live tracking coordinates.
- **Queuing**: **BullMQ** for background order processing and email/push notification dispatch.
- **Communication**: **Socket.IO** for bi-directional real-time updates (Tracking & KDS).
- **Security**: 
  - Argon2 for secure password hashing.
  - AES-256 for field-level encryption.
  - JWT with Refresh Token rotation.
  - Role-Based Access Control (RBAC).

## 📂 Key Modules
- **`AuthModule`**: Multi-role authentication and session management.
- **`OrderModule`**: Transactional order lifecycle with BullMQ integration.
- **`PaymentModule`**: Stripe integration with webhook verification.
- **`RealtimeModule`**: Socket.IO gateways for live tracking and KDS notifications.
- **`AiModule`**: Recommendation engine and demand forecasting.
- **`SearchModule`**: Proximity-based restaurant and food discovery.

## 🚀 Development
```bash
# Install dependencies (from root)
npm install

# Run in development mode
npm run dev -w @spicegarden/backend

# Build for production
npm run build -w @spicegarden/backend
```


