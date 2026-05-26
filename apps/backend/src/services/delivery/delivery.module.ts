import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverEntity,
      WalletEntity,
      WalletTransactionEntity,
      OrderEntity,
    ]),
  ],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryServiceModule {}
