import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
import { FinanceController } from './finance.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      GSTDetailEntity,
      RestaurantEntity,
      RestaurantGSTEntity,
      OrderItemEntity,
      WalletTransactionEntity,
      PayoutReportEntity,
      DriverIncentiveEntity,
    ]),
  ],
  providers: [TaxReportingService, ReconciliationService],
  controllers: [FinanceController],
  exports: [TaxReportingService, ReconciliationService],
})
export class FinanceModule {}