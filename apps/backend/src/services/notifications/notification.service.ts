import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeviceEntity } from '../../db/entities/user-device.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(UserDeviceEntity)
    private readonly userDeviceRepo: Repository<UserDeviceEntity>,
  ) {}

  async registerDevice(userId: string, fcmToken: string, deviceInfo: { name?: string; type?: string; userAgent?: string; ip?: string }) {
    const existing = await this.userDeviceRepo.findOne({ where: { userId, fcmToken } });
    if (existing) {
      await this.userDeviceRepo.update(existing.id, { isActive: true, ...deviceInfo });
      return existing;
    }
    const device = this.userDeviceRepo.create({
      userId,
      fcmToken,
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ip,
    });
    return this.userDeviceRepo.save(device);
  }

  async unregisterDevice(userId: string, fcmToken: string) {
    await this.userDeviceRepo.update({ userId, fcmToken }, { isActive: false });
  }

  async sendPush(userId: string, title: string, body: string, data?: any) {
    const fcmKey = this.configService.get<string>('FCM_SERVER_KEY');
    if (!fcmKey) {
      this.logger.warn(`FCM not configured - push to ${userId}: ${title}`);
      return { success: false, reason: 'FCM not configured' };
    }

    const devices = await this.userDeviceRepo.find({ where: { userId, isActive: true } });
    if (devices.length === 0) {
      return { success: false, reason: 'No active devices' };
    }

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registration_ids: devices.map(d => d.fcmToken).filter(Boolean),
          notification: { title, body },
          data: data || {},
        }),
      });

      const result = await response.json();
      this.logger.log(`FCM response for user ${userId}: ${JSON.stringify(result)}`);
      return { success: true, result };
    } catch (error) {
      this.logger.error(`FCM send failed for user ${userId}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendSMS(phone: string, message: string) {
    const accountSid = this.configService.get<string>('TWILIO_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromPhone = this.configService.get<string>('TWILIO_PHONE');

    if (!accountSid || !authToken || !fromPhone) {
      this.logger.warn(`Twilio not configured - SMS to ${phone}: ${message}`);
      return { success: false, reason: 'Twilio not configured' };
    }

    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromPhone,
          To: phone,
          Body: message,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Twilio API error');
      }

      this.logger.log(`SMS sent to ${phone}`);
      return { success: true, sid: result.sid };
    } catch (error) {
      this.logger.error(`SMS send failed to ${phone}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendEmail(email: string, subject: string, template: string, context: any) {
    const sendgridKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!sendgridKey) {
      this.logger.warn(`SendGrid not configured - email to ${email}: ${subject}`);
      return { success: false, reason: 'SendGrid not configured' };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }], subject, dynamic_template_data: context }],
          from: { email: 'noreply@spicegarden.com' },
          template_id: template,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      this.logger.log(`Email sent to ${email}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Email send failed to ${email}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async notifyOrderUpdate(userId: string, orderId: string, status: string, phone?: string) {
    const message = `Your order #${orderId} is now ${status}`;
    await this.sendPush(userId, 'Order Update', message, { orderId, status });

    if (status === 'delivered' && phone) {
      await this.sendSMS(phone, message);
    }
  }
}