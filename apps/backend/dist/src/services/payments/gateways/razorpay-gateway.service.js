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
            const auth = Buffer.from($, { this: .keyId }).toString('base64');
            const response = await fetch(https, method, headers, {
                'Authorization': Basic,
                'Content-Type': 'application/json',
            }, body, JSON.stringify(data));
        }
        finally { }
        ;
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.description || 'Razorpay API error');
        }
        return await response.json();
    }
    catch(error) {
        this.logger.error(Razorpay, API, request, failed, error);
        throw error;
    }
};
exports.RazorpayGateway = RazorpayGateway;
exports.RazorpayGateway = RazorpayGateway = RazorpayGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RazorpayGateway);
async;
createPaymentIntent(amount, number, currency, string = 'inr', userId, string = null, metadata, any = {});
Promise < any > {
    try: {
        const: amountInPaise = Math.round(amount * 100),
        const: paymentData = {
            amount: amountInPaise,
            currency: currency.toLowerCase(),
            receipt: eceipt_,
            notes: {
                ...metadata,
                userId,
                timestamp: new Date().toISOString()
            }
        },
        const: payment = await this.razorpayRequest('POST', 'orders', paymentData),
        return: {
            id: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
            status: payment.status,
            client_secret: payment.id
        }
    }, catch(error) {
        this.logger.error('Razorpay payment intent creation failed:', error);
        throw error;
    }
};
async;
confirmPayment(paymentId, string, userId, string);
Promise < any > {
    try: {
        const: payment = await this.razorpayRequest('GET', orders / ),
        if(payment) { }, : .status === 'paid'
    }
};
{
    return payment;
}
{
    throw new common_1.BadRequestException(Payment, not, successful);
}
try { }
catch (error) {
    this.logger.error('Razorpay payment confirmation failed:', error);
    throw error;
}
async;
refundPayment(paymentId, string, amount, number | null, null, userId, string, reason, string = 'requested_by_customer');
Promise < any > {
    try: {
        const: order = await this.razorpayRequest('GET', orders / ),
        const: paymentIdToRefund = order.payments?.items?.[0]?.id || paymentId,
        const: refundAmount = amount ?? (order.amount / 100),
        const: maxRefund = order.amount / 100,
        if(refundAmount) { }
    } > maxRefund
};
{
    throw new common_1.BadRequestException(Refund, amount, cannot, exceed, original, amount);
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
const refund = await this.razorpayRequest('POST', payments);
return refund;
try { }
catch (error) {
    this.logger.error('Razorpay payment refund failed:', error);
    throw error;
}
async;
constructEvent(payload, Buffer, signature, string, secret, string);
Promise < any > {
    try: {
        const: crypto = require('crypto'),
        const: generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload.toString())
            .digest('hex'),
        if(generatedSignature) { }
    } !== signature
};
{
    throw new Error('Invalid signature');
}
const event = JSON.parse(payload.toString());
return event;
try { }
catch (error) {
    this.logger.error('Razorpay webhook verification failed:', error);
    throw error;
}
getGatewayName();
string;
{
    return 'razorpay';
}
//# sourceMappingURL=razorpay-gateway.service.js.map