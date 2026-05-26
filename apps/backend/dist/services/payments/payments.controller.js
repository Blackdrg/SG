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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const config_1 = require("@nestjs/config");
const queue_service_1 = require("../../infra/queue/queue.service");
const queues_1 = require("../../shared/contracts/queues");
const order_interface_1 = require("../../shared/domain/order.interface");
let PaymentsController = class PaymentsController {
    constructor(paymentService, configService, queueService) {
        this.paymentService = paymentService;
        this.configService = configService;
        this.queueService = queueService;
    }
    async handleWebhook(sig, req) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event;
        if (!webhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (DEV MODE ONLY)');
            event = req.body;
        }
        else {
            try {
                event = await this.paymentService.constructEvent(req.rawBody, sig, webhookSecret);
            }
            catch (err) {
                throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
            }
        }
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await this.processSuccessfulPayment(paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                console.log(`Payment failed: ${event.data.object.last_payment_error?.message}`);
                break;
        }
        return { received: true };
    }
    async processSuccessfulPayment(paymentIntent) {
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
            await this.queueService.enqueue(queues_1.QUEUE_NAMES.ORDER_LIFECYCLE, {
                orderId,
                status: order_interface_1.OrderStatus.PAYMENT_CONFIRMED,
                transactionId: paymentIntent.id
            });
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('stripe-signature')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentService,
        config_1.ConfigService,
        queue_service_1.QueueService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map