import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';

export interface WebhookRetryJob {
  webhookId: string;
  gateway: string;
  eventType: string;
  payload: Record<string, any>;
  attempt: number;
  maxAttempts: number;
}

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name);

  constructor(
    @InjectRepository(WebhookRetryQueueEntity)
    private readonly retryRepo: Repository<WebhookRetryQueueEntity>,
  ) {}

  async enqueueWebhook(
    webhookId: string,
    gateway: string,
    eventType: string,
    payload: Record<string, any>,
    maxAttempts: number = 5,
  ): Promise<WebhookRetryQueueEntity> {
    const job = this.retryRepo.create({
      webhookId,
      gateway,
      eventType,
      payload,
      attempt: 0,
      maxAttempts,
      status: 'pending',
      scheduledAt: new Date(),
    });
    return await this.retryRepo.save(job);
  }

  async getNextJob(): Promise<WebhookRetryJob | null> {
    const now = new Date();
    const job = await this.retryRepo.findOne({
      where: {
        status: 'pending',
        scheduledAt: LessThan(now),
      },
      order: { scheduledAt: 'ASC' },
    });

    if (!job) return null;

    await this.retryRepo.update(job.id, { status: 'processing' });
    return {
      webhookId: job.webhookId,
      gateway: job.gateway,
      eventType: job.eventType,
      payload: job.payload,
      attempt: job.attempt + 1,
      maxAttempts: job.maxAttempts,
    };
  }

  async success(jobId: string): Promise<void> {
    await this.retryRepo.update(jobId, { status: 'succeeded', processedAt: new Date() });
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = await this.retryRepo.findOne({ where: { id: jobId } });
    if (!job) return;

    const nextAttempt = job.attempt + 1;
    const delay = this.calculateDelay(nextAttempt);

    if (nextAttempt >= job.maxAttempts) {
      await this.retryRepo.update(jobId, {
        status: 'discarded',
        lastError: error,
        processedAt: new Date(),
      });
      this.logger.error(`Webhook ${job.webhookId} discarded after ${job.maxAttempts} attempts: ${error}`);
    } else {
      const nextScheduled = new Date(Date.now() + delay);
      await this.retryRepo.update(jobId, {
        status: 'pending',
        attempt: nextAttempt,
        scheduledAt: nextScheduled,
        lastError: error,
      });
      this.logger.warn(`Webhook ${job.webhookId} retry scheduled for attempt ${nextAttempt}/${job.maxAttempts}`);
    }
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = 60000;
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = delay * 0.1 * Math.random();
    return Math.min(delay + jitter, 1800000);
  }

  async getStats(): Promise<any> {
    const [pending, processing, succeeded, failed, discarded] = await Promise.all([
      this.retryRepo.count({ where: { status: 'pending' } }),
      this.retryRepo.count({ where: { status: 'processing' } }),
      this.retryRepo.count({ where: { status: 'succeeded' } }),
      this.retryRepo.count({
        where: {
          status: In(['pending', 'processing']),
          attempt: MoreThan(0),
        }
      }),
      this.retryRepo.count({ where: { status: 'discarded' } }),
    ]);

    return {
      pending,
      processing,
      succeeded,
      retrying: failed,
      discarded,
    };
  }

  async processRetryQueue(): Promise<void> {
    const job = await this.getNextJob();
    if (!job) return;

    this.logger.log(`Processing webhook retry ${job.webhookId} (attempt ${job.attempt})`);
  }
}