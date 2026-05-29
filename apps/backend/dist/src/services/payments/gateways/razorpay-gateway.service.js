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
var RazorpayGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RazorpayGateway = RazorpayGateway_1 = class RazorpayGateway {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RazorpayGateway_1.name);
        this.keyId = this.configService.get('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
        this.keySecret = this.configService.get('RAZORPAY_KEY_SECRET') || 'test_placeholder';
    }
    async razorpayRequest(method, endpoint, data = {}) {
        try {
            const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
            const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
                method,
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: method !== 'GET' ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.description || `Razorpay API error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            this.logger.error(`Razorpay API request failed: ${endpoint}`, error);
            throw error;
        }
    }
    async createPaymentIntent(amount, currency = 'inr', userId = null, metadata = {}) {
        try {
            const amountInPaise = Math.round(amount * 100);
            const paymentData = {
                amount: amountInPaise,
                currency: currency.toLowerCase(),
                receipt: `receipt_${Date.now()}_${userId || 'guest'}`,
                notes: {
                    ...metadata,
                    userId,
                    timestamp: new Date().toISOString()
                }
            };
            const payment = await this.razorpayRequest('POST', 'orders', paymentData);
            return {
                id: payment.id,
                amount: payment.amount / 100,
                currency: payment.currency,
                status: payment.status,
                client_secret: payment.id
            };
        }
        catch (error) {
            this.logger.error('Razorpay payment intent creation failed:', error);
            throw error;
        }
    }
    async confirmPayment(paymentId, userId) {
        try {
            const order = await this.razorpayRequest('GET', `orders/${paymentId}`);
            if (order.status === 'paid' || order.status === 'captured') {
                return {
                    id: order.id,
                    amount: order.amount / 100,
                    currency: order.currency,
                    status: order.status
                };
            }
            else {
                throw new common_1.BadRequestException(`Payment not successful: ${order.status}`);
            }
        }
        catch (error) {
            this.logger.error('Razorpay payment confirmation failed:', error);
            throw error;
        }
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
        try {
            const order = await this.razorpayRequest('GET', `orders/${paymentId}`);
            const paymentIdToRefund = order.payments?.items?.[0]?.id || paymentId;
            const refundAmount = amount ?? (order.amount / 100);
            const maxRefund = order.amount / 100;
            if (refundAmount > maxRefund) {
                throw new common_1.BadRequestException(`Refund amount cannot exceed original amount: ${maxRefund}`);
            }
            if (refundAmount <= 0) {
                throw new common_1.BadRequestException('Refund amount must be greater than zero');
            }
            const refundData = {
                amount: Math.round(refundAmount * 100),
                notes: {
                    reason,
                    userId
                }
            };
            const refund = await this.razorpayRequest('POST', `payments/${paymentIdToRefund}/refund`, refundData);
            return {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status
            };
        }
        catch (error) {
            this.logger.error('Razorpay payment refund failed:', error);
            throw error;
        }
    }
    async constructEvent(payload, signature, secret) {
        try {
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload.toString())
                .digest('hex');
            if (expectedSignature !== signature) {
                throw new Error('Invalid webhook signature');
            }
            return JSON.parse(payload.toString());
        }
        catch (error) {
            this.logger.error('Razorpay webhook verification failed:', error);
            throw error;
        }
    }
    getGatewayName() {
        return 'razorpay';
    }
};
exports.RazorpayGateway = RazorpayGateway;
exports.RazorpayGateway = RazorpayGateway = RazorpayGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayGateway);
//# sourceMappingURL=razorpay-gateway.service.js.map