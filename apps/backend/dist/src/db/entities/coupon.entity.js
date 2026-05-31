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
exports.CouponEntity = exports.CouponScope = exports.CouponStatus = exports.CouponType = void 0;
const typeorm_1 = require("typeorm");
var CouponType;
(function (CouponType) {
    CouponType["PERCENTAGE"] = "percentage";
    CouponType["FIXED_AMOUNT"] = "fixed_amount";
    CouponType["FREE_DELIVERY"] = "free_delivery";
    CouponType["BOGO"] = "bogo";
})(CouponType || (exports.CouponType = CouponType = {}));
var CouponStatus;
(function (CouponStatus) {
    CouponStatus["ACTIVE"] = "active";
    CouponStatus["INACTIVE"] = "inactive";
    CouponStatus["EXPIRED"] = "expired";
    CouponStatus["DEPLETED"] = "depleted";
})(CouponStatus || (exports.CouponStatus = CouponStatus = {}));
var CouponScope;
(function (CouponScope) {
    CouponScope["GLOBAL"] = "global";
    CouponScope["RESTAURANT"] = "restaurant";
    CouponScope["CATEGORY"] = "category";
    CouponScope["ITEM"] = "item";
})(CouponScope || (exports.CouponScope = CouponScope = {}));
let CouponEntity = class CouponEntity {
};
exports.CouponEntity = CouponEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CouponEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponType }),
    __metadata("design:type", String)
], CouponEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponStatus, default: CouponStatus.ACTIVE }),
    __metadata("design:type", String)
], CouponEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CouponScope, default: CouponScope.GLOBAL }),
    __metadata("design:type", String)
], CouponEntity.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "discountValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "minOrderAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "maxDiscountAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "cashbackPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "maxCashbackAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "usageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "usageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], CouponEntity.prototype, "usagePerUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CouponEntity.prototype, "applicableDays", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], CouponEntity.prototype, "applicableSlots", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], CouponEntity.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, nullable: true }),
    __metadata("design:type", Boolean)
], CouponEntity.prototype, "applicableForNewUsers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CouponEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CouponEntity.prototype, "updatedAt", void 0);
exports.CouponEntity = CouponEntity = __decorate([
    (0, typeorm_1.Entity)('coupons')
], CouponEntity);
//# sourceMappingURL=coupon.entity.js.map