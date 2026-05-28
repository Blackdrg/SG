import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GSTService } from './gst.service';
import { GSTController } from './gst.controller';
import { OrderEntity } from '../db/entities/order.entity';
import { OrderItemEntity } from '../db/entities/order-item.entity';
import { GSTDetailEntity } from '../db/entities/gst-detail.entity';
import { HSNSACEntity } from '../db/entities/hsn-sac.entity';
import { RestaurantGSTEntity } from '../db/entities/restaurant-gst.entity';
import { MenuItemEntity } from '../db/entities/menu-item.entity';
import { RestaurantEntity } from '../db/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      GSTDetailEntity,
      HSNSACEntity,
      RestaurantGSTEntity,
      MenuItemEntity,
      RestaurantEntity,
    ]),
  ],
  providers: [GSTService],
  controllers: [GSTController],
  exports: [GSTService],
})
export class GSTModule {}
