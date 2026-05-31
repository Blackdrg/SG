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
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const loyalty_service_1 = require("./loyalty.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
let LoyaltyController = class LoyaltyController {
    constructor(loyaltyService) {
        this.loyaltyService = loyaltyService;
    }
    createCoupon(data) {
        return this.loyaltyService.createCoupon(data);
    }
    applyCoupon(body) {
        return this.loyaltyService.applyCoupon(body.code, body.userId, body.orderAmount, body.orderId);
    }
    getCoupons(filters) {
        return this.loyaltyService.getAllCoupons(filters);
    }
    getCouponAnalytics(id) {
        return this.loyaltyService.getCouponAnalytics(id);
    }
    deactivateCoupon(id) {
        return this.loyaltyService.deactivateCoupon(id);
    }
    generateReferralCode(body) {
        return this.loyaltyService.generateReferralCode(body.userId);
    }
    processReferral(body) {
        return this.loyaltyService.processReferral(body.code, body.refereeId, body.firstOrderId);
    }
    getReferralHistory(userId) {
        return this.loyaltyService.getReferralHistory(userId);
    }
    processCashback(body) {
        return this.loyaltyService.processCashback(body.userId, body.orderId, body.orderAmount);
    }
    getWalletCashback(userId) {
        return this.loyaltyService.getWalletCashback(userId);
    }
};
exports.LoyaltyController = LoyaltyController;
__decorate([
    (0, common_1.Post)('coupons'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coupon' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Post)('coupons/apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply coupon to order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "applyCoupon", null);
__decorate([
    (0, common_1.Get)('coupons'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all coupons' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "getCoupons", null);
__decorate([
    (0, common_1.Get)('coupons/:id/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get coupon analytics' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "getCouponAnalytics", null);
__decorate([
    (0, common_1.Put)('coupons/:id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate coupon' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "deactivateCoupon", null);
__decorate([
    (0, common_1.Post)('referrals/code'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate referral code' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "generateReferralCode", null);
__decorate([
    (0, common_1.Post)('referrals/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process referral' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "processReferral", null);
__decorate([
    (0, common_1.Get)('referrals/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get referral history' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "getReferralHistory", null);
__decorate([
    (0, common_1.Post)('cashback/process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process cashback for order' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "processCashback", null);
__decorate([
    (0, common_1.Get)('cashback/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user cashback summary' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoyaltyController.prototype, "getWalletCashback", null);
exports.LoyaltyController = LoyaltyController = __decorate([
    (0, swagger_1.ApiTags)('loyalty'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('loyalty'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [loyalty_service_1.LoyaltyService])
], LoyaltyController);
//# sourceMappingURL=loyalty.controller.js.map