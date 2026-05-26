import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeWebhookEntity } from '../../../db/entities/stripe-webhook.entity';
import { WebhookService } from './webhook.service';
import { PaymentWebhookController } from './webhook.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StripeWebhookEntity])],
  providers: [WebhookService],
  controllers: [PaymentWebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}