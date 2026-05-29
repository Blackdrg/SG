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
var KitchenService_1;
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
const inventory_alert_entity_1 = require("../../db/entities/inventory-alert.entity");
const sla_alert_entity_1 = require("../../db/entities/sla-alert.entity");
const menu_item_availability_entity_1 = require("../../db/entities/menu-item-availability.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const order_item_entity_1 = require("../../db/entities/order-item.entity");
let KitchenService = KitchenService_1 = class KitchenService {
    constructor(inventoryRepo, recipeRepo, batchRepo, foodPrepRepo, slaRepo, supplierRepo, branchRepo, inventoryAlertRepo, slaAlertRepo, menuItemAvailabilityRepo, orderRepo, orderItemRepo, dataSource) {
        this.inventoryRepo = inventoryRepo;
        this.recipeRepo = recipeRepo;
        this.batchRepo = batchRepo;
        this.foodPrepRepo = foodPrepRepo;
        this.slaRepo = slaRepo;
        this.supplierRepo = supplierRepo;
        this.branchRepo = branchRepo;
        this.inventoryAlertRepo = inventoryAlertRepo;
        this.slaAlertRepo = slaAlertRepo;
        this.menuItemAvailabilityRepo = menuItemAvailabilityRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(KitchenService_1.name);
    }
    async checkAndCreateInventoryAlert(itemId) {
        try {
            const item = await this.inventoryRepo.findOne({
                where: { id: itemId },
                relations: ['branch']
            });
            if (!item)
                return;
            if (item.currentStock === 0) {
                await this.createInventoryAlert(item.id, 'out_of_stock', item.currentStock, item.lowStockThreshold);
            }
            else if (item.currentStock <= item.lowStockThreshold) {
                await this.createInventoryAlert(item.id, 'low_stock', item.currentStock, item.lowStockThreshold);
            }
            else {
                await this.resolveInventoryAlerts(item.id, ['low_stock', 'out_of_stock']);
            }
        }
        catch (error) {
            this.logger.error(`Error checking inventory alerts for item ${itemId}`, error);
        }
    }
    async createInventoryAlert(itemId, alertType, currentLevel, thresholdLevel) {
        try {
            const item = await this.inventoryRepo.findOne({
                where: { id: itemId },
                relations: ['branch']
            });
            if (!item || !item.branch)
                return;
            const existingAlert = await this.inventoryAlertRepo.findOne({
                where: {
                    inventoryItem: { id: itemId },
                    alertType,
                    isResolved: false
                }
            });
            if (!existingAlert) {
                const alert = this.inventoryAlertRepo.create({
                    inventoryItem: item,
                    branch: item.branch,
                    alertType,
                    currentLevel,
                    thresholdLevel
                });
                await this.inventoryAlertRepo.save(alert);
                this.logger.log(`Created ${alertType} alert for item ${item.name}`);
            }
        }
        catch (error) {
            this.logger.error(`Error creating inventory alert`, error);
        }
    }
    async resolveInventoryAlerts(itemId, alertTypes) {
        try {
            await this.inventoryAlertRepo.update({
                inventoryItem: { id: itemId },
                alertType: (0, typeorm_2.In)(alertTypes),
                isResolved: false
            }, {
                isResolved: true,
                resolvedAt: new Date()
            });
        }
        catch (error) {
            this.logger.error(`Error resolving inventory alerts for item ${itemId}`, error);
        }
    }
    async checkAndCreateWastageAlert(itemId, wastedQuantity, reason) {
        try {
            const item = await this.inventoryRepo.findOne({
                where: { id: itemId },
                relations: ['branch']
            });
            if (!item)
                return;
            const totalUsage = item.currentStock + item.wastage;
            const wastagePercentage = totalUsage > 0 ? (item.wastage / totalUsage) * 100 : 0;
            if (wastagePercentage > 10) {
                const existingAlert = await this.inventoryAlertRepo.findOne({
                    where: {
                        inventoryItem: { id: itemId },
                        alertType: 'wastage_high',
                        isResolved: false
                    }
                });
                if (!existingAlert) {
                    const alert = this.inventoryAlertRepo.create({
                        inventoryItem: item,
                        branch: item.branch,
                        alertType: 'wastage_high',
                        currentLevel: wastagePercentage,
                        thresholdLevel: 10
                    });
                    await this.inventoryAlertRepo.save(alert);
                    this.logger.log(`Created wastage alert for item ${item.name}: ${wastagePercentage.toFixed(1)}% wastage`);
                }
            }
            else {
                await this.resolveInventoryAlerts(itemId, ['wastage_high']);
            }
        }
        catch (error) {
            this.logger.error(`Error checking wastage alerts for item ${itemId}`, error);
        }
    }
    async createInventoryItem(data) {
        const item = this.inventoryRepo.create(data);
        const savedItem = await this.inventoryRepo.save(item);
        await this.checkAndCreateInventoryAlert(savedItem.id);
        return savedItem;
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
        const savedItem = await this.inventoryRepo.save(item);
        await this.checkAndCreateInventoryAlert(itemId);
        return savedItem;
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
        const savedItem = await this.inventoryRepo.save(item);
        await this.checkAndCreateWastageAlert(itemId, wastedQuantity, reason);
        await this.checkAndCreateInventoryAlert(itemId);
        return savedItem;
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
        const savedBatch = await this.batchRepo.save(batch);
        if ((status === 'ready' || status === 'used' || status === 'discarded') && batch.startedAt) {
            await this.calculateAndRecordBatchTiming(batchId);
        }
        return savedBatch;
    }
    async logFoodPrep(data) {
        const foodPrep = this.foodPrepRepo.create(data);
        const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
        if (data.status === 'completed' && data.startedAt) {
            await this.calculateAndRecordFoodPrepTiming(savedFoodPrep.id);
        }
        return savedFoodPrep;
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
        const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
        if (foodPrep.status === 'completed' && foodPrep.startedAt && !foodPrep.actualPrepTimeMinutes) {
            await this.calculateAndRecordFoodPrepTiming(prepId);
        }
        return savedFoodPrep;
    }
    async calculateAndRecordFoodPrepTiming(prepId) {
        try {
            const foodPrep = await this.foodPrepRepo.findOne({
                where: { id: prepId },
                relations: ['batch', 'batch.recipe', 'branch']
            });
            if (!foodPrep || !foodPrep.startedAt)
                return;
            const completedAt = foodPrep.completedAt || new Date();
            const actualTimeMs = completedAt.getTime() - foodPrep.startedAt.getTime();
            const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);
            let estimatedTimeMinutes = 30;
            if (foodPrep.batch?.recipe?.prepTimeMinutes) {
                estimatedTimeMinutes = foodPrep.batch.recipe.prepTimeMinutes;
            }
            else if (foodPrep.batch?.recipe?.cookTimeMinutes) {
                estimatedTimeMinutes = foodPrep.batch.recipe.cookTimeMinutes;
            }
            const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;
            const delayReasons = [];
            if (delayMinutes > 10) {
                delayReasons.push('Preparation took longer than expected');
            }
            if (delayMinutes < -5) {
                delayReasons.push('Prepared faster than expected');
            }
            foodPrep.actualPrepTimeMinutes = actualTimeMinutes;
            foodPrep.estimatedPrepTimeMinutes = estimatedTimeMinutes;
            foodPrep.delayMinutes = delayMinutes;
            foodPrep.delayReasons = delayReasons;
            await this.foodPrepRepo.save(foodPrep);
            await this.recordPrepTimeSLA(foodPrep.branch.id, actualTimeMinutes, estimatedTimeMinutes);
            this.logger.log(`Calculated timing for food prep ${prepId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
        }
        catch (error) {
            this.logger.error(`Error calculating food prep timing for ${prepId}`, error);
        }
    }
    async calculateAndRecordBatchTiming(batchId) {
        try {
            const batch = await this.batchRepo.findOne({
                where: { id: batchId },
                relations: ['recipe', 'branch']
            });
            if (!batch || !batch.startedAt)
                return;
            const completedAt = batch.completedAt || new Date();
            const actualTimeMs = completedAt.getTime() - batch.startedAt.getTime();
            const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);
            let estimatedTimeMinutes = batch.estimatedPrepTimeMinutes ?? 0;
            if (!estimatedTimeMinutes && batch.recipe?.prepTimeMinutes) {
                estimatedTimeMinutes = batch.recipe.prepTimeMinutes;
            }
            else if (!estimatedTimeMinutes && batch.recipe?.cookTimeMinutes) {
                estimatedTimeMinutes = batch.recipe.cookTimeMinutes;
            }
            const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;
            const delayReasons = [];
            if (delayMinutes > 10) {
                delayReasons.push('Batch preparation took longer than expected');
            }
            if (delayMinutes < -5) {
                delayReasons.push('Batch prepared faster than expected');
            }
            batch.actualPrepTimeMinutes = actualTimeMinutes;
            batch.delayMinutes = delayMinutes;
            batch.delayReasons = delayReasons;
            await this.batchRepo.save(batch);
            this.logger.log(`Calculated timing for batch ${batchId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
        }
        catch (error) {
            this.logger.error(`Error calculating batch timing for ${batchId}`, error);
        }
    }
    async recordPrepTimeSLA(branchId, actualTime, targetTime) {
        try {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch)
                return;
            const isBreached = actualTime > targetTime;
            const breachSeverity = isBreached
                ? (actualTime > targetTime * 1.5 ? 'high' : actualTime > targetTime * 1.2 ? 'medium' : 'low')
                : null;
            const recentAlert = await this.slaAlertRepo.findOne({
                where: {
                    branch: { id: branchId },
                    slaType: 'prep_time',
                    createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60 * 60 * 1000))
                },
                order: { createdAt: 'DESC' }
            });
            if (isBreached && !recentAlert) {
                const alert = this.slaAlertRepo.create({
                    branch,
                    slaType: 'prep_time',
                    targetValue: targetTime,
                    actualValue: actualTime,
                    isBreached: true,
                    breachSeverity: breachSeverity
                });
                await this.slaAlertRepo.save(alert);
                this.logger.log(`Created prep time SLA alert for branch ${branchId}: ${actualTime.toFixed(1)}m vs ${targetTime.toFixed(1)}m target`);
            }
            else if (!isBreached && recentAlert) {
                await this.slaAlertRepo.update({ id: recentAlert.id }, { isBreached: false, isNotified: true });
            }
        }
        catch (error) {
            this.logger.error(`Error recording prep time SLA for branch ${branchId}`, error);
        }
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
    async calculateAndRecordFoodRejectionRate(branchId, period = 'hourly') {
        try {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch)
                throw new Error(`Branch not found: ${branchId}`);
            const now = new Date();
            let startDate;
            switch (period) {
                case 'hourly':
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case 'daily':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
            }
            const foodPrepRecords = await this.foodPrepRepo.find({
                where: {
                    branch: { id: branchId },
                    status: (0, typeorm_2.In)(['completed', 'failed']),
                    completedAt: (0, typeorm_2.Between)(startDate, now)
                }
            });
            if (foodPrepRecords.length === 0) {
                return this.recordKitchenSLA({
                    branch,
                    metricName: 'food_rejection_rate',
                    value: 0,
                    unit: 'percentage',
                    targetValue: 2,
                    targetUnit: 'percentage',
                    measurementPeriod: period,
                    measuredAt: now
                });
            }
            const failedCount = foodPrepRecords.filter(record => record.status === 'failed').length;
            const totalCount = foodPrepRecords.length;
            const rejectionRate = (totalCount > 0) ? (failedCount / totalCount) * 100 : 0;
            return this.recordKitchenSLA({
                branch,
                metricName: 'food_rejection_rate',
                value: rejectionRate,
                unit: 'percentage',
                targetValue: 2,
                targetUnit: 'percentage',
                measurementPeriod: period,
                measuredAt: now
            });
        }
        catch (error) {
            this.logger.error(`Error calculating food rejection rate for branch ${branchId}`, error);
            throw error;
        }
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
    async calculateAndRecordKitchenThroughput(branchId, period = 'hourly') {
        try {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch)
                throw new Error(`Branch not found: ${branchId}`);
            const now = new Date();
            let startDate;
            switch (period) {
                case 'hourly':
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case 'daily':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
            }
            const completedOrders = await this.orderRepo.count({
                where: {
                    restaurantId: branch.id,
                    status: (0, typeorm_2.In)(['delivered', 'completed']),
                    updatedAt: (0, typeorm_2.Between)(startDate, now)
                }
            });
            const hoursInPeriod = {
                hourly: 1,
                daily: 24,
                weekly: 24 * 7
            }[period];
            const ordersPerHour = completedOrders / hoursInPeriod;
            return this.recordKitchenSLA({
                branch,
                metricName: 'kitchen_throughput',
                value: ordersPerHour,
                unit: 'orders_per_hour',
                targetValue: 50,
                targetUnit: 'orders_per_hour',
                measurementPeriod: period,
                measuredAt: now
            });
        }
        catch (error) {
            this.logger.error(`Error calculating kitchen throughput for branch ${branchId}`, error);
            throw error;
        }
    }
    async calculateAndRecordAvgPrepTime(branchId, period = 'hourly') {
        try {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch)
                throw new Error(`Branch not found: ${branchId}`);
            const now = new Date();
            let startDate;
            switch (period) {
                case 'hourly':
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case 'daily':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
            }
            const foodPrepRecords = await this.foodPrepRepo.find({
                where: {
                    branch: { id: branchId },
                    status: 'completed',
                    actualPrepTimeMinutes: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()),
                    completedAt: (0, typeorm_2.Between)(startDate, now)
                }
            });
            if (foodPrepRecords.length === 0) {
                return this.recordKitchenSLA({
                    branch,
                    metricName: 'avg_prep_time',
                    value: 0,
                    unit: 'minutes',
                    targetValue: 30,
                    targetUnit: 'minutes',
                    measurementPeriod: period,
                    measuredAt: now
                });
            }
            const totalPrepTime = foodPrepRecords.reduce((sum, record) => sum + (record.actualPrepTimeMinutes || 0), 0);
            const avgPrepTime = totalPrepTime / foodPrepRecords.length;
            return this.recordKitchenSLA({
                branch,
                metricName: 'avg_prep_time',
                value: avgPrepTime,
                unit: 'minutes',
                targetValue: 30,
                targetUnit: 'minutes',
                measurementPeriod: period,
                measuredAt: now
            });
        }
        catch (error) {
            this.logger.error(`Error calculating average prep time for branch ${branchId}`, error);
            throw error;
        }
    }
    async recordPrepDelaySLA(branchId, actualDelay, targetDelay) {
        try {
            const branch = await this.branchRepo.findOne({ where: { id: branchId } });
            if (!branch)
                return;
            const isBreached = actualDelay > targetDelay;
            const breachSeverity = isBreached
                ? (actualDelay > targetDelay + 15 ? 'high' : actualDelay > targetDelay + 5 ? 'medium' : 'low')
                : null;
            const recentAlert = await this.slaAlertRepo.findOne({
                where: {
                    branch: { id: branchId },
                    slaType: 'prep_delay',
                    createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60 * 60 * 1000))
                },
                order: { createdAt: 'DESC' }
            });
            if (isBreached && !recentAlert) {
                const alert = this.slaAlertRepo.create({
                    branch,
                    slaType: 'prep_delay',
                    targetValue: targetDelay,
                    actualValue: actualDelay,
                    isBreached: true,
                    breachSeverity: breachSeverity
                });
                await this.slaAlertRepo.save(alert);
                this.logger.log(`Created prep delay SLA alert for branch ${branchId}: ${actualDelay.toFixed(1)}m delay vs ${targetDelay.toFixed(1)}m target`);
            }
            else if (!isBreached && recentAlert) {
                await this.slaAlertRepo.update({ id: recentAlert.id }, { isBreached: false, isNotified: true });
            }
        }
        catch (error) {
            this.logger.error(`Error recording prep delay SLA for branch ${branchId}`, error);
        }
    }
    async recordAllKitchenSLAs(branchId) {
        try {
            this.logger.log(`Recording all kitchen SLAs for branch ${branchId}`);
            await Promise.all([
                this.calculateAndRecordAvgPrepTime(branchId, 'hourly'),
                this.calculateAndRecordFoodRejectionRate(branchId, 'hourly'),
                this.calculateAndRecordKitchenThroughput(branchId, 'hourly')
            ]);
            this.logger.log(`Completed recording all kitchen SLAs for branch ${branchId}`);
        }
        catch (error) {
            this.logger.error(`Error recording all kitchen SLAs for branch ${branchId}`, error);
            throw error;
        }
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
exports.KitchenService = KitchenService = KitchenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_item_entity_1.InventoryItemEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(recipe_entity_1.RecipeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(batch_entity_1.BatchEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(food_prep_entity_1.FoodPrepEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(kitchen_sla_entity_1.KitchenSLAEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(supplier_entity_1.SupplierEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(restaurant_branch_entity_1.RestaurantBranchEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(inventory_alert_entity_1.InventoryAlertEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(sla_alert_entity_1.SLAAlertEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(menu_item_availability_entity_1.MenuItemAvailabilityEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], KitchenService);
//# sourceMappingURL=kitchen.service.js.map