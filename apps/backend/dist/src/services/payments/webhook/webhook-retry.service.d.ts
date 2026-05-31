import { Repository } from 'typeorm';
import { WebhookRetryQueueEntity } from '../../../db/entities/webhook-retry-queue.entity';
export interface WebhookRetryJob {
    webhookId: string;
    gateway: string;
    eventType: string;
    payload: Record<string, any>;
    attempt: number;
    maxAttempts: number;
}
export declare class WebhookRetryService {
    private readonly retryRepo;
    private readonly logger;
    constructor(retryRepo: Repository<WebhookRetryQueueEntity>);
    enqueueWebhook(webhookId: string, gateway: string, eventType: string, payload: Record<string, any>, maxAttempts?: number): Promise<WebhookRetryQueueEntity>;
    getNextJob(): Promise<WebhookRetryJob | null>;
    success(jobId: string): Promise<void>;
    fail(jobId: string, error: string): Promise<void>;
    private calculateDelay;
    getStats(): Promise<any>;
    processRetryQueue(): Promise<void>;
}
