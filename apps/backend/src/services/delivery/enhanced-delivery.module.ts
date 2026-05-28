import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnhancedDeliveryService } from './enhanced-delivery.service';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { GeoService } from '../../services/geo/geo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverEntity, OrderEntity, BatchEntity, DriverAssignmentEntity]),
  ],
  providers: [EnhancedDeliveryService, GeoService],
  exports: [EnhancedDeliveryService],
})
export class EnhancedDeliveryServiceModule {}