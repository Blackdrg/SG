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
        if (item.unitCost !== null && item.unitCost !== undefined) {
            item.totalCost = item.currentStock * item.unitCost;
        }
        return this.inventoryRepo.save(item);
    }
    async recordWastage(itemId, wastedQuantity, reason) {
        const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
        if (!item) {
            throw new Error('Inventory item not found');
        }
        item.wastage = (item.wastage || 0) + wastedQuantity;
        if (item.unitCost !== null && item.unitCost !== undefined) {
            item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
        }
        item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
        if (item.unitCost !== null && item.unitCost !== undefined) {
            item.totalCost = item.currentStock * item.unitCost;
        }
        return this.inventoryRepo.save(item);
    }
    async getLowStockItems(branchId) {
        return this.inventoryRepo.find({
            where: {
                branch: { id: branchId }
            }
        }).then(items => items.filter(item => item.currentStock < item.lowStockThreshold));
    }
    async checkAndNotifyLowStock(branchId) {
        const lowStockItems = await this.getLowStockItems(branchId);
        const notificationsSent = lowStockItems.length;
        return {
            lowStockItems,
            notificationsSent
        };
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
    async recordAvgPrepTime(branchId, prepTimeMinutes, period = 'hourly') {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        return this.recordKitchenSLA({
            branch,
            metricName: 'avg_prep_time',
            value: prepTimeMinutes,
            unit: 'minutes',
            targetValue: 30,
            targetUnit: 'minutes',
            measurementPeriod: period,
            measuredAt: new Date()
        });
    }
    async recordLatePrepPercentage(branchId, latePercentage, period = 'hourly') {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        return this.recordKitchenSLA({
            branch,
            metricName: 'late_prep_percentage',
            value: latePercentage,
            unit: 'percentage',
            targetValue: 5,
            targetUnit: 'percentage',
            measurementPeriod: period,
            measuredAt: new Date()
        });
    }
    async recordFoodRejectionRate(branchId, rejectionRate, period = 'hourly') {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        return this.recordKitchenSLA({
            branch,
            metricName: 'food_rejection_rate',
            value: rejectionRate,
            unit: 'percentage',
            targetValue: 2,
            targetUnit: 'percentage',
            measurementPeriod: period,
            measuredAt: new Date()
        });
    }
    async recordKitchenThroughput(branchId, ordersPerHour, period = 'hourly') {
        const branch = await this.branchRepo.findOne({ where: { id: branchId } });
        return this.recordKitchenSLA({
            branch,
            metricName: 'kitchen_throughput',
            value: ordersPerHour,
            unit: 'orders_per_hour',
            targetValue: 50,
            targetUnit: 'orders_per_hour',
            measurementPeriod: period,
            measuredAt: new Date()
        });
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
    async getKitchenSLASummary(branchId, period = 'daily') {
        const metrics = await this.slaRepo.find({
            where: {
                branch: { id: branchId },
                measurementPeriod: period
            },
            order: { measuredAt: 'DESC' }
        });
        const summary = {};
        for (const metric of metrics) {
            if (!summary[metric.metricName] || new Date(metric.measuredAt) > new Date(summary[metric.metricName].measuredAt)) {
                summary[metric.metricName] = {
                    value: metric.value,
                    unit: metric.unit,
                    targetValue: metric.targetValue,
                    targetUnit: metric.targetUnit,
                    measuredAt: metric.measuredAt
                };
            }
        }
        return summary;
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
            consumptionData: [
                { itemId: 'sample-item-1', itemName: 'Sample Ingredient', consumed: 10.5, unit: 'kg', cost: 52.50 }
            ],
            totalConsumptionCost: 52.50,
            generatedAt: new Date()
        };
    }
    async forecastInventoryNeeds(branchId, daysAhead = 7) {
        const consumption = await this.getInventoryConsumption(branchId, daysAhead * 2);
        return {
            branchId,
            forecastDays: daysAhead,
            predictions: consumption.consumptionData.map(item => ({
                itemId: item.itemId,
                itemName: item.itemName,
                predictedConsumption: item.consumed * (daysAhead / consumption.periodDays) * 1.2,
                unit: item.unit,
                recommendedOrderQuantity: Math.ceil(item.consumed * (daysAhead / consumption.periodDays) * 1.2)
            })),
            generatedAt: new Date()
        };
    }
    async getKitchenAnalytics(branchId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalOrders, avgPrepTime, rejectionRate, throughput] = await Promise.all([
            this.slaRepo.count({
                where: {
                    branch: { id: branchId },
                    metricName: 'kitchen_throughput'
                }
            }),
            this.slaRepo.findOne({
                where: {
                    branch: { id: branchId },
                    metricName: 'avg_prep_time',
                    measuredAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo)
                },
                order: { measuredAt: 'DESC' }
            }),
            this.slaRepo.findOne({
                where: {
                    branch: { id: branchId },
                    metricName: 'food_rejection_rate',
                    measuredAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo)
                },
                order: { measuredAt: 'DESC' }
            }),
            this.slaRepo.findOne({
                where: {
                    branch: { id: branchId },
                    metricName: 'kitchen_throughput',
                    measuredAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo)
                },
                order: { measuredAt: 'DESC' }
            })
        ]);
        return {
            branchId,
            period: '30 days',
            totalOrdersProcessed: totalOrders,
            avgPrepTimeMinutes: avgPrepTime?.value || 0,
            rejectionRate: rejectionRate?.value || 0,
            ordersPerHour: throughput?.value || 0,
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