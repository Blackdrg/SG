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
exports.MenuModerationEntity = exports.ModerationAction = exports.ModerationStatus = void 0;
const typeorm_1 = require("typeorm");
const menu_item_entity_1 = require("./menu-item.entity");
const restaurant_entity_1 = require("./restaurant.entity");
var ModerationStatus;
(function (ModerationStatus) {
    ModerationStatus["PENDING"] = "pending";
    ModerationStatus["APPROVED"] = "approved";
    ModerationStatus["REJECTED"] = "rejected";
    ModerationStatus["CHANGES_REQUESTED"] = "changes_requested";
})(ModerationStatus || (exports.ModerationStatus = ModerationStatus = {}));
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["CREATE"] = "create";
    ModerationAction["UPDATE"] = "update";
    ModerationAction["DELETE"] = "delete";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
let MenuModerationEntity = class MenuModerationEntity {
};
exports.MenuModerationEntity = MenuModerationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "menuItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => menu_item_entity_1.MenuItemEntity),
    __metadata("design:type", menu_item_entity_1.MenuItemEntity)
], MenuModerationEntity.prototype, "menuItem", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.RestaurantEntity),
    __metadata("design:type", restaurant_entity_1.RestaurantEntity)
], MenuModerationEntity.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ModerationAction }),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ModerationStatus, default: ModerationStatus.PENDING }),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], MenuModerationEntity.prototype, "originalData", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], MenuModerationEntity.prototype, "updatedData", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "moderatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MenuModerationEntity.prototype, "moderatorNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], MenuModerationEntity.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MenuModerationEntity.prototype, "flaggedForReview", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], MenuModerationEntity.prototype, "aiFlags", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MenuModerationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MenuModerationEntity.prototype, "updatedAt", void 0);
exports.MenuModerationEntity = MenuModerationEntity = __decorate([
    (0, typeorm_1.Entity)('menu_moderation')
], MenuModerationEntity);
//# sourceMappingURL=menu-moderation.entity.js.map