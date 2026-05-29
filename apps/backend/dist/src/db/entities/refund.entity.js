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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundEntity = exports.RefundStatus = exports.RefundType = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order.entity");
const user_entity_1 = require("./user.entity");
var RefundType;
(function (RefundType) {
    RefundType["CUSTOMER_REFUND"] = "customer_refund";
    RefundType["RESTAURANT_PENALTY"] = "restaurant_penalty";
    RefundType["DRIVER_DEDUCTION"] = "driver_deduction";
})(RefundType || (exports.RefundType = RefundType = {}));
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["REQUESTED"] = "requested";
    RefundStatus["APPROVED"] = "approved";
    RefundStatus["PROCESSED"] = "processed";
    RefundStatus["FAILED"] = "failed";
    RefundStatus["REJECTED"] = "rejected";
})(RefundStatus || (exports.RefundStatus = RefundStatus = {}));
let RefundEntity = class RefundEntity {
};
exports.RefundEntity = RefundEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RefundEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RefundEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], RefundEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RefundEntity.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], RefundEntity.prototype, "requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RefundType }),
    __metadata("design:type", String)
], RefundEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], RefundEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: RefundStatus, default: RefundStatus.REQUESTED }),
    __metadata("design:type", String)
], RefundEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RefundEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RefundEntity.prototype, "approvalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RefundEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], RefundEntity.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RefundEntity.prototype, "processedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], RefundEntity.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RefundEntity.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RefundEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RefundEntity.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RefundEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RefundEntity.prototype, "updatedAt", void 0);
exports.RefundEntity = RefundEntity = __decorate([
    (0, typeorm_1.Entity)('refunds')
], RefundEntity);
//# sourceMappingURL=refund.entity.js.map