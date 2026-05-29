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
exports.CommissionRuleEntity = exports.CommissionStatus = exports.CommissionType = void 0;
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("./restaurant.entity");
var CommissionType;
(function (CommissionType) {
    CommissionType["PERCENTAGE"] = "percentage";
    CommissionType["FIXED"] = "fixed";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
var CommissionStatus;
(function (CommissionStatus) {
    CommissionStatus["ACTIVE"] = "active";
    CommissionStatus["EXPIRED"] = "expired";
    CommissionStatus["CANCELLED"] = "cancelled";
})(CommissionStatus || (exports.CommissionStatus = CommissionStatus = {}));
let CommissionRuleEntity = class CommissionRuleEntity {
};
exports.CommissionRuleEntity = CommissionRuleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionRuleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CommissionRuleEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.RestaurantEntity),
    __metadata("design:type", restaurant_entity_1.RestaurantEntity)
], CommissionRuleEntity.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CommissionType }),
    __metadata("design:type", String)
], CommissionRuleEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CommissionRuleEntity.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommissionRuleEntity.prototype, "minOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommissionRuleEntity.prototype, "maxOrderValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CommissionRuleEntity.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], CommissionRuleEntity.prototype, "validTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: CommissionStatus, default: CommissionStatus.ACTIVE }),
    __metadata("design:type", String)
], CommissionRuleEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], CommissionRuleEntity.prototype, "applicableCategories", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], CommissionRuleEntity.prototype, "excludedItems", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CommissionRuleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CommissionRuleEntity.prototype, "updatedAt", void 0);
exports.CommissionRuleEntity = CommissionRuleEntity = __decorate([
    (0, typeorm_1.Entity)('commission_rules')
], CommissionRuleEntity);
//# sourceMappingURL=commission-rule.entity.js.map