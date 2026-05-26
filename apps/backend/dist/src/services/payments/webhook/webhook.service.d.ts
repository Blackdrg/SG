import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { StripeWebhookEntity } from '../../../db/entities/stripe-webhook.entity';
export declare class WebhookService {
    private configService;
    private readonly webhookRepo;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, webhookRepo: Repository<StripeWebhookEntity>);
    processWebhook(payload: Buffer, signature: string): Promise<any>;
    private handleEvent;
    private handlePaymentIntentSucceeded;
    private handlePaymentIntentFailed;
    private handleChargeRefunded;
    private handleChargeRefundUpdated;
    private handleDisputeCreated;
    private handleDisputeClosed;
    getWebhookStats(): Promise<any>;
}
