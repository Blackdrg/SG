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
exports.DriverPenaltyEntity = exports.DriverPenaltyStatus = exports.DriverPenaltyType = void 0;
const typeorm_1 = require("typeorm");
const driver_entity_1 = require("./driver.entity");
var DriverPenaltyType;
(function (DriverPenaltyType) {
    DriverPenaltyType["LATE_PICKUP"] = "late_pickup";
    DriverPenaltyType["LATE_DELIVERY"] = "late_delivery";
    DriverPenaltyType["CUSTOMER_CANCELLATION"] = "customer_cancellation";
    DriverPenaltyType["RESTAURANT_CANCELLATION"] = "restaurant_cancellation";
    DriverPenaltyType["ROUTE_DEVIATION"] = "route_deviation";
    DriverPenaltyType["FAKE_DELIVERY"] = "fake_delivery";
    DriverPenaltyType["UNAUTHORIZED_ACTION"] = "unauthorized_action";
    DriverPenaltyType["DAMAGE_COMPLAINT"] = "damage_complaint";
})(DriverPenaltyType || (exports.DriverPenaltyType = DriverPenaltyType = {}));
var DriverPenaltyStatus;
(function (DriverPenaltyStatus) {
    DriverPenaltyStatus["ISSUED"] = "issued";
    DriverPenaltyStatus["PENDING"] = "pending";
    DriverPenaltyStatus["PAID"] = "paid";
    DriverPenaltyStatus["WAIVED"] = "waived";
    DriverPenaltyStatus["DISPUTED"] = "disputed";
})(DriverPenaltyStatus || (exports.DriverPenaltyStatus = DriverPenaltyStatus = {}));
let DriverPenaltyEntity = class DriverPenaltyEntity {
};
exports.DriverPenaltyEntity = DriverPenaltyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "driverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.DriverEntity),
    __metadata("design:type", driver_entity_1.DriverEntity)
], DriverPenaltyEntity.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DriverPenaltyType }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], DriverPenaltyEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: DriverPenaltyStatus, default: DriverPenaltyStatus.ISSUED }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "issuedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverPenaltyEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverPenaltyEntity.prototype, "waivedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "waivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "waiverReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DriverPenaltyEntity.prototype, "disputeReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DriverPenaltyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DriverPenaltyEntity.prototype, "updatedAt", void 0);
exports.DriverPenaltyEntity = DriverPenaltyEntity = __decorate([
    (0, typeorm_1.Entity)('driver_penalties')
], DriverPenaltyEntity);
//# sourceMappingURL=driver-penalty.entity.js.map