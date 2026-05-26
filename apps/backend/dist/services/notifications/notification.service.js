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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
let NotificationService = class NotificationService {
    constructor() { }
    async sendPush(userId, title, body, data) {
        console.log(`Sending PUSH to user ${userId}: ${title} - ${body}`);
        return { success: true };
    }
    async sendSMS(phone, message) {
        console.log(`Sending SMS to ${phone}: ${message}`);
        return { success: true };
    }
    async sendEmail(email, subject, template, context) {
        console.log(`Sending EMAIL to ${email}: ${subject}`);
        return { success: true };
    }
    async notifyOrderUpdate(userId, orderId, status) {
        const message = `Your order #${orderId} is now ${status}`;
        await this.sendPush(userId, 'Order Update', message, { orderId, status });
        if (status === 'delivered') {
            await this.sendSMS('user-phone-placeholder', message);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NotificationService);
//# sourceMappingURL=notification.service.js.map