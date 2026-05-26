import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { KdsGateway } from './kds.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RestaurantEntity,
      RestaurantBranchEntity,
      MenuCategoryEntity,
      MenuItemEntity,
      InventoryItemEntity,
    ]),
  ],
  providers: [RestaurantService, KdsGateway],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantServiceModule {}
