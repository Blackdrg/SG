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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const tax_reporting_service_1 = require("./tax-reporting.service");
const reconciliation_service_1 = require("./reconciliation.service");
let FinanceController = class FinanceController {
    constructor(taxService, reconciliationService) {
        this.taxService = taxService;
        this.reconciliationService = reconciliationService;
    }
    async getGSTReport(restaurantId, month, year) {
        return this.taxService.generateGSTReport(restaurantId, Number(month), Number(year));
    }
    async reconcilePayments(body) {
        return this.reconciliationService.reconcilePayments(new Date(body.startDate), new Date(body.endDate));
    }
    async reconcilePayouts(body) {
        return this.reconciliationService.reconcilePayouts(body.restaurantId, new Date(body.startDate), new Date(body.endDate));
    }
    async reconcileDriverPayments(body) {
        return this.reconciliationService.reconcileDriverPayments(body.driverId, new Date(body.startDate), new Date(body.endDate));
    }
    async runFullReconciliation(body) {
        return this.reconciliationService.runFullReconciliation({
            start: new Date(body.startDate),
            end: new Date(body.endDate),
        });
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('gst/report'),
    __param(0, (0, common_1.Query)('restaurantId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getGSTReport", null);
__decorate([
    (0, common_1.Post)('reconciliation/payments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "reconcilePayments", null);
__decorate([
    (0, common_1.Post)('reconciliation/payouts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "reconcilePayouts", null);
__decorate([
    (0, common_1.Post)('reconciliation/driver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "reconcileDriverPayments", null);
__decorate([
    (0, common_1.Post)('reconciliation/full'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "runFullReconciliation", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [tax_reporting_service_1.TaxReportingService,
        reconciliation_service_1.ReconciliationService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map