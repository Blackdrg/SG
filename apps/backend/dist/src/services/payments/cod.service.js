"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodService = void 0;
const common_1 = require("@nestjs/common");
let CodService = class CodService {
    async createPaymentIntent(amount, currency = 'usd', userId = null, metadata = {}) {
        const intentId = `cod_${Date.now()}`;
        return {
            id: intentId,
            amount,
            currency,
            status: 'requires_capture',
            payment_method: 'cod',
            metadata,
        };
    }
    async confirmPayment(paymentId, userId) {
        return {
            id: paymentId,
            amount: 0,
            currency: 'usd',
            status: 'succeeded',
        };
    }
    async refundPayment(paymentId, amount = null, userId, reason = 'requested_by_customer') {
        return {
            id: `cod_refund_${Date.now()}`,
            amount: amount ?? 0,
            currency: 'usd',
            status: 'succeeded',
            metadata: { reason },
        };
    }
};
exports.CodService = CodService;
exports.CodService = CodService = __decorate([
    (0, common_1.Injectable)()
], CodService);
//# sourceMappingURL=cod.service.js.map