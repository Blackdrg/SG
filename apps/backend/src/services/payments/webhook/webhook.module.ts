import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeWebhookEntity } from '../../../db/entities/stripe-webhook.entity';
import { PaymentEventEntity } from '../payment-event.entity';
import { PaymentFraudFlagEntity } from '../payment-fraud.entity';
import { WebhookService } from './webhook.service';
import { PaymentWebhookController } from './webhook.controller';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StripeWebhookEntity, PaymentEventEntity, PaymentFraudFlagEntity]),
    NotificationModule,
  ],
  providers: [WebhookService],
  controllers: [PaymentWebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}