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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../security/jwt-auth.guard");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    getTopDishes(restaurantId, period = '30') {
        return this.analyticsService.getTopDishes(restaurantId, parseInt(period));
    }
    getChurnAnalysis(restaurantId, period = '90') {
        return this.analyticsService.getChurnAnalysis(restaurantId, parseInt(period));
    }
    getRepeatUsers(restaurantId, period = '90') {
        return this.analyticsService.getRepeatUsers(restaurantId, parseInt(period));
    }
    getConversion(restaurantId, period = '30') {
        return this.analyticsService.getConversionRate(restaurantId, parseInt(period));
    }
    getHeatmap(restaurantId, period = '30') {
        return this.analyticsService.getDeliveryHeatmap(restaurantId, parseInt(period));
    }
    getPeakHours(restaurantId, period = '30') {
        return this.analyticsService.getPeakHours(restaurantId, parseInt(period));
    }
    getRestaurantAnalytics(id) {
        return this.analyticsService.getRestaurantAnalytics(id);
    }
    getPlatformAnalytics() {
        return this.analyticsService.getPlatformAnalytics();
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('top-dishes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top selling dishes' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getTopDishes", null);
__decorate([
    (0, common_1.Get)('churn'),
    (0, swagger_1.ApiOperation)({ summary: 'Get churn analysis' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getChurnAnalysis", null);
__decorate([
    (0, common_1.Get)('repeat-users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get repeat user analytics' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRepeatUsers", null);
__decorate([
    (0, common_1.Get)('conversion'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversion funnel' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getConversion", null);
__decorate([
    (0, common_1.Get)('heatmap'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery heatmap' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getHeatmap", null);
__decorate([
    (0, common_1.Get)('peak-hours'),
    (0, swagger_1.ApiOperation)({ summary: 'Get peak hours analysis' }),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPeakHours", null);
__decorate([
    (0, common_1.Get)('restaurant/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get full restaurant analytics' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getRestaurantAnalytics", null);
__decorate([
    (0, common_1.Get)('platform'),
    (0, swagger_1.ApiOperation)({ summary: 'Get platform-wide analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getPlatformAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('analytics'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map