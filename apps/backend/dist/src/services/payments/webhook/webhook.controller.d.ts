import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
export declare class PaymentWebhookController {
    private readonly webhookService;
    private readonly configService;
    constructor(webhookService: WebhookService, configService: ConfigService);
    handleWebhook(payload: any, signature: string, req: Request): Promise<any>;
    getWebhookStats(): Promise<any>;
}
