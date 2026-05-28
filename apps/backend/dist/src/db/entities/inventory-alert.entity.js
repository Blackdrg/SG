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
exports.InventoryAlertEntity = void 0;
const typeorm_1 = require("typeorm");
const inventory_item_entity_1 = require("./inventory-item.entity");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
let InventoryAlertEntity = class InventoryAlertEntity {
};
exports.InventoryAlertEntity = InventoryAlertEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryAlertEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_item_entity_1.InventoryItemEntity),
    __metadata("design:type", inventory_item_entity_1.InventoryItemEntity)
], InventoryAlertEntity.prototype, "inventoryItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], InventoryAlertEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], InventoryAlertEntity.prototype, "alertType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InventoryAlertEntity.prototype, "currentLevel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InventoryAlertEntity.prototype, "thresholdLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], InventoryAlertEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], InventoryAlertEntity.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], InventoryAlertEntity.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InventoryAlertEntity.prototype, "resolvedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InventoryAlertEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InventoryAlertEntity.prototype, "updatedAt", void 0);
exports.InventoryAlertEntity = InventoryAlertEntity = __decorate([
    (0, typeorm_1.Entity)('inventory_alerts')
], InventoryAlertEntity);
//# sourceMappingURL=inventory-alert.entity.js.map