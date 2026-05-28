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
exports.BatchEntity = void 0;
const typeorm_1 = require("typeorm");
const recipe_entity_1 = require("./recipe.entity");
const restaurant_branch_entity_1 = require("./restaurant-branch.entity");
let BatchEntity = class BatchEntity {
};
exports.BatchEntity = BatchEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BatchEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BatchEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BatchEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => recipe_entity_1.RecipeEntity),
    __metadata("design:type", recipe_entity_1.RecipeEntity)
], BatchEntity.prototype, "recipe", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "quantityPrepared", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BatchEntity.prototype, "quantityUnit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], BatchEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], BatchEntity.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], BatchEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], BatchEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "estimatedPrepTimeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "actualPrepTimeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "delayMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], BatchEntity.prototype, "delayReasons", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_branch_entity_1.RestaurantBranchEntity),
    __metadata("design:type", restaurant_branch_entity_1.RestaurantBranchEntity)
], BatchEntity.prototype, "branch", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BatchEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BatchEntity.prototype, "updatedAt", void 0);
exports.BatchEntity = BatchEntity = __decorate([
    (0, typeorm_1.Entity)('batches')
], BatchEntity);
//# sourceMappingURL=batch.entity.js.map