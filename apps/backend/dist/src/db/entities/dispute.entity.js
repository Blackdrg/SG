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
exports.DisputeEntity = exports.DisputeStatus = exports.DisputeType = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("./order.entity");
const user_entity_1 = require("./user.entity");
var DisputeType;
(function (DisputeType) {
    DisputeType["QUALITY"] = "quality";
    DisputeType["LATE_DELIVERY"] = "late_delivery";
    DisputeType["WRONG_ITEM"] = "wrong_item";
    DisputeType["DAMAGED_ITEM"] = "damaged_item";
    DisputeType["MISSING_ITEM"] = "missing_item";
    DisputeType["OVERCHARGED"] = "overcharged";
})(DisputeType || (exports.DisputeType = DisputeType = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["RAISED"] = "raised";
    DisputeStatus["UNDER_REVIEW"] = "under_review";
    DisputeStatus["RESOLVED_CREDIT"] = "resolved_credit";
    DisputeStatus["RESOLVED_REFUND"] = "resolved_refund";
    DisputeStatus["RESOLVED_REPLACE"] = "resolved_replace";
    DisputeStatus["REJECTED"] = "rejected";
    DisputeStatus["CLOSED"] = "closed";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
let DisputeEntity = class DisputeEntity {
};
exports.DisputeEntity = DisputeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DisputeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DisputeEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.OrderEntity),
    __metadata("design:type", order_entity_1.OrderEntity)
], DisputeEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DisputeEntity.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], DisputeEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DisputeEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DisputeEntity.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DisputeType }),
    __metadata("design:type", String)
], DisputeEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.RAISED }),
    __metadata("design:type", String)
], DisputeEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DisputeEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeEntity.prototype, "resolutionNotes", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], DisputeEntity.prototype, "creditAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeEntity.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DisputeEntity.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], DisputeEntity.prototype, "evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DisputeEntity.prototype, "escalated", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DisputeEntity.prototype, "escalatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeEntity.prototype, "escalatedTo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DisputeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DisputeEntity.prototype, "updatedAt", void 0);
exports.DisputeEntity = DisputeEntity = __decorate([
    (0, typeorm_1.Entity)('disputes')
], DisputeEntity);
//# sourceMappingURL=dispute.entity.js.map