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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueueController = void 0;
const common_1 = require("@nestjs/common");
let NotificationQueueController = class NotificationQueueController {
};
exports.NotificationQueueController = NotificationQueueController;
exports.NotificationQueueController = NotificationQueueController = __decorate([
    (0, common_1.Controller)('notification-queue')
], NotificationQueueController);
class NotificationQueueController {
    constructor(notificationQueueService) {
        this.notificationQueueService = notificationQueueService;
    }
    async queueNotification(body) {
        return await this.notificationQueueService.queueNotification(body.recipientId, body.recipientType, body.notificationType, body.payload, body.provider, {
            maxAttempts: body.maxAttempts,
            callbackUrl: body.callbackUrl,
            metadata: body.metadata
        });
    }
    async getNotificationById(id) {
        return await this.notificationQueueService.getNotificationById(id);
    }
    async getNotificationsByStatus(status) {
        if (status) {
            return await this.notificationQueueService.getNotificationsByStatus(status);
        }
        return await this.notificationQueueService.getNotificationsByStatus(null);
    }
    async getNotificationsForRecipient(recipientId, recipientType) {
        return await this.notificationQueueService.getNotificationsForRecipient(recipientId, recipientType);
    }
    async cancelNotification(id) {
        await this.notificationQueueService.cancelNotification(id);
        return { success: true };
    }
    async getNotificationStats() {
        return await this.notificationQueueService.getNotificationStats();
    }
    async processNotificationQueue() {
        await this.notificationQueueService.processNotificationQueue();
        return { success: true };
    }
}
exports.NotificationQueueController = NotificationQueueController;
__decorate([
    (0, common_1.Post)('queue'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Queue a notification for reliable delivery' }),
    ApiResponse({ status: 200, description: 'Notification queued successfully' }),
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                recipientId: { type: 'string' },
                recipientType: { type: 'string', enum: ['user', 'device', 'email', 'phone'] },
                notificationType: { type: 'string', enum: ['push', 'sms', 'email', 'apns'] },
                payload: { type: 'object' },
                provider: { type: 'string', enum: ['fcm', 'twilio', 'sendgrid', 'apns'] },
                maxAttempts: { type: 'number' },
                callbackUrl: { type: 'string' },
                metadata: { type: 'object' }
            },
            required: ['recipientId', 'recipientType', 'notificationType', 'payload', 'provider']
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "queueNotification", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Get notification by ID' }),
    ApiResponse({ status: 200, description: 'Notification retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Notification not found' }),
    ApiParam({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "getNotificationById", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Get notifications by status' }),
    ApiResponse({ status: 200, description: 'Notifications retrieved successfully' }),
    ApiQuery({ name: 'status', type: 'string', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "getNotificationsByStatus", null);
__decorate([
    (0, common_1.Get)('recipient/:recipientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Get notifications for a recipient' }),
    ApiResponse({ status: 200, description: 'Notifications retrieved successfully' }),
    ApiParam({ name: 'recipientId', type: 'string' }),
    ApiQuery({ name: 'recipientType', type: 'string', required: true }),
    __param(0, (0, common_1.Param)('recipientId')),
    __param(1, (0, common_1.Query)('recipientType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "getNotificationsForRecipient", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Cancel a notification' }),
    ApiResponse({ status: 200, description: 'Notification cancelled successfully' }),
    ApiParam({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "cancelNotification", null);
__decorate([
    (0, common_1.Get)('stats/overview'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Get notification statistics' }),
    ApiResponse({ status: 200, description: 'Notification statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Post)('process'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    ApiOperation({ summary: 'Process the notification queue' }),
    ApiResponse({ status: 200, description: 'Notification queue processed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationQueueController.prototype, "processNotificationQueue", null);
//# sourceMappingURL=notification-queue.controller.js.map