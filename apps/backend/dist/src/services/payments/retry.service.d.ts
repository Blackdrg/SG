import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
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
export declare class RetryService {
    private configService;
    private readonly idempotencyRepo;
    private readonly logger;
    private defaultConfig;
    constructor(configService: ConfigService, idempotencyRepo: Repository<IdempotencyEntity>);
    getConfig(key: keyof RetryConfig): number;
    private calculateDelay;
    executeWithRetry<T>(operation: () => Promise<T>, operationName: string, context?: {
        userId?: string;
        orderId?: string;
        paymentId?: string;
    }): Promise<RetryResult<T>>;
    getRetryableFailedPayments(): Promise<IdempotencyEntity[]>;
    cleanupStaleRetries(): Promise<number>;
    getRetryStats(): Promise<any>;
}
