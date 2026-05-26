import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { QueueService } from '../../infra/queue/queue.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, AuditLogEntity])],
  providers: [OrderService, QueueService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderServiceModule {}