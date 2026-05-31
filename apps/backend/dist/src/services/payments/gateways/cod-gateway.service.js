"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CashOnDeliveryGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashOnDeliveryGateway = void 0;
const common_1 = require("@nestjs/common");
let CashOnDeliveryGateway = CashOnDeliveryGateway_1 = class CashOnDeliveryGateway {
    constructor() {
        this.logger = new common_1.Logger(CashOnDeliveryGateway_1.name);
    }
    async createPaymentIntent(amount, currency = 'inr', userId = null, metadata = {}) {
        const codPaymentId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: codPaymentId,
            amount,
            currency: currency.toUpperCase(),
            status: 'pending',
            client_secret: codPaymentId,
            payment_method: 'cod',
            metadata: {
                ...metadata,
                userId,
                paymentMethod: 'cash_on_delivery',
                instruction: 'Pay cash to driver on delivery',
            },
        };
    }
    async confirmPayment(paymentId, userId) {
        if (!paymentId?.startsWith('cod_')) {
            throw new Error('Invalid COD payment ID');
        }
        return {
            id: paymentId,
            amount: 0,
            currency: 'INR',
            status: 'pending',
            payment_method: 'cod',
        };
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
        this.logger.warn(`COD refund requested - no action taken. Amount: ${amount}, Payment: ${paymentId}`);
        return {
            id: `refund_${Date.now()}`,
            amount: amount || 0,
            status: 'processed',
            note: 'COD refund - requires manual driver reconciliation',
        };
    }
    async constructEvent(payload, signature, secret) {
        return JSON.parse(payload.toString());
    }
    getGatewayName() {
        return 'cod';
    }
    supportsCOD() {
        return true;
    }
};
exports.CashOnDeliveryGateway = CashOnDeliveryGateway;
exports.CashOnDeliveryGateway = CashOnDeliveryGateway = CashOnDeliveryGateway_1 = __decorate([
    (0, common_1.Injectable)()
], CashOnDeliveryGateway);
//# sourceMappingURL=cod-gateway.service.js.map