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
exports.RefundApprovalEntity = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order/order.entity");
let RefundApprovalEntity = class RefundApprovalEntity {
};
exports.RefundApprovalEntity = RefundApprovalEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefundApprovalEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.OrderEntity),
    __metadata("design:type", typeof (_a = typeof order_entity_1.OrderEntity !== "undefined" && order_entity_1.OrderEntity) === "function" ? _a : Object)
], RefundApprovalEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RefundApprovalEntity.prototype, "refundId", void 0);
exports.RefundApprovalEntity = RefundApprovalEntity = __decorate([
    (0, typeorm_1.Entity)('refund_approvals')
], RefundApprovalEntity);
/ External refund ID from payment processor;
refundAmount;
number;
/ Amount to be refunded;
currency;
string;
/ Currency of refund amount;
reason;
string;
/ Reason for refund request;
requestedBy;
string;
/ Who requested the refund (customer ID or staff ID);
requestType;
'customer_request' | 'agent_initiated' | 'policy_exception' | 'dispute_resolution';
/ Type of refund request;
approvalStatus;
'pending' | 'approved' | 'rejected' | 'processed';
/ Current approval status;
approverId ?  : string;
/ Who approved/rejected;
the;
refund;
approvedAt ?  : Date;
/ When the refund was approved;
rejectionReason ?  : string;
/ Reason if rejected;
processedAt ?  : Date;
/ When the refund was actually processed;
processedBy ?  : string;
/ Who processed the refund;
requiresManagerApproval;
boolean;
/ Whether manager approval is needed (based on amount/policy;
managerApproverId ?  : string;
/ Manager who needs to approve;
managerApprovedAt ?  : Date;
/ When manager approved;
createdAt;
Date;
updatedAt;
Date;
//# sourceMappingURL=refund-approval.entity.js.map