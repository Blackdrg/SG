import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverFleetService } from './driver-fleet.service';
import { DriverFleetController } from './driver-fleet.controller';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverShiftEntity } from '../../db/entities/driver-shift.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverPenaltyEntity } from '../../db/entities/driver-penalty.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverEntity,
      DriverShiftEntity,
      DriverScoreEntity,
      DriverPenaltyEntity,
      DriverIncentiveEntity,
      OrderEntity,
      DriverAssignmentEntity,
    ]),
  ],
  providers: [DriverFleetService],
  controllers: [DriverFleetController],
  exports: [DriverFleetService],
})
export class DriverFleetModule {}
