import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { PaymentServiceModule } from '../../services/payments/payments.module';
import { NotificationModule } from '../../services/notifications/notification.module';
import { GSTModule } from '../../services/gst/gst.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, AuditLogEntity]), PaymentServiceModule, NotificationModule, GSTModule],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderServiceModule {}