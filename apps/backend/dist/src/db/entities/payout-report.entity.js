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
exports.PayoutReportEntity = exports.PayoutStatus = void 0;
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("./restaurant.entity");
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "pending";
    PayoutStatus["PROCESSING"] = "processing";
    PayoutStatus["PAID"] = "paid";
    PayoutStatus["FAILED"] = "failed";
    PayoutStatus["CANCELLED"] = "cancelled";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
let PayoutReportEntity = class PayoutReportEntity {
};
exports.PayoutReportEntity = PayoutReportEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PayoutReportEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PayoutReportEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.RestaurantEntity),
    __metadata("design:type", restaurant_entity_1.RestaurantEntity)
], PayoutReportEntity.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], PayoutReportEntity.prototype, "periodStart", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], PayoutReportEntity.prototype, "periodEnd", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "grossSales", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "platformCommission", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "gstAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "cancellationFees", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "incentives", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "penalties", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PayoutReportEntity.prototype, "netPayout", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING }),
    __metadata("design:type", String)
], PayoutReportEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PayoutReportEntity.prototype, "payoutReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], PayoutReportEntity.prototype, "payoutDate", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PayoutReportEntity.prototype, "orderBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PayoutReportEntity.prototype, "paymentBreakdown", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PayoutReportEntity.prototype, "createdAt", void 0);
exports.PayoutReportEntity = PayoutReportEntity = __decorate([
    (0, typeorm_1.Entity)('payout_reports')
], PayoutReportEntity);
//# sourceMappingURL=payout-report.entity.js.map