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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_device_entity_1 = require("../../db/entities/user-device.entity");
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(configService, userDeviceRepo) {
        this.configService = configService;
        this.userDeviceRepo = userDeviceRepo;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async registerDevice(userId, fcmToken, deviceInfo) {
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
    async unregisterDevice(userId, fcmToken) {
        await this.userDeviceRepo.update({ userId, fcmToken }, { isActive: false });
    }
    async sendPush(userId, title, body, data) {
        const fcmKey = this.configService.get('FCM_SERVER_KEY');
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
        }
        catch (error) {
            this.logger.error(`FCM send failed for user ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }
    async sendSMS(phone, message) {
        const accountSid = this.configService.get('TWILIO_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const fromPhone = this.configService.get('TWILIO_PHONE');
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
        }
        catch (error) {
            this.logger.error(`SMS send failed to ${phone}:`, error);
            return { success: false, error: error.message };
        }
    }
    async sendEmail(email, subject, template, context) {
        const sendgridKey = this.configService.get('SENDGRID_API_KEY');
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
        }
        catch (error) {
            this.logger.error(`Email send failed to ${email}:`, error);
            return { success: false, error: error.message };
        }
    }
    async notifyOrderUpdate(userId, orderId, status, phone) {
        const message = `Your order #${orderId} is now ${status}`;
        await this.sendPush(userId, 'Order Update', message, { orderId, status });
        if (status === 'delivered' && phone) {
            await this.sendSMS(phone, message);
        }
    }
    async sendOTP(phone, otp) {
        const message = `Your SpiceGarden verification code is: ${otp}. Valid for 5 minutes.`;
        return this.sendSMS(phone, message);
    }
    async sendAPNs(userId, title, body, data) {
        const apnsKey = this.configService.get('APNS_PRIVATE_KEY');
        const apnsKeyId = this.configService.get('APNS_KEY_ID');
        const apnsTeamId = this.configService.get('APNS_TEAM_ID');
        if (!apnsKey || !apnsKeyId || !apnsTeamId) {
            this.logger.warn(`APNs not configured - push to ${userId}: ${title}`);
            return { success: false, reason: 'APNs not configured' };
        }
        const devices = await this.userDeviceRepo.find({
            where: { userId, isActive: true },
        });
        const apnsTokens = devices.filter(d => d.apnsToken).map(d => d.apnsToken);
        if (apnsTokens.length === 0) {
            return { success: false, reason: 'No active iOS devices' };
        }
        try {
            const payload = {
                aps: { aison: true, alert: { title, body }, sound: 'default' },
                ...(data || {}),
            };
            this.logger.log(`APNs notification would be sent for user ${userId}: ${JSON.stringify(payload)}`);
            return { success: true, sent: apnsTokens.length };
        }
        catch (error) {
            this.logger.error(`APNs send failed for user ${userId}:`, error);
            return { success: false, error: error.message };
        }
    }
    async notifyDeliveryLifecycle(orderId, event, userId, driverInfo) {
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
    async notifyRestaurant(orderId, alertType, restaurantId) {
        const messages = {
            new_order: `New order #${orderId} received.`,
            order_cancelled: `Order #${orderId} was cancelled.`,
            order_delayed: `Order #${orderId} is delayed.`,
        };
        this.logger.log(`Restaurant alert: ${messages[alertType]}`);
        return { success: true, alertType };
    }
    async notifyDriver(driverId, orderId, event) {
        const messages = {
            assigned: `New delivery assigned #${orderId}. Tap to view details.`,
            reassigned: `You have a reassignment for order #${orderId}.`,
        };
        this.logger.log(`Driver notification: ${messages[event]}`);
        return { success: true, event };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_device_entity_1.UserDeviceEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], NotificationService);
//# sourceMappingURL=notification.service.js.map