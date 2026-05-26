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
exports.KitchenController = void 0;
const common_1 = require("@nestjs/common");
const kitchen_service_1 = require("./kitchen.service");
let KitchenController = class KitchenController {
    constructor(kitchenService) {
        this.kitchenService = kitchenService;
    }
    async createInventoryItem(data) {
        return this.kitchenService.createInventoryItem(data);
    }
    async updateInventoryStock(id, quantityChange) {
        return this.kitchenService.updateInventoryStock(id, quantityChange);
    }
    async getLowStockItems(branchId) {
        return this.kitchenService.getLowStockItems(branchId);
    }
    async createRecipe(data) {
        return this.kitchenService.createRecipe(data);
    }
    async getRecipeById(id) {
        return this.kitchenService.getRecipeById(id);
    }
    async createBatch(data) {
        return this.kitchenService.createBatch(data);
    }
    async updateBatchStatus(id, status) {
        return this.kitchenService.updateBatchStatus(id, status);
    }
    async logFoodPrep(data) {
        return this.kitchenService.logFoodPrep(data);
    }
    async updateFoodPrepQuality(id, qualityData) {
        return this.kitchenService.updateFoodPrepQuality(id, qualityData);
    }
    async recordKitchenSLA(data) {
        return this.kitchenService.recordKitchenSLA(data);
    }
    async getKitchenSLABranch(branchId, metricName, limit = 100) {
        return this.kitchenService.getKitchenSLABranch(branchId, metricName, limit);
    }
    async createSupplier(data) {
        return this.kitchenService.createSupplier(data);
    }
    async getSupplierInventory(supplierId) {
        return this.kitchenService.getSupplierInventory(supplierId);
    }
    async getInventoryConsumption(branchId, days = 7) {
        return this.kitchenService.getInventoryConsumption(branchId, days);
    }
    async forecastInventoryNeeds(branchId, daysAhead = 7) {
        return this.kitchenService.forecastInventoryNeeds(branchId, daysAhead);
    }
};
exports.KitchenController = KitchenController;
__decorate([
    (0, common_1.Post)('inventory'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "createInventoryItem", null);
__decorate([
    (0, common_1.Put)('inventory/:id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('quantityChange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "updateInventoryStock", null);
__decorate([
    (0, common_1.Get)('inventory/low-stock/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getLowStockItems", null);
__decorate([
    (0, common_1.Post)('recipes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "createRecipe", null);
__decorate([
    (0, common_1.Get)('recipes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getRecipeById", null);
__decorate([
    (0, common_1.Post)('batches'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Put)('batches/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "updateBatchStatus", null);
__decorate([
    (0, common_1.Post)('food-prep'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "logFoodPrep", null);
__decorate([
    (0, common_1.Put)('food-prep/:id/quality'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "updateFoodPrepQuality", null);
__decorate([
    (0, common_1.Post)('sla'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "recordKitchenSLA", null);
__decorate([
    (0, common_1.Get)('sla/branch/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Query)('metricName')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getKitchenSLABranch", null);
__decorate([
    (0, common_1.Post)('suppliers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "createSupplier", null);
__decorate([
    (0, common_1.Get)('suppliers/:id/inventory'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getSupplierInventory", null);
__decorate([
    (0, common_1.Get)('inventory/consumption/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getInventoryConsumption", null);
__decorate([
    (0, common_1.Get)('inventory/forecast/:branchId'),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Query)('daysAhead')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "forecastInventoryNeeds", null);
exports.KitchenController = KitchenController = __decorate([
    (0, common_1.Controller)('kitchen'),
    __metadata("design:paramtypes", [kitchen_service_1.KitchenService])
], KitchenController);
//# sourceMappingURL=kitchen.controller.js.map