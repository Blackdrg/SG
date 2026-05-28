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
exports.MenuItemAvailabilityEntity = void 0;
const typeorm_1 = require("typeorm");
const menu_item_entity_1 = require("./menu-item.entity");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
let MenuItemAvailabilityEntity = class MenuItemAvailabilityEntity {
};
exports.MenuItemAvailabilityEntity = MenuItemAvailabilityEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MenuItemAvailabilityEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => menu_item_entity_1.MenuItemEntity),
    __metadata("design:type", menu_item_entity_1.MenuItemEntity)
], MenuItemAvailabilityEntity.prototype, "menuItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], MenuItemAvailabilityEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MenuItemAvailabilityEntity.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuItemAvailabilityEntity.prototype, "unavailableReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MenuItemAvailabilityEntity.prototype, "unavailableSince", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MenuItemAvailabilityEntity.prototype, "isAutoDisabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MenuItemAvailabilityEntity.prototype, "autoDisabledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuItemAvailabilityEntity.prototype, "autoDisabledReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MenuItemAvailabilityEntity.prototype, "predictedAvailability", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MenuItemAvailabilityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MenuItemAvailabilityEntity.prototype, "updatedAt", void 0);
exports.MenuItemAvailabilityEntity = MenuItemAvailabilityEntity = __decorate([
    (0, typeorm_1.Entity)('menu_item_availability')
], MenuItemAvailabilityEntity);
//# sourceMappingURL=menu-item-availability.entity.js.map