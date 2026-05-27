import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService } from './retry.service';
import { FraudHardeningService } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
import { IdempotencyEntity } from './idempotency.entity';
import { PaymentValidationEventEntity } from './payment-validation.entity';
import { PaymentFraudFlagEntity } from './payment-fraud.entity';
import { PaymentEventEntity } from './payment-event.entity';
import { WebhookModule } from './webhook/webhook.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity, 
      WalletEntity, 
      WalletTransactionEntity, 
      AuditLogEntity,
      IdempotencyEntity,
      PaymentValidationEventEntity,
      PaymentFraudFlagEntity,
      PaymentEventEntity,
    ]),
    WebhookModule,
    AuditModule
  ],
  providers: [PaymentService, PaymentHardeningService, RetryService, FraudHardeningService, IdempotencyService],
  controllers: [PaymentsController],
  exports: [PaymentService, PaymentHardeningService, RetryService, FraudHardeningService, IdempotencyService],
})
export class PaymentServiceModule {}
