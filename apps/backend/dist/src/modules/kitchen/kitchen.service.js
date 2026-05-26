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
const module_1 = require();
const module_2 = require();
const module_3 = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
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
        return this.recordKitchenSLA({
            branch: { id: branchId },
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
        return this.recordKitchenSLA({
            branch: { id: branchId },
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
        return this.recordKitchenSLA({
            branch: { id: branchId },
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
        return this.recordKitchenSLA({
            branch: { id: branchId },
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
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
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
};
exports.KitchenService = KitchenService;
exports.KitchenService = KitchenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(module_1.InventoryItemEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(module_2.RecipeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(module_3.BatchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(module_4.FoodPrepEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(module_5.KitchenSLAEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(module_6.SupplierEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(module_7.RestaurantBranchEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], KitchenService);
async;
updateInventoryStock(itemId, string, quantityChange, number);
Promise < module_1.InventoryItemEntity > {
    const: item = await this.inventoryRepo.findOne({ where: { id: itemId } }),
    if(, item) {
        throw new Error('Inventory item not found');
    },
    item, : .currentStock = Math.max(0, item.currentStock + quantityChange),
    if(item) { }, : .unitCost !== null && item.unitCost !== undefined
};
{
    item.totalCost = item.currentStock * item.unitCost;
}
return this.inventoryRepo.save(item);
async;
recordWastage(itemId, string, wastedQuantity, number, reason ?  : string);
Promise < module_1.InventoryItemEntity > {
    const: item = await this.inventoryRepo.findOne({ where: { id: itemId } }),
    if(, item) {
        throw new Error('Inventory item not found');
    },
    item, : .wastage = (item.wastage || 0) + wastedQuantity,
    if(item) { }, : .unitCost !== null && item.unitCost !== undefined
};
{
    item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
}
item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
if (item.unitCost !== null && item.unitCost !== undefined) {
    item.totalCost = item.currentStock * item.unitCost;
}
return this.inventoryRepo.save(item);
async;
getLowStockItems(branchId, string);
Promise < module_1.InventoryItemEntity[] > {
    return: this.inventoryRepo.find({
        where: {
            branch: { id: branchId }
        }
    }).then(items => items.filter(item => item.currentStock < item.lowStockThreshold))
};
async;
checkAndNotifyLowStock(branchId, string);
Promise < { lowStockItems: module_1.InventoryItemEntity[], notificationsSent: number } > {
    const: lowStockItems = await this.getLowStockItems(branchId),
    const: notificationsSent = lowStockItems.length,
    return: {
        lowStockItems,
        notificationsSent
    }
};
async;
updateInventoryStock(itemId, string, quantityChange, number);
Promise < module_1.InventoryItemEntity > {
    const: item = await this.inventoryRepo.findOne({ where: { id: itemId } }),
    if(, item) {
        throw new Error('Inventory item not found');
    },
    item, : .currentStock = Math.max(0, item.currentStock + quantityChange),
    if(item) { }, : .unitCost !== null && item.unitCost !== undefined
};
{
    item.totalCost = item.currentStock * item.unitCost;
}
return this.inventoryRepo.save(item);
async;
recordWastage(itemId, string, wastedQuantity, number, reason ?  : string);
Promise < module_1.InventoryItemEntity > {
    const: item = await this.inventoryRepo.findOne({ where: { id: itemId } }),
    if(, item) {
        throw new Error('Inventory item not found');
    },
    item, : .wastage = (item.wastage || 0) + wastedQuantity,
    if(item) { }, : .unitCost !== null && item.unitCost !== undefined
};
{
    item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
}
item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
if (item.unitCost !== null && item.unitCost !== undefined) {
    item.totalCost = item.currentStock * item.unitCost;
}
return this.inventoryRepo.save(item);
async;
getLowStockItems(branchId, string);
Promise < module_1.InventoryItemEntity[] > {
    return: this.inventoryRepo.find({
        where: {
            branch: { id: branchId }
        }
    }).then(items => items.filter(item => item.currentStock < item.lowStockThreshold))
};
async;
createRecipe(data, (Partial));
Promise < module_2.RecipeEntity > {
    const: recipe = this.recipeRepo.create(data),
    return: this.recipeRepo.save(recipe)
};
async;
getRecipeById(id, string);
Promise < module_2.RecipeEntity > {
    return: this.recipeRepo.findOne({ where: { id }, relations: ['branch'] })
};
async;
createBatch(data, (Partial));
Promise < module_3.BatchEntity > {
    const: batch = this.batchRepo.create(data),
    return: this.batchRepo.save(batch)
};
async;
updateBatchStatus(batchId, string, status, module_3.BatchEntity['status']);
Promise < module_3.BatchEntity > {
    const: batch = await this.batchRepo.findOne({ where: { id: batchId } }),
    if(, batch) {
        throw new Error('Batch not found');
    },
    batch, : .status = status,
    if(status) { }
} === 'ready' || status === 'used' || status === 'discarded';
{
    batch.completedAt = new Date();
}
return this.batchRepo.save(batch);
async;
logFoodPrep(data, (Partial));
Promise < module_4.FoodPrepEntity > {
    const: foodPrep = this.foodPrepRepo.create(data),
    return: this.foodPrepRepo.save(foodPrep)
};
async;
updateFoodPrepQuality(prepId, string, qualityData, (Partial));
Promise < module_4.FoodPrepEntity > {
    const: foodPrep = await this.foodPrepRepo.findOne({ where: { id: prepId } }),
    if(, foodPrep) {
        throw new Error('Food prep record not found');
    },
    foodPrep, : .qualityCheck = {
        ...(foodPrep.qualityCheck || { taste: 0, temperature: 0, appearance: 0, passed: false }),
        ...qualityData
    },
    return: this.foodPrepRepo.save(foodPrep)
};
async;
recordKitchenSLA(data, (Partial));
Promise < module_5.KitchenSLAEntity > {
    const: sla = this.slaRepo.create(data),
    return: this.slaRepo.save(sla)
};
async;
recordAvgPrepTime(branchId, string, prepTimeMinutes, number, period, 'hourly' | 'daily' | 'weekly', 'hourly');
Promise < module_5.KitchenSLAEntity > {
    return: this.recordKitchenSLA({
        branch: { id: branchId },
        metricName: 'avg_prep_time',
        value: prepTimeMinutes,
        unit: 'minutes',
        targetValue: 30,
        targetUnit: 'minutes',
        measurementPeriod: period,
        measuredAt: new Date()
    })
};
async;
recordLatePrepPercentage(branchId, string, latePercentage, number, period, 'hourly' | 'daily' | 'weekly', 'hourly');
Promise < module_5.KitchenSLAEntity > {
    return: this.recordKitchenSLA({
        branch: { id: branchId },
        metricName: 'late_prep_percentage',
        value: latePercentage,
        unit: 'percentage',
        targetValue: 5,
        targetUnit: 'percentage',
        measurementPeriod: period,
        measuredAt: new Date()
    })
};
async;
recordFoodRejectionRate(branchId, string, rejectionRate, number, period, 'hourly' | 'daily' | 'weekly', 'hourly');
Promise < module_5.KitchenSLAEntity > {
    return: this.recordKitchenSLA({
        branch: { id: branchId },
        metricName: 'food_rejection_rate',
        value: rejectionRate,
        unit: 'percentage',
        targetValue: 2,
        targetUnit: 'percentage',
        measurementPeriod: period,
        measuredAt: new Date()
    })
};
async;
recordKitchenThroughput(branchId, string, ordersPerHour, number, period, 'hourly' | 'daily' | 'weekly', 'hourly');
Promise < module_5.KitchenSLAEntity > {
    return: this.recordKitchenSLA({
        branch: { id: branchId },
        metricName: 'kitchen_throughput',
        value: ordersPerHour,
        unit: 'orders_per_hour',
        targetValue: 50,
        targetUnit: 'orders_per_hour',
        measurementPeriod: period,
        measuredAt: new Date()
    })
};
async;
getKitchenSLABranch(branchId, string, metricName ?  : string, limit = 100);
Promise < module_5.KitchenSLAEntity[] > {
    const: where, any = { branch: { id: branchId } },
    if(metricName) {
        where.metricName = metricName;
    },
    return: this.slaRepo.find({
        where,
        order: { measuredAt: 'DESC' },
        take: limit
    })
};
async;
getKitchenSLASummary(branchId, string, period, 'hourly' | 'daily' | 'weekly', 'daily');
Promise < Record < string, any >> {
    const: metrics = await this.slaRepo.find({
        where: {
            branch: { id: branchId },
            measurementPeriod: period
        },
        order: { measuredAt: 'DESC' }
    }),
    const: summary
};
{ }
;
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
async;
createSupplier(data, (Partial));
Promise < module_6.SupplierEntity > {
    const: supplier = this.supplierRepo.create(data),
    return: this.supplierRepo.save(supplier)
};
async;
getSupplierInventory(supplierId, string);
Promise < module_1.InventoryItemEntity[] > {
    return: this.inventoryRepo.find({ where: { supplier: { id: supplierId } } })
};
async;
getInventoryConsumption(branchId, string, days = 7);
Promise < any > {
    const: startDate = new Date(),
    startDate, : .setDate(startDate.getDate() - days),
    return: {
        branchId,
        periodDays: days,
        consumptionData: [
            { itemId: 'sample-item-1', itemName: 'Sample Ingredient', consumed: 10.5, unit: 'kg', cost: 52.50 }
        ],
        totalConsumptionCost: 52.50,
        generatedAt: new Date()
    }
};
async;
forecastInventoryNeeds(branchId, string, daysAhead = 7);
Promise < any > {
    const: consumption = await this.getInventoryConsumption(branchId, daysAhead * 2),
    return: {
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
    }
};
//# sourceMappingURL=kitchen.service.js.map