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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RestaurantOpsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOpsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const user_entity_1 = require("../../db/entities/user.entity");
let RestaurantOpsService = RestaurantOpsService_1 = class RestaurantOpsService {
    constructor(onboardingRepo, restaurantRepo, branchRepo, itemRepo, categoryRepo, userRepo, dataSource) {
        this.onboardingRepo = onboardingRepo;
        this.restaurantRepo = restaurantRepo;
        this.branchRepo = branchRepo;
        this.itemRepo = itemRepo;
        this.categoryRepo = categoryRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(RestaurantOpsService_1.name);
    }
    async startOnboarding(userId, restaurantData) {
        const existing = await this.restaurantRepo.findOne({ where: { slug: restaurantData.slug } });
        if (existing) {
            throw new common_1.BadRequestException('Restaurant slug already exists');
        }
        const restaurant = this.restaurantRepo.create({
            name: restaurantData.name,
            slug: restaurantData.slug,
            description: restaurantData.description || '',
            status: 'pending',
        });
        const savedRestaurant = await this.restaurantRepo.save(restaurant);
        const onboarding = this.onboardingRepo.create({
            restaurantId: savedRestaurant.id,
            currentStep: restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION,
            status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS,
            businessDetails: restaurantData.businessDetails || {},
        });
        return this.onboardingRepo.save(onboarding);
    }
    async updateStep(onboardingId, step, data) {
        const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        let updateData = { currentStep: step };
        switch (step) {
            case restaurant_onboarding_entity_1.OnboardingStep.DOCUMENT_UPLOAD:
                updateData.documentStatus = { ...onboarding.documentStatus, ...(data?.documents || {}) };
                break;
            case restaurant_onboarding_entity_1.OnboardingStep.BANK_VERIFICATION:
                updateData.bankDetails = { ...onboarding.bankDetails, ...(data?.bankDetails || {}) };
                break;
            case restaurant_onboarding_entity_1.OnboardingStep.MENU_SETUP:
                updateData.menuSetup = { ...onboarding.menuSetup, ...(data?.menuSetup || {}) };
                break;
        }
        await this.onboardingRepo.update(onboardingId, updateData);
        return this.onboardingRepo.findOne({ where: { id: onboardingId } });
    }
    async completeOnboarding(onboardingId, userId) {
        const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        await this.onboardingRepo.update(onboardingId, {
            status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED,
            currentStep: restaurant_onboarding_entity_1.OnboardingStep.COMPLETION,
        });
        await this.restaurantRepo.update(onboarding.restaurantId, { status: 'active' });
        return this.onboardingRepo.findOne({ where: { id: onboardingId } });
    }
    async getOnboardingProgress(onboardingId) {
        const onboarding = await this.onboardingRepo.findOne({
            where: { id: onboardingId },
            relations: ['restaurant'],
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const steps = Object.values(restaurant_onboarding_entity_1.OnboardingStep);
        const currentStepIndex = steps.indexOf(onboarding.currentStep);
        return {
            ...onboarding,
            progress: Math.round(((currentStepIndex + 1) / steps.length) * 100),
            stepsCompleted: currentStepIndex + 1,
            totalSteps: steps.length,
        };
    }
};
exports.RestaurantOpsService = RestaurantOpsService;
exports.RestaurantOpsService = RestaurantOpsService = RestaurantOpsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_onboarding_entity_1.RestaurantOnboardingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(menu_item_entity_1.MenuItemEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(menu_category_entity_1.MenuCategoryEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RestaurantOpsService);
//# sourceMappingURL=restaurant-ops.service.js.map