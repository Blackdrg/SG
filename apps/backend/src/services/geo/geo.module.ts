import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { GeoService } from './geo.service';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantEntity, RestaurantBranchEntity, DriverEntity, OrderEntity])],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}