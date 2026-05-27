import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  private defaultConfig: RetryConfig = {
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  };

  constructor(
    private configService: ConfigService,
    @InjectRepository(IdempotencyEntity)
    private readonly idempotencyRepo: Repository<IdempotencyEntity>,
  ) {}

  getConfig(key: keyof RetryConfig): number {
    const configKey = `PAYMENT_RETRY_${key.toUpperCase()}`;
    return this.configService.get<number>(configKey, this.defaultConfig[key]);
  }

  private calculateDelay(attempt: number, baseDelay: number, maxDelay: number, multiplier: number, jitter: number): number {
    const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    const jitterOffset = cappedDelay * jitter * Math.random();
    return Math.floor(cappedDelay + jitterOffset);
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    context: { userId?: string; orderId?: string; paymentId?: string } = {}
  ): Promise<RetryResult<T>> {
    const maxAttempts = this.getConfig('maxAttempts');
    const baseDelay = this.getConfig('baseDelayMs');
    const maxDelay = this.getConfig('maxDelayMs');
    const multiplier = this.getConfig('backoffMultiplier');
    const jitter = this.getConfig('jitterFactor');

    let lastError: Error;
    let attempts = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts = attempt;
      try {
        const result = await operation();
        return { success: true, result, attempts };
      } catch (error) {
        lastError = error as Error;

        const retryableErrors = [
          'network_error',
          'timeout',
          'rate_limit',
          'service_unavailable',
          'temporary_failure',
        ];

        const isRetryable = retryableErrors.some(re =>
          lastError.message.toLowerCase().includes(re) ||
          (lastError as any).type === 'api_connection_error'
        );

        if (!isRetryable || attempt === maxAttempts) {
          this.logger.error(`Operation ${operationName} failed after ${attempt} attempts: ${lastError.message}`);
          return { success: false, error: lastError, attempts };
        }

        const delay = this.calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter);
        this.logger.warn(`Operation ${operationName} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms: ${lastError.message}`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return { success: false, error: lastError!, attempts };
  }

  async getRetryableFailedPayments(): Promise<IdempotencyEntity[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return this.idempotencyRepo
      .createQueryBuilder('id')
      .where('id.operation = :op', { op: 'create_payment_intent' })
      .andWhere('id.isCompleted = :completed', { completed: false })
      .andWhere('id.createdAt <= :threshold', { threshold: oneHourAgo })
      .orderBy('id.createdAt', 'ASC')
      .limit(100)
      .getMany();
  }

  async cleanupStaleRetries(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.idempotencyRepo
      .createQueryBuilder()
      .delete()
      .where('isCompleted = :completed', { completed: false })
      .andWhere('createdAt <= :threshold', { threshold: twentyFourHoursAgo })
      .execute();

    return result.affected || 0;
  }

  async getRetryStats(): Promise<any> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      pendingRetries,
      completedRetries,
      failedRetries,
      recentCompleted,
      recentFailed,
    ] = await Promise.all([
      this.idempotencyRepo.count({ where: { isCompleted: false } }),
      this.idempotencyRepo.createQueryBuilder('id')
        .where('id.isCompleted = :completed', { completed: true })
        .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'succeeded' })
        .getCount(),
      this.idempotencyRepo.createQueryBuilder('id')
        .where('id.isCompleted = :completed', { completed: true })
        .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'failed' })
        .getCount(),
      this.idempotencyRepo.count({
        where: {
          operation: 'create_payment_intent',
          isCompleted: true,
          completedAt: MoreThanOrEqual(oneHourAgo)
        }
      }),
      this.idempotencyRepo.count({
        where: {
          operation: 'create_payment_intent',
          isCompleted: true,
          createdAt: MoreThanOrEqual(oneHourAgo)
        }
      }),
    ]);

    return {
      pendingRetries,
      completedRetries,
      failedRetries,
      retryAttemptsLastHour: recentCompleted + recentFailed,
    };
  }
}