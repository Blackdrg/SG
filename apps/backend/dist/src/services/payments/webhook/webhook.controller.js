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
exports.PaymentWebhookController = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
const config_1 = require("@nestjs/config");
let PaymentWebhookController = class PaymentWebhookController {
    constructor(webhookService, configService) {
        this.webhookService = webhookService;
        this.configService = configService;
    }
    async handleWebhook(req, signature) {
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
        return await this.webhookService.processWebhook(rawBody, signature);
    }
    async getWebhookStats() {
        return await this.webhookService.getWebhookStats();
    }
};
exports.PaymentWebhookController = PaymentWebhookController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "getWebhookStats", null);
exports.PaymentWebhookController = PaymentWebhookController = __decorate([
    (0, common_1.Controller)('payments/webhook'),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService,
        config_1.ConfigService])
], PaymentWebhookController);
//# sourceMappingURL=webhook.controller.js.map