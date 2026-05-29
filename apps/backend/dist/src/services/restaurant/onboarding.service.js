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
var RestaurantOnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOnboardingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
let RestaurantOnboardingService = RestaurantOnboardingService_1 = class RestaurantOnboardingService {
    constructor(onboardingRepo, restaurantRepo, dataSource) {
        this.onboardingRepo = onboardingRepo;
        this.restaurantRepo = restaurantRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(RestaurantOnboardingService_1.name);
    }
    async initializeOnboarding(restaurantId) {
        const restaurant = await this.restaurantRepo.findOne({ where: { id: restaurantId } });
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        const existingOnboarding = await this.onboardingRepo.findOne({
            where: { restaurantId }
        });
        if (existingOnboarding) {
            if (existingOnboarding.status === restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED) {
                return existingOnboarding;
            }
            return existingOnboarding;
        }
        const onboarding = this.onboardingRepo.create({
            restaurantId,
            currentStep: restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION,
            status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS,
        });
        const savedOnboarding = await this.onboardingRepo.save(onboarding);
        this.logger.log(Initialized, onboarding);
        for (restaurant;;)
            ;
        return savedOnboarding;
    }
    async updateStep(onboardingId, step, data) {
        const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding record not found');
        }
        onboarding.currentStep = step;
        if (data) {
            switch (step) {
                case restaurant_onboarding_entity_1.OnboardingStep.BUSINESS_REGISTRATION:
                    onboarding.businessDetails = { ...onboarding.businessDetails, ...data };
                    break;
                case restaurant_onboarding_entity_1.OnboardingStep.DOCUMENT_UPLOAD:
                    onboarding.documentStatus = { ...onboarding.documentStatus, ...data };
                    break;
                case restaurant_onboarding_entity_1.OnboardingStep.BANK_VERIFICATION:
                    onboarding.bankDetails = { ...onboarding.bankDetails, ...data };
                    break;
                case restaurant_onboarding_entity_1.OnboardingStep.MENU_SETUP:
                    onboarding.menuSetup = { ...onboarding.menuSetup, ...data };
                    break;
                default:
                    break;
            }
        }
        if (step === restaurant_onboarding_entity_1.OnboardingStep.STAFF_INVITE) {
            onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED;
        }
        const updatedOnboarding = await this.onboardingRepo.save(onboarding);
        this.logger.log(Updated, onboarding, step, to);
        for (onboarding;;)
            ;
        return updatedOnboarding;
    }
    async getOnboardingStatus(restaurantId) {
        const onboarding = await this.onboardingRepo.findOne({
            where: { restaurantId }
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding record not found for restaurant');
        }
        return onboarding;
    }
    async completeOnboarding(onboardingId, reviewedBy) {
        const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding record not found');
        }
        onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED;
        onboarding.reviewedBy = reviewedBy;
        onboarding.reviewedAt = new Date();
        onboarding.currentStep = restaurant_onboarding_entity_1.OnboardingStep.COMPLETION;
        const updatedOnboarding = await this.onboardingRepo.save(onboarding);
        this.logger.log(Completed, onboarding);
        return updatedOnboarding;
    }
    async rejectOnboarding(onboardingId, reviewedBy, reason) {
        const onboarding = await this.onboardingRepo.findOne({ where: { id: onboardingId } });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding record not found');
        }
        onboarding.status = restaurant_onboarding_entity_1.OnboardingStatus.REJECTED;
        onboarding.reviewedBy = reviewedBy;
        onboarding.reviewedAt = new Date();
        onboarding.rejectionReason = reason;
        const updatedOnboarding = await this.onboardingRepo.save(onboarding);
        this.logger.log(Rejected, onboarding);
        return updatedOnboarding;
    }
    async getOnboardingAnalytics() {
        const [totalOnboardings, pendingOnboardings, inProgressOnboardings, completedOnboardings, rejectedOnboardings, avgCompletionTime] = await Promise.all([
            this.onboardingRepo.count(),
            this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.PENDING } }),
            this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.IN_PROGRESS } }),
            this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED } }),
            this.onboardingRepo.count({ where: { status: restaurant_onboarding_entity_1.OnboardingStatus.REJECTED } }),
            this.getAverageCompletionTime(),
        ]);
        return {
            totalOnboardings,
            pendingOnboardings,
            inProgressOnboardings,
            completedOnboardings,
            rejectedOnboardings,
            completionRate: totalOnboardings > 0
                ? (completedOnboardings / totalOnboardings) * 100
                : 0,
            avgCompletionTimeHours: avgCompletionTime
        };
    }
    async getAverageCompletionTime() {
        const result = await this.onboardingRepo
            .createQueryBuilder('onboarding')
            .select('AVG(TIMESTAMPDIFF(HOUR, onboarding.createdAt, onboarding.updatedAt))', 'avgHours')
            .where('onboarding.status = :status', { status: restaurant_onboarding_entity_1.OnboardingStatus.COMPLETED })
            .getRawOne();
        return result?.avgHours || 0;
    }
};
exports.RestaurantOnboardingService = RestaurantOnboardingService;
exports.RestaurantOnboardingService = RestaurantOnboardingService = RestaurantOnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(restaurant_onboarding_entity_1.RestaurantOnboardingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RestaurantOnboardingService);
//# sourceMappingURL=onboarding.service.js.map