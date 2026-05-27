"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductionNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionNotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ProductionNotificationService = ProductionNotificationService_1 = class ProductionNotificationService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ProductionNotificationService_1.name);
        this.defaultChannels = {
            email: true,
            sms: false,
            push: true,
            webhook: false,
        };
    }
    async sendPaymentNotification(userId, paymentId, alert) {
        const payload = { ...alert, userId, paymentId };
        await this.sendNotification(payload);
    }
    async sendOrderNotification(userId, orderId, alert) {
        const payload = { ...alert, userId, orderId };
        await this.sendNotification(payload);
    }
    async sendFraudAlert(userId, alert) {
        const payload = { ...alert, userId, type: 'fraud_detected', severity: alert.severity || 'high' };
        await this.sendNotification(payload);
    }
    async sendWebhookAlert(webhookId, error, payload) {
        const alert = {
            type: 'webhook_failure',
            severity: 'high',
            userId: 'system',
            message: `Webhook ${webhookId} failed: ${error}`,
            metadata: { webhookId, payload },
        };
        await this.sendNotification(alert);
    }
    async sendNotification(alert) {
        const channels = this.configService.get('NOTIFICATION_CHANNELS', this.defaultChannels);
        if (alert.severity === 'critical' || alert.severity === 'high') {
            if (channels.slack) {
                await this.sendSlackAlert(alert);
            }
        }
        if (channels.email) {
            await this.sendEmailNotification(alert);
        }
        if (alert.severity === 'critical' && channels.sms) {
            await this.sendSMSForAlert(alert);
        }
        if (channels.push) {
            await this.sendPushNotification(alert);
        }
    }
    async sendWebhookAlertForNotification(alert) {
        const webhookUrl = this.configService.get('ALERT_WEBHOOK_URL');
        if (!webhookUrl) {
            this.logger.warn('No webhook URL configured for alerts');
            return;
        }
        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.configService.get('ALERT_WEBHOOK_SECRET') || ''}`,
                },
                body: JSON.stringify({
                    ...alert,
                    timestamp: new Date().toISOString(),
                }),
            });
            if (!response.ok) {
                this.logger.error(`Failed to send webhook alert: ${response.statusText}`);
            }
        }
        catch (error) {
            this.logger.error('Webhook alert failed:', error);
        }
    }
    async sendSlackAlert(alert) {
        const slackWebhook = this.configService.get('SLACK_WEBHOOK_URL');
        if (!slackWebhook) {
            this.logger.warn('No Slack webhook URL configured');
            return;
        }
        const color = {
            low: 'good',
            medium: 'warning',
            high: 'danger',
            critical: 'danger',
        }[alert.severity];
        try {
            await fetch(slackWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attachments: [{
                            color,
                            title: `Payment Alert: ${alert.type}`,
                            text: alert.message,
                            fields: [
                                { title: 'User ID', value: alert.userId, short: true },
                                { title: 'Order ID', value: alert.orderId || 'N/A', short: true },
                                { title: 'Payment ID', value: alert.paymentId || 'N/A', short: true },
                                { title: 'Amount', value: alert.amount ? `$${alert.amount}` : 'N/A', short: true },
                                { title: 'Severity', value: alert.severity, short: true },
                            ],
                            ts: Math.floor(Date.now() / 1000),
                        }],
                }),
            });
        }
        catch (error) {
            this.logger.error('Slack alert failed:', error);
        }
    }
    async sendEmailNotification(alert) {
        const sendgridKey = this.configService.get('SENDGRID_API_KEY');
        const adminEmail = this.configService.get('ADMIN_ALERT_EMAIL');
        if (!sendgridKey || !adminEmail) {
            this.logger.warn('SendGrid not configured for email alerts');
            return;
        }
        try {
            const subject = `[${alert.severity.toUpperCase()}] Payment ${alert.type} - ${alert.userId}`;
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sendgridKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: adminEmail }], subject }],
                    from: { email: 'alerts@spicegarden.com' },
                    content: [{ type: 'text/plain', value: alert.message }],
                }),
            });
            if (!response.ok) {
                this.logger.error(`Failed to send email alert: ${response.statusText}`);
            }
        }
        catch (error) {
            this.logger.error('Email alert failed:', error);
        }
    }
    async sendSMSForAlert(alert) {
        const accountSid = this.configService.get('TWILIO_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const adminPhone = this.configService.get('ADMIN_ALERT_PHONE');
        if (!accountSid || !authToken || !adminPhone) {
            this.logger.warn('Twilio not configured for SMS alerts');
            return;
        }
        try {
            await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    From: adminPhone,
                    To: adminPhone,
                    Body: `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`,
                }),
            });
        }
        catch (error) {
            this.logger.error('SMS alert failed:', error);
        }
    }
    async sendPushNotification(alert) {
        this.logger.log(`Push notification queued for ${alert.userId}: ${alert.type} - ${alert.severity}`);
    }
};
exports.ProductionNotificationService = ProductionNotificationService;
exports.ProductionNotificationService = ProductionNotificationService = ProductionNotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ProductionNotificationService);
//# sourceMappingURL=production-notification.service.js.map