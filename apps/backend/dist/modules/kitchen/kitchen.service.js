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
exports.KitchenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_item_entity_1 = require("../../db/entities/inventory-item.entity");
const recipe_entity_1 = require("../../db/entities/recipe.entity");
const batch_entity_1 = require("../../db/entities/batch.entity");
const food_prep_entity_1 = require("../../db/entities/food-prep.entity");
const kitchen_sla_entity_1 = require("../../db/entities/kitchen-sla.entity");
const supplier_entity_1 = require("../../db/entities/supplier.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
let KitchenService = class KitchenService {
    constructor(inventoryRepo, recipeRepo, batchRepo, foodPrepRepo, slaRepo, supplierRepo, branchRepo, dataSource) {
        this.inventoryRepo = inventoryRepo;
        this.recipeRepo = recipeRepo;
        this.batchRepo = batchRepo;
        this.foodPrepRepo = foodPrepRepo;
        this.slaRepo = slaRepo;
        this.supplierRepo = supplierRepo;
        this.branchRepo = branchRepo;
        this.dataSource = dataSource;
    }
    async createInventoryItem(data) {
        const item = this.inventoryRepo.create(data);
        return this.inventoryRepo.save(item);
    }
    async updateInventoryStock(itemId, quantityChange) {
        const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
        if (!item) {
            throw new Error('Inventory item not found');
        }
        item.currentStock = Math.max(0, item.currentStock + quantityChange);
        return this.inventoryRepo.save(item);
    }
    async getLowStockItems(branchId) {
        return this.inventoryRepo.find({
            where: {
                branch: { id: branchId }
            }
        }).then(items => items.filter(item => item.currentStock < item.lowStockThreshold));
    }
    async createRecipe(data) {
        const recipe = this.recipeRepo.create(data);
        return this.recipeRepo.save(recipe);
    }
    async getRecipeById(id) {
        return this.recipeRepo.findOne({ where: { id }, relations: ['branch'] });
    }
    async createBatch(data) {
        const batch = this.batchRepo.create(data);
        return this.batchRepo.save(batch);
    }
    async updateBatchStatus(batchId, status) {
        const batch = await this.batchRepo.findOne({ where: { id: batchId } });
        if (!batch) {
            throw new Error('Batch not found');
        }
        batch.status = status;
        if (status === 'ready' || status === 'used' || status === 'discarded') {
            batch.completedAt = new Date();
        }
        return this.batchRepo.save(batch);
    }
    async logFoodPrep(data) {
        const foodPrep = this.foodPrepRepo.create(data);
        return this.foodPrepRepo.save(foodPrep);
    }
    async updateFoodPrepQuality(prepId, qualityData) {
        const foodPrep = await this.foodPrepRepo.findOne({ where: { id: prepId } });
        if (!foodPrep) {
            throw new Error('Food prep record not found');
        }
        foodPrep.qualityCheck = {
            ...(foodPrep.qualityCheck || { taste: 0, temperature: 0, appearance: 0, passed: false }),
            ...qualityData
        };
        return this.foodPrepRepo.save(foodPrep);
    }
    async recordKitchenSLA(data) {
        const sla = this.slaRepo.create(data);
        return this.slaRepo.save(sla);
    }
    async getKitchenSLABranch(branchId, metricName, limit = 100) {
        const where = { branch: { id: branchId } };
        if (metricName) {
            where.metricName = metricName;
        }
        return this.slaRepo.find({
            where,
            order: { measuredAt: 'DESC' },
            take: limit
        });
    }
    async createSupplier(data) {
        const supplier = this.supplierRepo.create(data);
        return this.supplierRepo.save(supplier);
    }
    async getSupplierInventory(supplierId) {
        return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
    }
    async getInventoryConsumption(branchId, days = 7) {
        return {
            branchId,
            periodDays: days,
            consumptionData: [],
            generatedAt: new Date()
        };
    }
    async forecastInventoryNeeds(branchId, daysAhead = 7) {
        return {
            branchId,
            forecastDays: daysAhead,
            predictions: [],
            generatedAt: new Date()
        };
    }
};
exports.KitchenService = KitchenService;
exports.KitchenService = KitchenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItemEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(recipe_entity_1.RecipeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(batch_entity_1.BatchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(food_prep_entity_1.FoodPrepEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(kitchen_sla_entity_1.KitchenSLAEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(supplier_entity_1.SupplierEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], KitchenService);
//# sourceMappingURL=kitchen.service.js.map