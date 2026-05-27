import { ConfigService } from '@nestjs/config';
export interface ProductionNotificationConfig {
    email: boolean;
    sms: boolean;
    push: boolean;
    webhook: boolean;
    slack?: boolean;
}
export interface AlertPayload {
    type: 'payment_failure' | 'payment_success' | 'refund_initiated' | 'refund_completed' | 'fraud_detected' | 'order_cancelled' | 'webhook_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId: string;
    orderId?: string;
    paymentId?: string;
    amount?: number;
    message: string;
    metadata?: Record<string, any>;
}
export declare class ProductionNotificationService {
    private configService;
    private readonly logger;
    private readonly defaultChannels;
    constructor(configService: ConfigService);
    sendPaymentNotification(userId: string, paymentId: string, alert: Omit<AlertPayload, 'userId' | 'paymentId'>): Promise<void>;
    sendOrderNotification(userId: string, orderId: string, alert: Omit<AlertPayload, 'userId' | 'orderId'>): Promise<void>;
    sendFraudAlert(userId: string, alert: Omit<AlertPayload, 'userId' | 'type'>): Promise<void>;
    sendWebhookAlert(webhookId: string, error: string, payload: any): Promise<void>;
    private sendNotification;
    private sendWebhookAlertForNotification;
    private sendSlackAlert;
    private sendEmailNotification;
    private sendSMSForAlert;
    private sendPushNotification;
}
