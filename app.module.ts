import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DbModule } from "./apps/backend/src/db/db.module";
import { SecurityModule } from "./apps/backend/src/security/security.module";
import { QueueModule } from "./apps/backend/src/infra/queue/queue.module";
import { TrackingModule } from "./apps/backend/src/infra/tracking/tracking.module";
import { GatewayModule } from "./apps/backend/src/gateway/gateway.module";
import { AuthServiceModule } from "./apps/backend/src/services/auth/auth.module";
import { UserModule } from "./apps/backend/src/services/users/user.module";
import { OrderServiceModule } from "./apps/backend/src/services/order/order.module";
import { PaymentServiceModule } from "./apps/backend/src/services/payments/payments.module";
import { RestaurantServiceModule } from "./apps/backend/src/services/restaurant/restaurant.module";
import { SearchServiceModule } from "./apps/backend/src/services/search/search.module";
import { DeliveryServiceModule } from "./apps/backend/src/services/delivery/delivery.module";
import { AdminServiceModule } from "./apps/backend/src/services/admin/admin.module";
import { AiServiceModule } from "./apps/backend/src/services/ai/ai.module";
import { NotificationModule } from "./apps/backend/src/services/notifications/notification.module";
import { GeoModule } from "./apps/backend/src/services/geo/geo.module";
import { KitchenModule } from "./apps/backend/src/modules/kitchen/kitchen.module";
import { DriverAssignmentModule } from "./apps/backend/src/modules/driver-assignment/driver-assignment.module";
// Add other services as needed

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    SecurityModule,
    QueueModule,
    TrackingModule,
    GatewayModule,
    AuthServiceModule,
    UserModule,
    OrderServiceModule,
    PaymentServiceModule,
    RestaurantServiceModule,
    SearchServiceModule,
    DeliveryServiceModule,
    AdminServiceModule,
    AiServiceModule,
    NotificationModule,
    GeoModule,
    KitchenModule,
    DriverAssignmentModule,
  ]
})
export class AppModule {}


