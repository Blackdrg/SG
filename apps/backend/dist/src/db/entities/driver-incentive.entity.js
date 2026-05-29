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
exports.DriverIncentiveEntity = exports.IncentiveStatus = exports.IncentiveType = void 0;
const typeorm_1 = require("typeorm");
const driver_entity_1 = require("./driver.entity");
var IncentiveType;
(function (IncentiveType) {
    IncentiveType["PEAK_TIME_BONUS"] = "peak_time_bonus";
    IncentiveType["WEEKLY_TARGET"] = "weekly_target";
    IncentiveType["ON_TIME_DELIVERY"] = "on_time_delivery";
    IncentiveType["CUSTOMER_RATING"] = "customer_rating";
    IncentiveType["REFERRAL_BONUS"] = "referral_bonus";
})(IncentiveType || (exports.IncentiveType = IncentiveType = {}));
var IncentiveStatus;
(function (IncentiveStatus) {
    IncentiveStatus["PENDING"] = "pending";
    IncentiveStatus["APPROVED"] = "approved";
    IncentiveStatus["PAID"] = "paid";
    IncentiveStatus["REJECTED"] = "rejected";
})(IncentiveStatus || (exports.IncentiveStatus = IncentiveStatus = {}));
let DriverIncentiveEntity = class DriverIncentiveEntity {
};
exports.DriverIncentiveEntity = DriverIncentiveEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.DriverEntity),
    __metadata("design:type", driver_entity_1.DriverEntity)
], DriverIncentiveEntity.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: IncentiveType }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DriverIncentiveEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: IncentiveStatus, default: IncentiveStatus.PENDING }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverIncentiveEntity.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverIncentiveEntity.prototype, "payoutReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverIncentiveEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DriverIncentiveEntity.prototype, "createdAt", void 0);
exports.DriverIncentiveEntity = DriverIncentiveEntity = __decorate([
    (0, typeorm_1.Entity)('driver_incentives')
], DriverIncentiveEntity);
//# sourceMappingURL=driver-incentive.entity.js.map