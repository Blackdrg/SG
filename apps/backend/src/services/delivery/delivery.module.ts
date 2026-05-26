import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { GeoService } from '../../services/geo/geo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverEntity,
      WalletEntity,
      WalletTransactionEntity,
      OrderEntity,
      BatchEntity,
      DriverAssignmentEntity,
      DriverScoreEntity,
      DriverFraudEntity,
    ]),
  ],
  providers: [DeliveryService, GeoService],
  exports: [DeliveryService],
})
export class DeliveryServiceModule {}
