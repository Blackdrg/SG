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
exports.RestaurantOnboardingEntity = exports.OnboardingStatus = exports.OnboardingStep = void 0;
const typeorm_1 = require("typeorm");
const restaurant_entity_1 = require("./restaurant.entity");
var OnboardingStep;
(function (OnboardingStep) {
    OnboardingStep["BUSINESS_REGISTRATION"] = "business_registration";
    OnboardingStep["DOCUMENT_UPLOAD"] = "document_upload";
    OnboardingStep["BANK_VERIFICATION"] = "bank_verification";
    OnboardingStep["MENU_SETUP"] = "menu_setup";
    OnboardingStep["STAFF_INVITE"] = "staff_invite";
    OnboardingStep["COMPLETION"] = "completion";
})(OnboardingStep || (exports.OnboardingStep = OnboardingStep = {}));
var OnboardingStatus;
(function (OnboardingStatus) {
    OnboardingStatus["PENDING"] = "pending";
    OnboardingStatus["IN_PROGRESS"] = "in_progress";
    OnboardingStatus["COMPLETED"] = "completed";
    OnboardingStatus["REJECTED"] = "rejected";
})(OnboardingStatus || (exports.OnboardingStatus = OnboardingStatus = {}));
let RestaurantOnboardingEntity = class RestaurantOnboardingEntity {
};
exports.RestaurantOnboardingEntity = RestaurantOnboardingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "restaurantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => restaurant_entity_1.RestaurantEntity),
    __metadata("design:type", restaurant_entity_1.RestaurantEntity)
], RestaurantOnboardingEntity.prototype, "restaurant", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OnboardingStep, default: OnboardingStep.BUSINESS_REGISTRATION }),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "currentStep", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.PENDING }),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RestaurantOnboardingEntity.prototype, "businessDetails", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RestaurantOnboardingEntity.prototype, "documentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RestaurantOnboardingEntity.prototype, "bankDetails", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], RestaurantOnboardingEntity.prototype, "menuSetup", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RestaurantOnboardingEntity.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], RestaurantOnboardingEntity.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RestaurantOnboardingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RestaurantOnboardingEntity.prototype, "updatedAt", void 0);
exports.RestaurantOnboardingEntity = RestaurantOnboardingEntity = __decorate([
    (0, typeorm_1.Entity)('restaurant_onboarding')
], RestaurantOnboardingEntity);
//# sourceMappingURL=restaurant-onboarding.entity.js.map