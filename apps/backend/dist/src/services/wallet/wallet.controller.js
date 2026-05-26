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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("./wallet.service");
const jwt_auth_guard_1 = require("../../security/jwt-auth.guard");
const roles_guard_1 = require("../../security/roles.guard");
const roles_decorator_1 = require("../../security/roles.decorator");
const user_interface_1 = require("../../shared/domain/user.interface");
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async getWallet(req) {
        return await this.walletService.getWallet(req.user.id);
    }
    async getBalance(req) {
        return await this.walletService.getWalletBalance(req.user.id);
    }
    async getTransactions(req, limit = 20, offset = 0) {
        return await this.walletService.getWalletTransactions(req.user.id, limit, offset);
    }
    async creditWallet(req, amount, description, referenceId) {
        return await this.walletService.creditWallet(req.user.id, amount, description, referenceId);
    }
    async debitWallet(req, amount, description, referenceId) {
        return await this.walletService.debitWallet(req.user.id, amount, description, referenceId);
    }
    async compensateUser(req, amount, reason) {
        return await this.walletService.compensateUser(req.user.id, amount, reason);
    }
    async processCODPayment(req, orderId, amount) {
        return await this.walletService.processCODPayment(orderId, amount, req.user.id);
    }
    async confirmCODCollection(req, orderId, amount) {
        return await this.walletService.confirmCODCollection(orderId, amount, req.user.id);
    }
    async refundCOD(req, orderId, amount, reason) {
        return await this.walletService.refundCOD(orderId, amount, req.user.id, reason);
    }
    async preventDuplicatePayment(req, orderId, amount) {
        const isAllowed = await this.walletService.preventDoublePayment(req.user.id, orderId, amount);
        return { allowed: isAllowed };
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('balance'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('limit')),
    __param(2, (0, common_1.Body)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('credit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('description')),
    __param(3, (0, common_1.Body)('referenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "creditWallet", null);
__decorate([
    (0, common_1.Post)('debit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('description')),
    __param(3, (0, common_1.Body)('referenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "debitWallet", null);
__decorate([
    (0, common_1.Post)('compensate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "compensateUser", null);
__decorate([
    (0, common_1.Post)('cod/process'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "processCODPayment", null);
__decorate([
    (0, common_1.Post)('cod/confirm'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "confirmCODCollection", null);
__decorate([
    (0, common_1.Post)('cod/refund'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "refundCOD", null);
__decorate([
    (0, common_1.Post)('prevent-duplicate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "preventDuplicatePayment", null);
exports.WalletController = WalletController = __decorate([
    (0, common_1.Controller)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_interface_1.UserRole.CUSTOMER),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map