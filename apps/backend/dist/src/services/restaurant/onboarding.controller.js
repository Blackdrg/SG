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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const onboarding_service_1 = require("./onboarding.service");
const restaurant_onboarding_entity_1 = require("../../db/entities/restaurant-onboarding.entity");
const switch_1 = require("@nestjs/switch");
let RestaurantOnboardingController = class RestaurantOnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async initializeOnboarding(restaurantId) {
        return await this.onboardingService.initializeOnboarding(restaurantId);
    }
    async updateStep(onboardingId, body) {
        return await this.onboardingService.updateStep(onboardingId, body.step, body.data);
    }
    async getOnboardingStatus(restaurantId) {
        return await this.onboardingService.getOnboardingStatus(restaurantId);
    }
    async completeOnboarding(onboardingId, body) {
        return await this.onboardingService.completeOnboarding(onboardingId, body.reviewedBy);
    }
    async rejectOnboarding(onboardingId, body) {
        return await this.onboardingService.rejectOnboarding(onboardingId, body.reviewedBy, body.reason);
    }
    async getOnboardingAnalytics() {
        return await this.onboardingService.getOnboardingAnalytics();
    }
};
exports.RestaurantOnboardingController = RestaurantOnboardingController;
__decorate([
    (0, common_1.Post)('initialize/:restaurantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Initialize onboarding for a restaurant' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding initialized successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Restaurant not found' }),
    (0, switch_1.ApiParam)({ name: 'restaurantId', type: 'string' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "initializeOnboarding", null);
__decorate([
    (0, common_1.Put)('step/:onboardingId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Update onboarding step' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding step updated successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }),
    (0, switch_1.ApiParam)({ name: 'onboardingId', type: 'string' }),
    (0, switch_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                step: { type: 'string', enum: Object.values(restaurant_onboarding_entity_1.OnboardingStep) },
                data: { type: 'object' }
            },
            required: ['step']
        }
    }),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "updateStep", null);
__decorate([
    (0, common_1.Get)('status/:restaurantId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get onboarding status for a restaurant' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding status retrieved successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }),
    (0, switch_1.ApiParam)({ name: 'restaurantId', type: 'string' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('complete/:onboardingId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Complete onboarding' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding completed successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }),
    (0, switch_1.ApiParam)({ name: 'onboardingId', type: 'string' }),
    (0, switch_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                reviewedBy: { type: 'string' }
            },
            required: ['reviewedBy']
        }
    }),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "completeOnboarding", null);
__decorate([
    (0, common_1.Post)('reject/:onboardingId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Reject onboarding' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding rejected successfully' }),
    (0, switch_1.ApiResponse)({ status: 404, description: 'Onboarding record not found' }),
    (0, switch_1.ApiParam)({ name: 'onboardingId', type: 'string' }),
    (0, switch_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                reviewedBy: { type: 'string' },
                reason: { type: 'string' }
            },
            required: ['reviewedBy', 'reason']
        }
    }),
    __param(0, (0, common_1.Param)('onboardingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "rejectOnboarding", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, switch_1.ApiOperation)({ summary: 'Get onboarding analytics' }),
    (0, switch_1.ApiResponse)({ status: 200, description: 'Onboarding analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestaurantOnboardingController.prototype, "getOnboardingAnalytics", null);
exports.RestaurantOnboardingController = RestaurantOnboardingController = __decorate([
    (0, switch_1.ApiTags)('restaurant-onboarding'),
    (0, common_1.Controller)('restaurant-onboarding'),
    __metadata("design:paramtypes", [onboarding_service_1.RestaurantOnboardingService])
], RestaurantOnboardingController);
//# sourceMappingURL=onboarding.controller.js.map