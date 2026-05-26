import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemEntity, RestaurantEntity])],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchServiceModule {}
