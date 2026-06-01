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
const swagger_1 = require("@nestjs/swagger");
let PaymentsController = class PaymentsController {
    constructor(paymentService, paymentHardening, retryService, fraudHardening, idempotency, configService) {
        this.paymentService = paymentService;
        this.paymentHardening = paymentHardening;
        this.retryService = retryService;
        this.fraudHardening = fraudHardening;
        this.idempotency = idempotency;
        this.configService = configService;
    }
    async createPaymentIntent(body, req, idempotencyKey, gateway) {
        const fraudCheck = await this.fraudHardening.checkPaymentFraud({
            userId: body.userId,
            amount: body.amount,
            ipAddress: req.ip || req.connection.remoteAddress || '0.0.0.0',
            userAgent: req.get('User-Agent') || 'Unknown',
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
            const intent = await this.paymentService.createPaymentIntent(body.amount, body.currency || 'usd', body.userId, { orderId: body.orderId, paymentMethodId: body.paymentMethodId }, req, gateway);
            if (idempotencyKey) {
                await this.idempotency.complete(idempotencyKey, 'create_payment_intent', intent);
            }
            return intent;
        }, 'create_payment_intent', { userId: body.userId, orderId: body.orderId });
        if (!retryResult.success) {
            throw new common_1.BadRequestException(retryResult.error?.message);
        }
        return {
            clientSecret: retryResult.result?.client_secret || retryResult.result?.id,
            gateway: gateway || this.configService.get('PAYMENT_PRIMARY_GATEWAY', 'stripe')
        };
    }
    async refund(body, idempotencyKey, gateway) {
        const retryResult = await this.retryService.executeWithRetry(async () => {
            if (idempotencyKey) {
                const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'refund_payment', body.userId, { paymentIntentId: body.paymentIntentId, amount: body.amount });
                if (existing.isDuplicate) {
                    return existing.response;
                }
            }
            const refund = await this.paymentService.refundPayment(body.paymentIntentId, body.amount, body.userId, body.reason, undefined, gateway);
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
    getAvailableGateways() {
        return ['stripe', 'razorpay'];
    }
    getGatewayConfig() {
        return {
            primaryGateway: this.configService.get('PAYMENT_PRIMARY_GATEWAY', 'stripe'),
            availableGateways: ['stripe', 'razorpay'],
            stripeEnabled: !!this.configService.get('STRIPE_SECRET_KEY'),
            razorpayEnabled: !!this.configService.get('RAZORPAY_KEY_ID')
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Create a payment intent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment intent created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-idempotency-key')),
    __param(3, (0, common_1.Query)('gateway')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('refund'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Refund processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-idempotency-key')),
    __param(2, (0, common_1.Query)('gateway')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refund", null);
__decorate([
    (0, common_1.Get)('gateways'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get available payment gateways' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of available payment gateways' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getAvailableGateways", null);
__decorate([
    (0, common_1.Get)('gateway/config'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment gateway configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment gateway configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getGatewayConfig", null);
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