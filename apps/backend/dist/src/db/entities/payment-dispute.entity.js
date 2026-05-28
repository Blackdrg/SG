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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDisputeEntity = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order/order.entity");
let PaymentDisputeEntity = class PaymentDisputeEntity {
};
exports.PaymentDisputeEntity = PaymentDisputeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentDisputeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.OrderEntity),
    __metadata("design:type", typeof (_a = typeof order_entity_1.OrderEntity !== "undefined" && order_entity_1.OrderEntity) === "function" ? _a : Object)
], PaymentDisputeEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentDisputeEntity.prototype, "disputeId", void 0);
exports.PaymentDisputeEntity = PaymentDisputeEntity = __decorate([
    (0, typeorm_1.Entity)('payment_disputes')
], PaymentDisputeEntity);
/ External dispute ID from payment processor (Stripe, etc.);
disputeType;
string;
/ Type of dispute (e.g., 'fraudulent', 'product_not_received', 'not_as_described');
disputedAmount;
number;
/ Amount being disputed;
currency;
string;
/ Currency of disputed amount;
reason;
string;
/ Reason provided by customer for dispute;
evidence ?  : any;
/ Evidence submitted for dispute resolution;
status;
'warning' | 'needs_response' | 'under_review' | 'won' | 'lost';
/ Dispute status;
chargedBackAmount ?  : number;
/ Amount charged back if dispute lost;
chargedBackAt ?  : Date;
/ When chargeback occurred;
isRefundedToCustomer;
boolean;
/ Whether customer has been refunded (independent of dispute outcome);
refundedAt ?  : Date;
/ When refund was issued to customer;
refundedBy ?  : string;
/ Who issued the refund;
createdAt;
Date;
updatedAt;
Date;
//# sourceMappingURL=payment-dispute.entity.js.map