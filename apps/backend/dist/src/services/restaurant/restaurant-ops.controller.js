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
exports.RestaurantOpsController = void 0;
const common_1 = require("@nestjs/common");
const restaurant_ops_service_1 = require("./restaurant-ops.service");
const menu_moderation_service_1 = require("./menu-moderation.service");
const payout_service_1 = require("./payout.service");
const branch_management_service_1 = require("./branch-management.service");
const commission_service_1 = require("./commission.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let RestaurantOpsController = class RestaurantOpsController {
    constructor(opsService, moderationService, payoutService, branchService, commissionService) {
        this.opsService = opsService;
        this.moderationService = moderationService;
        this.payoutService = payoutService;
        this.branchService = branchService;
        this.commissionService = commissionService;
    }
    async startOnboarding(body) {
        return this.opsService.startOnboarding(body.userId, body.restaurantData);
    }
    async getOnboardingProgress(id) {
        return this.opsService.getOnboardingProgress(id);
    }
    async updateOnboardingStep(id, body) {
        return this.opsService.updateStep(id, body.step, body.data);
    }
    async completeOnboarding(id, req) {
        return this.opsService.completeOnboarding(id, req.user.id);
    }
    async submitForModeration(body) {
        return this.moderationService.submitForModeration(body.menuItemId, body.restaurantId, body.action, body.data, body.originalData);
    }
    async getPendingModerations(restaurantId) {
        return this.moderationService.getPendingModerations(restaurantId);
    }
    async reviewModeration(id, body, req) {
        return this.moderationService.reviewModeration(id, req.user.id, body.status, body.notes);
    }
    async getPayoutHistory(restaurantId) {
        return this.payoutService.getPayoutHistory(restaurantId);
    }
    async generatePayout(body) {
        return this.payoutService.generatePayoutReport(body.restaurantId, new Date(body.periodStart), new Date(body.periodEnd));
    }
    async processPayout(id, body) {
        return this.payoutService.processPayout(id, body.reference);
    }
    async createBranch(body) {
        return this.branchService.createBranch(body.restaurantId, body.branchData);
    }
    async updateBranch(id, body) {
        return this.branchService.updateBranch(id, body);
    }
    async toggleBranchStatus(id, body) {
        return this.branchService.toggleBranchStatus(id, body.isOnline);
    }
    async getBranch(id) {
        return this.branchService.getBranchDetails(id);
    }
    async createCommissionRule(body) {
        return this.commissionService.createCommissionRule(body.restaurantId, body.ruleData);
    }
    async getCommissionRules(restaurantId) {
        return this.commissionService.getCommissionRules(restaurantId);
    }
    async calculateCommission(body) {
        const amount = await this.commissionService.calculateCommission(body.restaurantId, body.orderAmount);
        return { commissionAmount: amount };
    }
};
exports.RestaurantOpsController = RestaurantOpsController;
__decorate([
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Get)('onboarding/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "getOnboardingProgress", null);
__decorate([
    (0, common_1.Put)('onboarding/:id/step'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "updateOnboardingStep", null);
__decorate([
    (0, common_1.Post)('onboarding/:id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "completeOnboarding", null);
__decorate([
    (0, common_1.Post)('moderation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "submitForModeration", null);
__decorate([
    (0, common_1.Get)('moderation/pending'),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "getPendingModerations", null);
__decorate([
    (0, common_1.Put)('moderation/:id/review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "reviewModeration", null);
__decorate([
    (0, common_1.Get)('payout/history'),
    __param(0, (0, common_1.Query)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "getPayoutHistory", null);
__decorate([
    (0, common_1.Post)('payout/generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "generatePayout", null);
__decorate([
    (0, common_1.Post)('payout/:id/process'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "processPayout", null);
__decorate([
    (0, common_1.Post)('branch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "createBranch", null);
__decorate([
    (0, common_1.Put)('branch/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "updateBranch", null);
__decorate([
    (0, common_1.Put)('branch/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "toggleBranchStatus", null);
__decorate([
    (0, common_1.Get)('branch/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "getBranch", null);
__decorate([
    (0, common_1.Post)('commission'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "createCommissionRule", null);
__decorate([
    (0, common_1.Get)('commission/:restaurantId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "getCommissionRules", null);
__decorate([
    (0, common_1.Post)('commission/calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RestaurantOpsController.prototype, "calculateCommission", null);
exports.RestaurantOpsController = RestaurantOpsController = __decorate([
    (0, common_1.Controller)('restaurant/ops'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [restaurant_ops_service_1.RestaurantOpsService,
        menu_moderation_service_1.MenuModerationService,
        payout_service_1.PayoutService,
        branch_management_service_1.BranchManagementService,
        commission_service_1.CommissionService])
], RestaurantOpsController);
//# sourceMappingURL=restaurant-ops.controller.js.map