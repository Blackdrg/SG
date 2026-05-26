import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/audit.service';
import { OrderService } from '../../order/order.service';
import { WalletService } from '../../wallet/wallet.service';
import { NotificationService } from '../../notifications/notification.service';
import { Repository } from 'typeorm';
import { StripeWebhookEntity } from '../../db/entities/stripe-webhook.entity';
export declare class WebhookService {
    private configService;
    private auditService;
    private orderService;
    private walletService;
    private notificationService;
    private readonly webhookRepo;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, auditService: AuditService, orderService: OrderService, walletService: WalletService, notificationService: NotificationService, webhookRepo: Repository<StripeWebhookEntity>);
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
