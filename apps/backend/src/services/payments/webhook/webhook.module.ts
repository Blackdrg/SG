import { Module } from '@nestjs/common';
import { WebhookService } from './webhook/webhook.service';
import { WebhookController } from './webhook/webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeWebhookEntity } from '../../db/entities/stripe-webhook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StripeWebhookEntity])],
  providers: [WebhookService],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}