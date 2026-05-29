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
exports.DriverOpsController = void 0;
const common_1 = require("@nestjs/common");
const driver_onboarding_service_1 = require("./driver-onboarding.service");
const driver_payout_service_1 = require("./driver-payout.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let DriverOpsController = class DriverOpsController {
    constructor(onboardingService, payoutService) {
        this.onboardingService = onboardingService;
        this.payoutService = payoutService;
    }
    async startOnboarding(body) {
        return this.onboardingService.startOnboarding(body.userId, body.data);
    }
    async uploadDocument(body) {
        return this.onboardingService.uploadDocument(body.driverId, body.type, body.url, body.expiryDate ? new Date(body.expiryDate) : undefined);
    }
    async getDocuments(driverId) {
        return this.onboardingService.getDocuments(driverId);
    }
    async verifyDocument(id, body) {
        return this.onboardingService.verifyDocument(id, body.status, body.notes, body.verifierId);
    }
    async getOnboardingStatus(id) {
        return this.onboardingService.getOnboardingStatus(id);
    }
    async calculateIncentives(body) {
        return this.payoutService.calculateWeeklyIncentives(body.driverId, new Date(body.weekStart));
    }
    async generateIncentive(body) {
        return this.payoutService.generateIncentive(body.driverId, body.type, body.amount, body.description);
    }
    async approveIncentive(id, body) {
        return this.payoutService.approveIncentive(id, body.approverId);
    }
    async getPendingIncentives(driverId) {
        return this.payoutService.getPendingIncentives(driverId);
    }
};
exports.DriverOpsController = DriverOpsController;
__decorate([
    (0, common_1.Post)('onboarding'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "startOnboarding", null);
__decorate([
    (0, common_1.Post)('documents'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('documents/:driverId'),
    __param(0, (0, common_1.Param)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Put)('documents/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Get)('onboarding/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "getOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('incentives/calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "calculateIncentives", null);
__decorate([
    (0, common_1.Post)('incentives'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "generateIncentive", null);
__decorate([
    (0, common_1.Put)('incentives/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "approveIncentive", null);
__decorate([
    (0, common_1.Get)('incentives/pending'),
    __param(0, (0, common_1.Query)('driverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DriverOpsController.prototype, "getPendingIncentives", null);
exports.DriverOpsController = DriverOpsController = __decorate([
    (0, common_1.Controller)('drivers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.DELIVERY_PARTNER, user_interface_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [driver_onboarding_service_1.DriverOnboardingService,
        driver_payout_service_1.DriverPayoutService])
], DriverOpsController);
//# sourceMappingURL=driver-ops.controller.js.map