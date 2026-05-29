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
var StripeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
let StripeGateway = StripeGateway_1 = class StripeGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StripeGateway_1.name);
        this.stripe = new stripe_1.Stripe(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                metadata: {
                    ...metadata,
                    userId,
                    timestamp: new Date().toISOString()
                }
            });
            return paymentIntent;
        }
        catch (error) {
            this.logger.error('Stripe payment intent creation failed:', error);
            throw error;
        }
    }
    async confirmPayment(paymentId, userId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            if (paymentIntent.status === 'succeeded') {
                return paymentIntent;
            }
            else {
                throw new common_1.BadRequestException(Payment, not, successful);
            }
        }
        catch (error) {
            this.logger.error('Stripe payment confirmation failed:', error);
            throw error;
        }
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            const refundAmount = amount ?? (paymentIntent.amount / 100);
            const maxRefund = paymentIntent.amount / 100;
            if (refundAmount > maxRefund) {
                throw new common_1.BadRequestException(Refund, amount, cannot, exceed, original, payment, { maxRefund });
            }
            if (refundAmount <= 0) {
                throw new common_1.BadRequestException('Refund amount must be greater than zero');
            }
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentId,
                amount: Math.round(refundAmount * 100),
                reason: reason
            });
            return refund;
        }
        catch (error) {
            this.logger.error('Stripe payment refund failed:', error);
            throw error;
        }
    }
    async constructEvent(payload, signature, secret) {
        try {
            const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
            return event;
        }
        catch (error) {
            this.logger.error('Stripe webhook verification failed:', error);
            throw error;
        }
    }
    getGatewayName() {
        return 'stripe';
    }
};
exports.StripeGateway = StripeGateway;
exports.StripeGateway = StripeGateway = StripeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StripeGateway);
//# sourceMappingURL=stripe-gateway.service.js.map