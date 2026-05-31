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
exports.ReferralEntity = exports.ReferralRewardType = exports.ReferralStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "pending";
    ReferralStatus["COMPLETED"] = "completed";
    ReferralStatus["EXPIRED"] = "expired";
    ReferralStatus["REVOKED"] = "revoked";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
var ReferralRewardType;
(function (ReferralRewardType) {
    ReferralRewardType["WALLET_CASHBACK"] = "wallet_cashback";
    ReferralRewardType["SUBSCRIPTION_DISCOUNT"] = "subscription_discount";
    ReferralRewardType["FREE_DELIVERY"] = "free_delivery";
    ReferralRewardType["BOTH"] = "both";
})(ReferralRewardType || (exports.ReferralRewardType = ReferralRewardType = {}));
let ReferralEntity = class ReferralEntity {
};
exports.ReferralEntity = ReferralEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReferralEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ReferralEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReferralEntity.prototype, "referrerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], ReferralEntity.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReferralEntity.prototype, "refereeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity),
    __metadata("design:type", user_entity_1.UserEntity)
], ReferralEntity.prototype, "referee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING }),
    __metadata("design:type", String)
], ReferralEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ReferralRewardType, default: ReferralRewardType.WALLET_CASHBACK }),
    __metadata("design:type", String)
], ReferralEntity.prototype, "rewardType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ReferralEntity.prototype, "referrerReward", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ReferralEntity.prototype, "refereeReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReferralEntity.prototype, "refereeFirstOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ReferralEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ReferralEntity.prototype, "rewardGivenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ReferralEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ReferralEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ReferralEntity.prototype, "updatedAt", void 0);
exports.ReferralEntity = ReferralEntity = __decorate([
    (0, typeorm_1.Entity)('referrals')
], ReferralEntity);
//# sourceMappingURL=referral.entity.js.map