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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const audit_service_1 = require("../../audit/audit.service");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(configService, auditService) {
        this.configService = configService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(PaymentService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}, request = null) {
        try {
            await this.validatePaymentLimits(userId, amount, request);
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: {
                    ...metadata,
                    userId,
                    timestamp: new Date().toISOString()
                }
            });
            await this.auditService.logPaymentEvent('payment_intent_created', userId, amount, currency, 'stripe', paymentIntent.id, true, request);
            return paymentIntent;
        }
        catch (error) {
            await this.auditService.logPaymentEvent('payment_intent_failed', userId, amount, currency, 'stripe', null, false, request, error.message);
            this.logger.error('Payment intent creation failed:', error);
            throw error;
        }
    }
    async validatePaymentLimits(userId, amount, request) {
        const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
        if (amount > maxSingleAmount) {
            throw new common_1.BadRequestException(`Payment amount exceeds maximum allowed: $${maxSingleAmount}`);
        }
        if (amount <= 0) {
            throw new common_1.BadRequestException('Payment amount must be greater than zero');
        }
        if (userId) {
            const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
        }
        await this.checkSuspiciousPatterns(userId, amount, request);
    }
    async checkSuspiciousPatterns(userId, amount, request) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (userId) {
        }
    }
    async constructEvent(payload, sig, secret) {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, sig, secret);
            const stripeObject = event.data.object;
            await this.auditService.logPaymentEvent('webhook_received', stripeObject.metadata?.userId || 'unknown', stripeObject.amount / 100, stripeObject.currency, 'stripe', stripeObject.id, true, null);
            return event;
        }
        catch (error) {
            this.logger.error('Webhook verification failed:', error);
            throw error;
        }
    }
    async confirmPayment(paymentId, userId, request = null) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            if (paymentIntent.status === 'succeeded') {
                await this.auditService.logPaymentEvent('payment_confirmed', userId, paymentIntent.amount / 100, paymentIntent.currency, 'stripe', paymentId, true, request);
                return paymentIntent;
            }
            else {
                await this.auditService.logPaymentEvent('payment_failed', userId, paymentIntent.amount / 100, paymentIntent.currency, 'stripe', paymentId, false, request, `Payment status: ${paymentIntent.status}`);
                throw new common_1.BadRequestException(`Payment not successful: ${paymentIntent.status}`);
            }
        }
        catch (error) {
            this.logger.error('Payment confirmation failed:', error);
            throw error;
        }
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer', request = null) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            const refundAmount = amount ?? (paymentIntent.amount / 100);
            const maxRefund = paymentIntent.amount / 100;
            if (refundAmount > maxRefund) {
                throw new common_1.BadRequestException(`Refund amount cannot exceed original payment: $${maxRefund}`);
            }
            if (refundAmount <= 0) {
                throw new common_1.BadRequestException('Refund amount must be greater than zero');
            }
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentId,
                amount: Math.round(refundAmount * 100),
                reason: reason
            });
            await this.auditService.logPaymentEvent('payment_refunded', userId, refund.amount / 100, paymentIntent.currency, 'stripe', paymentId, true, request, `Reason: ${reason}`);
            return refund;
        }
        catch (error) {
            this.logger.error('Payment refund failed:', error);
            await this.auditService.logPaymentEvent('payment_refund_failed', userId, amount || 0, 'usd', 'stripe', paymentId, false, request, error.message);
            throw error;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_service_1.AuditService])
], PaymentService);
//# sourceMappingURL=payments.service.js.map