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
exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
let DeviceController = class DeviceController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async registerDevice(body) {
        const { userId, fcmToken, apnsToken, deviceInfo } = body;
        if (fcmToken) {
            await this.notificationService.registerDevice(userId, fcmToken, deviceInfo);
        }
        if (apnsToken) {
            await this.notificationService.registerDevice(userId, apnsToken, { ...deviceInfo, type: 'ios' });
        }
        return { success: true, message: 'Device registered successfully' };
    }
    async unregisterDevice(body) {
        const { userId, fcmToken, apnsToken } = body;
        if (fcmToken) {
            await this.notificationService.unregisterDevice(userId, fcmToken);
        }
        if (apnsToken) {
            await this.notificationService.unregisterDevice(userId, apnsToken);
        }
        return { success: true, message: 'Device unregistered successfully' };
    }
};
exports.DeviceController = DeviceController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Delete)('unregister'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "unregisterDevice", null);
exports.DeviceController = DeviceController = __decorate([
    (0, common_1.Controller)('devices'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], DeviceController);
//# sourceMappingURL=device.controller.js.map