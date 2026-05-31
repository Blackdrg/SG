import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurgeZoneEntity, RestaurantBranchEntity])],
  providers: [MapsService],
  controllers: [MapsController],
  exports: [MapsService],
})
export class MapsModule {}

