import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ProductionNotificationService {
  private readonly logger = new Logger(ProductionNotificationService.name);

  private readonly defaultChannels: ProductionNotificationConfig = {
    email: true,
    sms: false,
    push: true,
    webhook: false,
  };

  constructor(private configService: ConfigService) {}

  async sendPaymentNotification(
    userId: string,
    paymentId: string,
    alert: Omit<AlertPayload, 'userId' | 'paymentId'>
  ): Promise<void> {
    const payload: AlertPayload = { ...alert, userId, paymentId };
    await this.sendNotification(payload);
  }

  async sendOrderNotification(
    userId: string,
    orderId: string,
    alert: Omit<AlertPayload, 'userId' | 'orderId'>
  ): Promise<void> {
    const payload: AlertPayload = { ...alert, userId, orderId };
    await this.sendNotification(payload);
  }

  async sendFraudAlert(
    userId: string,
    alert: Omit<AlertPayload, 'userId' | 'type'>
  ): Promise<void> {
    const payload: AlertPayload = { ...alert, userId, type: 'fraud_detected', severity: alert.severity || 'high' };
    await this.sendNotification(payload);
  }

  async sendWebhookAlert(
    webhookId: string,
    error: string,
    payload: any
  ): Promise<void> {
    const alert: AlertPayload = {
      type: 'webhook_failure',
      severity: 'high',
      userId: 'system',
      message: `Webhook ${webhookId} failed: ${error}`,
      metadata: { webhookId, payload },
    };
    await this.sendNotification(alert);
  }

  private async sendNotification(alert: AlertPayload): Promise<void> {
    const channels = this.configService.get<ProductionNotificationConfig>('NOTIFICATION_CHANNELS', this.defaultChannels);

    if (alert.severity === 'critical' || alert.severity === 'high') {
      if (channels.webhook) {
        await this.sendWebhookAlert(alert);
      }
      if (channels.slack) {
        await this.sendSlackAlert(alert);
      }
    }

    if (channels.email) {
      await this.sendEmailNotification(alert);
    }

    if (alert.severity === 'critical' && channels.sms) {
      await this.sendSMSNotification(alert);
    }

    if (channels.push) {
      await this.sendPushNotification(alert);
    }
  }

  private async sendWebhookAlert(alert: AlertPayload): Promise<void> {
    const webhookUrl = this.configService.get<string>('ALERT_WEBHOOK_URL');
    if (!webhookUrl) {
      this.logger.warn('No webhook URL configured for alerts');
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.configService.get<string>('ALERT_WEBHOOK_SECRET') || ''}`,
        },
        body: JSON.stringify({
          ...alert,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        this.logger.error(`Failed to send webhook alert: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Webhook alert failed:', error);
    }
  }

  private async sendSlackAlert(alert: AlertPayload): Promise<void> {
    const slackWebhook = this.configService.get<string>('SLACK_WEBHOOK_URL');
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
    } catch (error) {
      this.logger.error('Slack alert failed:', error);
    }
  }

  private async sendEmailNotification(alert: AlertPayload): Promise<void> {
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    const adminEmail = this.configService.get<string>('ADMIN_ALERT_EMAIL');

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
    } catch (error) {
      this.logger.error('Email alert failed:', error);
    }
  }

  private async sendSMSNotification(alert: AlertPayload): Promise<void> {
    const accountSid = this.configService.get<string>('TWILIO_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const adminPhone = this.configService.get<string>('ADMIN_ALERT_PHONE');

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
    } catch (error) {
      this.logger.error('SMS alert failed:', error);
    }
  }

  private async sendPushNotification(alert: AlertPayload): Promise<void> {
    this.logger.log(`Push notification queued for ${alert.userId}: ${alert.type} - ${alert.severity}`);
  }
}