import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { CouponEntity } from '../../db/entities/coupon.entity';
import { CouponUsageEntity } from '../../db/entities/coupon-usage.entity';
import { ReferralEntity } from '../../db/entities/referral.entity';
import { SubscriptionEntity } from '../../db/entities/subscription.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      CouponUsageEntity,
      ReferralEntity,
      SubscriptionEntity,
      UserEntity,
      OrderEntity,
    ]),
  ],
  providers: [LoyaltyService],
  controllers: [LoyaltyController],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
