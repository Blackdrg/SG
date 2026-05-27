import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PaymentServiceModule } from '../../services/payments/payments.module';
import { NotificationModule } from '../../services/notifications/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity, WalletTransactionEntity]), PaymentServiceModule, NotificationModule],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}