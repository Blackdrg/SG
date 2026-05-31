import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';
import { WebhookRetryService } from './webhook-retry.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookRetryQueueEntity])],
  providers: [WebhookRetryService],
  exports: [WebhookRetryService],
})
export class WebhookRetryModule {}