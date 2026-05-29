import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriverOnboardingService } from './driver-onboarding.service';
import { DriverPayoutService } from './driver-payout.service';
import { DriverOpsController } from './driver-ops.controller';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverDocumentEntity } from '../../db/entities/driver-document.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentServiceModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverEntity,
      DriverDocumentEntity,
      DriverIncentiveEntity,
      OrderEntity,
      UserEntity,
      DriverAssignmentEntity,
    ]),
    WalletModule,
    PaymentServiceModule,
  ],
  providers: [DriverOnboardingService, DriverPayoutService],
  controllers: [DriverOpsController],
  exports: [DriverOnboardingService, DriverPayoutService],
})
export class DriverOpsModule {}