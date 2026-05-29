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
var NotificationQueueService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
let NotificationQueueService = NotificationQueueService_1 = class NotificationQueueService {
    constructor(notificationRepo, configService, notificationService, queueService) {
        this.notificationRepo = notificationRepo;
        this.configService = configService;
        this.notificationService = notificationService;
        this.queueService = queueService;
        this.logger = new common_1.Logger(NotificationQueueService_1.name);
    }
    async queueNotification(recipientId, recipientType, notificationType, payload, provider, options = {}) {
        const notification = this.notificationRepo.create({
            recipientId,
            recipientType,
            notificationType,
            payload,
            provider,
            status: module_3.NotificationStatus.PENDING,
            maxAttempts: options.maxAttempts || 3,
            callbackUrl: options.callbackUrl,
            metadata: options.metadata || {},
        });
        const savedNotification = await this.notificationRepo.save(notification);
        await this.processNotificationQueue();
        return savedNotification;
    }
    async processNotificationQueue() {
        const notifications = await this.notificationRepo.find({
            where: [
                { status: module_3.NotificationStatus.PENDING },
                { status: module_3.NotificationStatus.RETRYING, nextAttemptAt: (0, typeorm_2.LessThanOrEqual)(new Date()) }
            ],
            order: { createdAt: 'ASC' },
            take: 10
        });
        for (const notification of notifications) {
            try {
                await this.processNotification(notification);
            }
            catch (error) {
                this.logger.error(Failed, to, process, notification, error);
            }
        }
    }
    async processNotification(notification) {
        notification.status = module_3.NotificationStatus.PROCESSING;
        notification.lastAttemptAt = new Date();
        notification.attemptCount += 1;
        await this.notificationRepo.save(notification);
        try {
            let result;
            switch (notification.notificationType) {
                case 'push':
                    if (notification.provider === 'fcm') {
                        result = await this.notificationService.sendPush(notification.recipientId, notification.payload.title, notification.payload.body, notification.payload.data);
                    }
                    else if (notification.provider === 'apns') {
                        result = await this.notificationService.sendAPNs(notification.recipientId, notification.payload.title, notification.payload.body, notification.payload.data);
                    }
                    break;
                case 'sms':
                    if (notification.provider === 'twilio') {
                        result = await this.notificationService.sendSMS(notification.recipientId, notification.payload.body);
                    }
                    break;
                case 'email':
                    if (notification.provider === 'sendgrid') {
                        result = await this.notificationService.sendEmail(notification.recipientId, notification.payload.subject, notification.payload.template, notification.payload.context);
                    }
                    break;
            }
            if (result?.success) {
                notification.status = module_3.NotificationStatus.SENT;
                notification.completedAt = new Date();
                if (notification.callbackUrl) {
                    await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
                        notificationId: notification.id,
                        status: 'sent',
                        url: notification.callbackUrl,
                        data: { result }
                    });
                }
            }
            else {
                throw new Error(result?.error || 'Unknown error');
            }
        }
        catch (error) {
            notification.errorInfo = {
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR',
                providerResponse: error.response || null
            };
            if (notification.attemptCount < (notification.maxAttempts || 3)) {
                notification.status = module_3.NotificationStatus.RETRYING;
                const delayMinutes = Math.pow(2, notification.attemptCount - 1);
                notification.nextAttemptAt = new Date(Date.now() + (delayMinutes * 60 * 1000));
            }
            else {
                notification.status = module_3.NotificationStatus.FAILED;
                notification.completedAt = new Date();
                if (notification.callbackUrl) {
                    await this.queueService.enqueue('NOTIFICATION_CALLBACK', {
                        notificationId: notification.id,
                        status: 'failed',
                        url: notification.callbackUrl,
                        data: { error: notification.errorInfo }
                    });
                }
            }
        }
        finally {
            await this.notificationRepo.save(notification);
        }
    }
    async getNotificationById(id) {
        const notification = await this.notificationRepo.findOne({ where: { id } });
        if (!notification) {
            throw new common_1.NotFoundException(Notification, not, found);
        }
        return notification;
    }
    async getNotificationsByStatus(status) {
        return await this.notificationRepo.find({
            where: { status },
            order: { createdAt: 'DESC' }
        });
    }
    async getNotificationsForRecipient(recipientId, recipientType) {
        return await this.notificationRepo.find({
            where: { recipientId, recipientType },
            order: { createdAt: 'DESC' }
        });
    }
    async cancelNotification(id) {
        const notification = await this.notificationRepo.findOne({ where: { id } });
        if (!notification) {
            throw new common_1.NotFoundException(Notification, not, found);
        }
        notification.status = module_3.NotificationStatus.CANCELLED;
        notification.completedAt = new Date();
        await this.notificationRepo.save(notification);
    }
    async getNotificationStats() {
        const [pending, processing, sent, failed, retrying, cancelled] = await Promise.all([
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.PENDING } }),
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.PROCESSING } }),
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.SENT } }),
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.FAILED } }),
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.RETRYING } }),
            this.notificationRepo.count({ where: { status: module_3.NotificationStatus.CANCELLED } }),
        ]);
        const total = pending + processing + sent + failed + retrying + cancelled;
        return {
            total,
            pending,
            processing,
            sent,
            failed,
            retrying,
            cancelled,
            successRate: total > 0 ? (sent / total) * 100 : 0,
            failureRate: total > 0 ? (failed / total) * 100 : 0
        };
    }
};
exports.NotificationQueueService = NotificationQueueService;
exports.NotificationQueueService = NotificationQueueService = NotificationQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_2.NotificationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof module_1.ConfigService !== "undefined" && module_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof module_4.NotificationService !== "undefined" && module_4.NotificationService) === "function" ? _b : Object, typeof (_c = typeof module_5.QueueService !== "undefined" && module_5.QueueService) === "function" ? _c : Object])
], NotificationQueueService);
//# sourceMappingURL=notification-queue.service.js.map