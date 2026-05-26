import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, WalletEntity, WalletTransactionEntity, AuditLogEntity]), WebhookModule],
  providers: [PaymentService],
  controllers: [PaymentsController],
  exports: [PaymentService],
})
export class PaymentServiceModule {}
