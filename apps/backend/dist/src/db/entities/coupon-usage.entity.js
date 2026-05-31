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
exports.CouponUsageEntity = exports.CouponUsageStatus = void 0;
const typeorm_1 = require("typeorm");
const coupon_entity_1 = require("./coupon.entity");
const user_entity_1 = require("./user.entity");
var CouponUsageStatus;
(function (CouponUsageStatus) {
    CouponUsageStatus["ACTIVE"] = "active";
    CouponUsageStatus["USED"] = "used";
    CouponUsageStatus["EXPIRED"] = "expired";
    CouponUsageStatus["CANCELLED"] = "cancelled";
})(CouponUsageStatus || (exports.CouponUsageStatus = CouponUsageStatus = {}));
let CouponUsageEntity = class CouponUsageEntity {
};
exports.CouponUsageEntity = CouponUsageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CouponUsageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coupon_entity_1.CouponEntity),
    __metadata("design:type", coupon_entity_1.CouponEntity)
], CouponUsageEntity.prototype, "coupon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CouponUsageEntity.prototype, "couponId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], CouponUsageEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CouponUsageEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponUsageStatus, default: CouponUsageStatus.ACTIVE }),
    __metadata("design:type", String)
], CouponUsageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CouponUsageEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CouponUsageEntity.prototype, "discountApplied", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], CouponUsageEntity.prototype, "orderAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CouponUsageEntity.prototype, "usedAt", void 0);
exports.CouponUsageEntity = CouponUsageEntity = __decorate([
    (0, typeorm_1.Entity)('coupon_usages')
], CouponUsageEntity);
//# sourceMappingURL=coupon-usage.entity.js.map