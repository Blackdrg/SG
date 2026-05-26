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
exports.DriverScoreEntity = void 0;
const typeorm_1 = require("typeorm");
const driver_entity_1 = require("./driver.entity");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
let DriverScoreEntity = class DriverScoreEntity {
};
exports.DriverScoreEntity = DriverScoreEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DriverScoreEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => driver_entity_1.DriverEntity),
    __metadata("design:type", driver_entity_1.DriverEntity)
], DriverScoreEntity.prototype, "driver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], DriverScoreEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "overallScore", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "onTimeDeliveryRate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "acceptanceRate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "cancellationRate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "customerRating", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "totalDeliveries", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "totalDistance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], DriverScoreEntity.prototype, "averageSpeed", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], DriverScoreEntity.prototype, "lastCalculatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DriverScoreEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], DriverScoreEntity.prototype, "updatedAt", void 0);
exports.DriverScoreEntity = DriverScoreEntity = __decorate([
    (0, typeorm_1.Entity)('driver_scores')
], DriverScoreEntity);
//# sourceMappingURL=driver-score.entity.js.map