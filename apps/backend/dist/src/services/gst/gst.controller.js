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
exports.GSTController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
const gst_service_1 = require("./gst.service");
let GSTController = class GSTController {
    constructor(gstService) {
        this.gstService = gstService;
    }
    async calculateGST(orderId) {
        return this.gstService.calculateGSTForOrder(orderId);
    }
    async generateGSTInvoice(orderId) {
        return this.gstService.generateGSTInvoice(orderId);
    }
    async getGSTRateSummary(orderId) {
        return this.gstService.getGSTRateSummary(orderId);
    }
    validateGSTIN(gstin) {
        return { valid: this.gstService.validateGSTIN(gstin) };
    }
};
exports.GSTController = GSTController;
__decorate([
    (0, common_1.Post)('calculate/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.RESTAURANT),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GSTController.prototype, "calculateGST", null);
__decorate([
    (0, common_1.Get)('invoice/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.RESTAURANT, user_interface_1.UserRole.USER),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GSTController.prototype, "generateGSTInvoice", null);
__decorate([
    (0, common_1.Get)('rate-summary/:orderId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.RESTAURANT),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GSTController.prototype, "getGSTRateSummary", null);
__decorate([
    (0, common_1.Post)('validate-gstin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.RESTAURANT),
    __param(0, (0, common_1.Body)('gstin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GSTController.prototype, "validateGSTIN", null);
exports.GSTController = GSTController = __decorate([
    (0, common_1.Controller)('gst'),
    __metadata("design:paramtypes", [gst_service_1.GSTService])
], GSTController);
//# sourceMappingURL=gst.controller.js.map