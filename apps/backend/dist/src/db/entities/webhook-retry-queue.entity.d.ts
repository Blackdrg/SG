export declare class WebhookRetryQueueEntity {
    id: string;
    webhookId: string;
    gateway: string;
    eventType: string;
    payload: Record<string, any>;
    attempt: number;
    maxAttempts: number;
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'discarded';
    lastError: string;
    scheduledAt: Date;
    processedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
