import { Module }  from '@nestjs/common';
import { ConfigModule }  from '@nestjs/config';
import { AppController }  from './app.controller';
import { AppService }  from './app.service';
import { DbModule }  from './db/db.module';
import { SecurityModule }  from './security/security.module';
import { QueueModule }  from './infra/queue/queue.module';
import { TrackingModule }  from './infra/tracking/tracking.module';
import { AuthServiceModule }  from './services/auth/auth.module';
import { OrderServiceModule }  from './services/order/order.module';
import { PaymentServiceModule }  from './services/payments/payments.module';
import { RestaurantServiceModule }  from './services/restaurant/restaurant.module';
import { SearchServiceModule }  from './services/search/search.module';
import { DeliveryServiceModule }  from './services/delivery/delivery.module';
import { AdminServiceModule }  from './services/admin/admin.module';
import { NotificationModule }  from './services/notifications/notification.module';
import { KitchenModule }  from './modules/kitchen/kitchen.module';
import { DriverAssignmentModule }  from './modules/driver-assignment/driver-assignment.module';
import { MetricsModule }  from './metrics/metrics.module';
import { ComplianceModule }  from './compliance/compliance.module';
import { AuditModule }  from './audit/audit.module';
import { WalletModule }  from './services/wallet/wallet.module';
import { GSTModule }  from './services/gst/gst.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DbModule,
    SecurityModule,
    QueueModule,
    TrackingModule,
    AuthServiceModule,
    OrderServiceModule,
    PaymentServiceModule,
    RestaurantServiceModule,
    SearchServiceModule,
    DeliveryServiceModule,
    AdminServiceModule,
    NotificationModule,
    KitchenModule,
    DriverAssignmentModule,
    MetricsModule,
    ComplianceModule,
    AuditModule,
    WalletModule,
    GSTModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
