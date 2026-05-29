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
    if (!fcmKey || fcmKey.includes('CHANGE_ME')) {
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
    if (!sendgridKey || sendgridKey.includes('CHANGE_ME')) {
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

  async sendOTP(phone: string, otp: string) {
    const message = `Your SpiceGarden verification code is: ${otp}. Valid for 5 minutes.`;
    return this.sendSMS(phone, message);
  }

  async sendAPNs(userId: string, title: string, body: string, data?: any) {
    const apnsKey = this.configService.get<string>('APNS_PRIVATE_KEY');
    const apnsKeyId = this.configService.get<string>('APNS_KEY_ID');
    const apnsTeamId = this.configService.get<string>('APNS_TEAM_ID');
    const apnsBundleId = this.configService.get<string>('APNS_BUNDLE_ID');
    const apnsEnv = this.configService.get<string>('APNS_ENVIRONMENT') || 'production';

    if (!apnsKey || apnsKey.includes('CHANGE_ME') || !apnsKeyId || !apnsTeamId || !apnsBundleId) {
      this.logger.warn(`APNs not configured - push to ${userId}: ${title}`);
      return { success: false, reason: 'APNs not configured' };
    }

    const devices = await this.userDeviceRepo.find({
      where: { userId, isActive: true },
    });
    const apnsTokens = devices.filter(d => d.apnsToken).map(d => d.apnsToken!);

    if (apnsTokens.length === 0) {
      return { success: false, reason: 'No active iOS devices' };
    }

    try {
      const token = this.generateJWT(apnsKeyId, apnsTeamId, apnsKey);
      const results = [];
      
      // Use correct APNs endpoint based on environment
      const apnsHost = apnsEnv === 'development' 
        ? 'api.development.push.apple.com' 
        : 'api.push.apple.com';

      for (const deviceToken of apnsTokens) {
        const payload = {
          aps: {
            alert: { title, body },
            sound: 'default',
          },
          ...(data || {}),
        };

        const response = await fetch(`https://${apnsHost}/3/device/${deviceToken}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'apns-topic': apnsBundleId,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`APNs failed for token ${deviceToken.substring(0, 8)}...: ${response.status} ${error}`);
          results.push({ token: deviceToken.substring(0, 8), success: false, error });
        } else {
          results.push({ token: deviceToken.substring(0, 8), success: true });
        }
      }

      const successCount = results.filter(r => r.success).length;
      this.logger.log(`APNs: ${successCount}/${apnsTokens.length} notifications sent to user ${userId}`);
      return { success: successCount > 0, sent: successCount, results };
    } catch (error) {
      this.logger.error(`APNs send failed for user ${userId}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  private generateJWT(keyId: string, teamId: string, privateKey: string): string {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '1 hour',
      audience: 'appstoreconnect-v1',
      issuer: teamId,
      keyid: keyId,
    });
    return token;
  }

  async notifyDeliveryLifecycle(orderId: string, event: 'driver_assigned' | 'picked_up' | 'nearby' | 'delivered', userId: string, driverInfo?: any) {
    const messages = {
      driver_assigned: `Driver ${driverInfo?.name || 'assigned'} is on the way!`,
      picked_up: `Your order #${orderId} has been picked up.`,
      nearby: `Your order #${orderId} is nearby. Driver arrives in ~${driverInfo?.eta || 5} mins.`,
      delivered: `Your order #${orderId} has been delivered. Enjoy!`,
    };

    const phone = driverInfo?.phone;
    await this.sendPush(userId, 'Order Update', messages[event], { orderId, event });
    if (phone) {
      await this.sendSMS(phone, messages[event]);
    }
  }

  async notifyRestaurant(orderId: string, alertType: 'new_order' | 'order_cancelled' | 'order_delayed', restaurantId: string) {
    const messages = {
      new_order: `New order #${orderId} received.`,
      order_cancelled: `Order #${orderId} was cancelled.`,
      order_delayed: `Order #${orderId} is delayed.`,
    };

    this.logger.log(`Restaurant alert: ${messages[alertType]}`);
    return { success: true, alertType };
  }

  async notifyDriver(driverId: string, orderId: string, event: 'assigned' | 'reassigned') {
    const messages = {
      assigned: `New delivery assigned #${orderId}. Tap to view details.`,
      reassigned: `You have a reassignment for order #${orderId}.`,
    };

    this.logger.log(`Driver notification: ${messages[event]}`);
    return { success: true, event };
  }
}