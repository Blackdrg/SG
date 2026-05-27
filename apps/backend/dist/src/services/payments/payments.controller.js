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
const payment_hardening_service_1 = require("./payment-hardening.service");
const retry_service_1 = require("./retry.service");
const fraud_hardening_service_1 = require("./fraud-hardening.service");
const idempotency_service_1 = require("./idempotency.service");
const config_1 = require("@nestjs/config");
let PaymentsController = class PaymentsController {
    constructor(paymentService, paymentHardening, retryService, fraudHardening, idempotency, configService) {
        this.paymentService = paymentService;
        this.paymentHardening = paymentHardening;
        this.retryService = retryService;
        this.fraudHardening = fraudHardening;
        this.idempotency = idempotency;
        this.configService = configService;
    }
    async createPaymentIntent(body, idempotencyKey) {
        const fraudCheck = await this.fraudHardening.checkPaymentFraud({
            userId: body.userId,
            amount: body.amount,
            ipAddress: body.ipAddress,
            userAgent: body.userAgent,
        });
        if (!fraudCheck.allowed) {
            return {
                error: 'Payment blocked due to fraud risk',
                reasons: fraudCheck.reasons,
                riskScore: fraudCheck.riskScore,
            };
        }
        const retryResult = await this.retryService.executeWithRetry(async () => {
            if (idempotencyKey) {
                const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'create_payment_intent', body.userId, { amount: body.amount, currency: body.currency });
                if (existing.isDuplicate) {
                    return existing.response;
                }
            }
            const intent = await this.paymentService.createPaymentIntent(body.amount, body.currency || 'usd', body.userId, { orderId: body.orderId, paymentMethodId: body.paymentMethodId });
            if (idempotencyKey) {
                await this.idempotency.complete(idempotencyKey, 'create_payment_intent', intent);
            }
            return intent;
        }, 'create_payment_intent', { userId: body.userId, orderId: body.orderId });
        if (!retryResult.success) {
            throw new common_1.BadRequestException(retryResult.error?.message);
        }
        return { clientSecret: retryResult.result?.client_secret };
    }
    async refund(body, idempotencyKey) {
        const retryResult = await this.retryService.executeWithRetry(async () => {
            if (idempotencyKey) {
                const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'refund_payment', body.userId, { paymentIntentId: body.paymentIntentId, amount: body.amount });
                if (existing.isDuplicate) {
                    return existing.response;
                }
            }
            const refund = await this.paymentService.refundPayment(body.paymentIntentId, body.amount, body.userId, body.reason);
            if (idempotencyKey) {
                await this.idempotency.complete(idempotencyKey, 'refund_payment', refund);
            }
            return refund;
        }, 'refund_payment', { userId: body.userId, paymentId: body.paymentIntentId });
        if (!retryResult.success) {
            throw new common_1.BadRequestException(retryResult.error?.message);
        }
        return retryResult.result;
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentService,
        payment_hardening_service_1.PaymentHardeningService,
        retry_service_1.RetryService,
        fraud_hardening_service_1.FraudHardeningService,
        idempotency_service_1.IdempotencyService,
        config_1.ConfigService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map