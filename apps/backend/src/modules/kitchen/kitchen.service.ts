import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { InventoryItemEntity } = require('../../db/entities/inventory-item.entity');
import { RecipeEntity } = require('../../db/entities/recipe.entity');
import { BatchEntity } = require('../../db/entities/batch.entity');
import { FoodPrepEntity } = require('../../db/entities/food-prep.entity');
import { KitchenSLAEntity } = require('../../db/entities/kitchen-sla.entity');
import { SupplierEntity } = require('../../db/entities/supplier.entity');
import { RestaurantBranchEntity } = require('../../db/entities/restaurant-branch.entity');

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(InventoryItemEntity)
    private readonly inventoryRepo: Repository<InventoryItemEntity>,
    @InjectRepository(RecipeEntity)
    private readonly recipeRepo: Repository<RecipeEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepo: Repository<BatchEntity>,
    @InjectRepository(FoodPrepEntity)
    private readonly foodPrepRepo: Repository<FoodPrepEntity>,
    @InjectRepository(KitchenSLAEntity)
    private readonly slaRepo: Repository<KitchenSLAEntity>,
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    private readonly dataSource: DataSource
  ) {}

  // Inventory Management
  async createInventoryItem(data: Partial<InventoryItemEntity>): Promise<InventoryItemEntity> {
    const item = this.inventoryRepo.create(data);
    return this.inventoryRepo.save(item);
  }

  async updateInventoryStock(itemId: string, quantityChange: number): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    item.currentStock = Math.max(0, item.currentStock + quantityChange);
    // Update total cost based on unit cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    return this.inventoryRepo.save(item);
  }

  async recordWastage(itemId: string, wastedQuantity: number, reason?: string): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    // Increase wastage tracking
    item.wastage = (item.wastage || 0) + wastedQuantity;
    
    // Calculate wastage cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
    }
    
    // Reduce current stock by the wasted amount
    item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
    
    // Update total cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    
    // Optionally log the reason for wastage in a separate wastage log entity
    // For now, we're just tracking the quantities and costs
    
    return this.inventoryRepo.save(item);
  }

  async getLowStockItems(branchId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({
      where: {
        branch: { id: branchId }
      }
    }).then(items => 
      items.filter(item => item.currentStock < item.lowStockThreshold)
    );
  }

  async checkAndNotifyLowStock(branchId: string): Promise<{ lowStockItems: InventoryItemEntity[], notificationsSent: number }> {
    const lowStockItems = await this.getLowStockItems(branchId);
    
    // In a real implementation, we would send notifications via email, SMS, or push notifications
    // For now, we'll just return the count of items that would trigger notifications
    const notificationsSent = lowStockItems.length;
    
    // TODO: Integrate with notification service to send actual alerts
    // Example: await this.notificationService.sendLowStockAlert(branchId, lowStockItems);
    
    return {
      lowStockItems,
      notificationsSent
    };
  }

  // Recipe Management
  async createRecipe(data: Partial<RecipeEntity>): Promise<RecipeEntity> {
    const recipe = this.recipeRepo.create(data);
    return this.recipeRepo.save(recipe);
  }

  async getRecipeById(id: string): Promise<RecipeEntity> {
    return this.recipeRepo.findOne({ where: { id }, relations: ['branch'] });
  }

  // Batch Management
  async createBatch(data: Partial<BatchEntity>): Promise<BatchEntity> {
    const batch = this.batchRepo.create(data);
    return this.batchRepo.save(batch);
  }

  async updateBatchStatus(batchId: string, status: BatchEntity['status']): Promise<BatchEntity> {
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

  // Food Preparation Tracking
  async logFoodPrep(data: Partial<FoodPrepEntity>): Promise<FoodPrepEntity> {
    const foodPrep = this.foodPrepRepo.create(data);
    return this.foodPrepRepo.save(foodPrep);
  }

  async updateFoodPrepQuality(prepId: string, qualityData: Partial<FoodPrepEntity['qualityCheck']>): Promise<FoodPrepEntity> {
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

  // SLA Monitoring
  async recordKitchenSLA(data: Partial<KitchenSLAEntity>): Promise<KitchenSLAEntity> {
    const sla = this.slaRepo.create(data);
    return this.slaRepo.save(sla);
  }

  async recordAvgPrepTime(branchId: string, prepTimeMinutes: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'avg_prep_time',
      value: prepTimeMinutes,
      unit: 'minutes',
      targetValue: 30, // Example target: 30 minutes
      targetUnit: 'minutes',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordLatePrepPercentage(branchId: string, latePercentage: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'late_prep_percentage',
      value: latePercentage,
      unit: 'percentage',
      targetValue: 5, // Example target: less than 5% late
      targetUnit: 'percentage',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordFoodRejectionRate(branchId: string, rejectionRate: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'food_rejection_rate',
      value: rejectionRate,
      unit: 'percentage',
      targetValue: 2, // Example target: less than 2% rejection
      targetUnit: 'percentage',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordKitchenThroughput(branchId: string, ordersPerHour: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'kitchen_throughput',
      value: ordersPerHour,
      unit: 'orders_per_hour',
      targetValue: 50, // Example target: 50 orders per hour
      targetUnit: 'orders_per_hour',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async getKitchenSLABranch(branchId: string, metricName?: string, limit = 100): Promise<KitchenSLAEntity[]> {
    const where: any = { branch: { id: branchId } };
    if (metricName) {
      where.metricName = metricName;
    }
    return this.slaRepo.find({
      where,
      order: { measuredAt: 'DESC' },
      take: limit
    });
  }

  async getKitchenSLASummary(branchId: string, period: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<Record<string, any>> {
    const metrics = await this.slaRepo.find({
      where: { 
        branch: { id: branchId },
        measurementPeriod: period
      },
      order: { measuredAt: 'DESC' }
    });
    
    // Group by metric name and get the latest value for each
    const summary: Record<string, any> = {};
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

  // Supplier Management
  async createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  async getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
  }

  // Consumption Tracking & Forecasting (Enhanced implementations)
  async getInventoryConsumption(branchId: string, days = 7): Promise<any> {
    // Calculate actual consumption from food prep records
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // In a real implementation, we would join food prep with batches and recipes
    // to calculate ingredient consumption. For now, return enhanced placeholder
    return {
      branchId,
      periodDays: days,
      consumptionData: [
        // This would contain actual consumption per item
        { itemId: 'sample-item-1', itemName: 'Sample Ingredient', consumed: 10.5, unit: 'kg', cost: 52.50 }
      ],
      totalConsumptionCost: 52.50,
      generatedAt: new Date()
    };
  }

  async forecastInventoryNeeds(branchId: string, daysAhead = 7): Promise<any> {
    // Use historical consumption data to forecast future needs
    const consumption = await this.getInventoryConsumption(branchId, daysAhead * 2); // Look at past 2x period
    
    // Simple forecasting: average daily consumption * days ahead + safety stock
    return {
      branchId,
      forecastDays: daysAhead,
      predictions: consumption.consumptionData.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        predictedConsumption: item.consumed * (daysAhead / consumption.periodDays) * 1.2, // 20% safety stock
        unit: item.unit,
        recommendedOrderQuantity: Math.ceil(item.consumed * (daysAhead / consumption.periodDays) * 1.2)
      })),
      generatedAt: new Date()
    };
  }
}

  async updateInventoryStock(itemId: string, quantityChange: number): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    item.currentStock = Math.max(0, item.currentStock + quantityChange);
    // Update total cost based on unit cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    return this.inventoryRepo.save(item);
  }

  async recordWastage(itemId: string, wastedQuantity: number, reason?: string): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    // Increase wastage tracking
    item.wastage = (item.wastage || 0) + wastedQuantity;
    
    // Calculate wastage cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
    }
    
    // Reduce current stock by the wasted amount
    item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
    
    // Update total cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    
    return this.inventoryRepo.save(item);
  }

  async getLowStockItems(branchId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({
      where: {
        branch: { id: branchId }
      }
    }).then(items => 
      items.filter(item => item.currentStock < item.lowStockThreshold)
    );
  }

  async checkAndNotifyLowStock(branchId: string): Promise<{ lowStockItems: InventoryItemEntity[], notificationsSent: number }> {
    const lowStockItems = await this.getLowStockItems(branchId);
    
    // In a real implementation, we would send notifications via email, SMS, or push notifications
    // For now, we'll just return the count of items that would trigger notifications
    const notificationsSent = lowStockItems.length;
    
    // TODO: Integrate with notification service to send actual alerts
    // Example: await this.notificationService.sendLowStockAlert(branchId, lowStockItems);
    
    return {
      lowStockItems,
      notificationsSent
    };
  }

  async updateInventoryStock(itemId: string, quantityChange: number): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    item.currentStock = Math.max(0, item.currentStock + quantityChange);
    // Update total cost based on unit cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    return this.inventoryRepo.save(item);
  }

  async recordWastage(itemId: string, wastedQuantity: number, reason?: string): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    
    // Increase wastage tracking
    item.wastage = (item.wastage || 0) + wastedQuantity;
    
    // Calculate wastage cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.wastageCost = (item.wastageCost || 0) + (wastedQuantity * item.unitCost);
    }
    
    // Reduce current stock by the wasted amount
    item.currentStock = Math.max(0, item.currentStock - wastedQuantity);
    
    // Update total cost
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    
    // Optionally log the reason for wastage in a separate wastage log entity
    // For now, we're just tracking the quantities and costs
    
    return this.inventoryRepo.save(item);
  }

   async getLowStockItems(branchId: string): Promise<InventoryItemEntity[]> {
     return this.inventoryRepo.find({
       where: {
         branch: { id: branchId }
       }
     }).then(items => 
       items.filter(item => item.currentStock < item.lowStockThreshold)
     );
   }

  // Recipe Management
  async createRecipe(data: Partial<RecipeEntity>): Promise<RecipeEntity> {
    const recipe = this.recipeRepo.create(data);
    return this.recipeRepo.save(recipe);
  }

  async getRecipeById(id: string): Promise<RecipeEntity> {
    return this.recipeRepo.findOne({ where: { id }, relations: ['branch'] });
  }

  // Batch Management
  async createBatch(data: Partial<BatchEntity>): Promise<BatchEntity> {
    const batch = this.batchRepo.create(data);
    return this.batchRepo.save(batch);
  }

  async updateBatchStatus(batchId: string, status: BatchEntity['status']): Promise<BatchEntity> {
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

  // Food Preparation Tracking
  async logFoodPrep(data: Partial<FoodPrepEntity>): Promise<FoodPrepEntity> {
    const foodPrep = this.foodPrepRepo.create(data);
    return this.foodPrepRepo.save(foodPrep);
  }

   async updateFoodPrepQuality(prepId: string, qualityData: Partial<FoodPrepEntity['qualityCheck']>): Promise<FoodPrepEntity> {
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

  // SLA Monitoring
  async recordKitchenSLA(data: Partial<KitchenSLAEntity>): Promise<KitchenSLAEntity> {
    const sla = this.slaRepo.create(data);
    return this.slaRepo.save(sla);
  }

  async recordAvgPrepTime(branchId: string, prepTimeMinutes: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'avg_prep_time',
      value: prepTimeMinutes,
      unit: 'minutes',
      targetValue: 30, // Example target: 30 minutes
      targetUnit: 'minutes',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordLatePrepPercentage(branchId: string, latePercentage: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'late_prep_percentage',
      value: latePercentage,
      unit: 'percentage',
      targetValue: 5, // Example target: less than 5% late
      targetUnit: 'percentage',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordFoodRejectionRate(branchId: string, rejectionRate: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'food_rejection_rate',
      value: rejectionRate,
      unit: 'percentage',
      targetValue: 2, // Example target: less than 2% rejection
      targetUnit: 'percentage',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async recordKitchenThroughput(branchId: string, ordersPerHour: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    return this.recordKitchenSLA({
      branch: { id: branchId },
      metricName: 'kitchen_throughput',
      value: ordersPerHour,
      unit: 'orders_per_hour',
      targetValue: 50, // Example target: 50 orders per hour
      targetUnit: 'orders_per_hour',
      measurementPeriod: period,
      measuredAt: new Date()
    });
  }

  async getKitchenSLABranch(branchId: string, metricName?: string, limit = 100): Promise<KitchenSLAEntity[]> {
    const where: any = { branch: { id: branchId } };
    if (metricName) {
      where.metricName = metricName;
    }
    return this.slaRepo.find({
      where,
      order: { measuredAt: 'DESC' },
      take: limit
    });
  }

  async getKitchenSLASummary(branchId: string, period: 'hourly' | 'daily' | 'weekly' = 'daily'): Promise<Record<string, any>> {
    const metrics = await this.slaRepo.find({
      where: { 
        branch: { id: branchId },
        measurementPeriod: period
      },
      order: { measuredAt: 'DESC' }
    });
    
    // Group by metric name and get the latest value for each
    const summary: Record<string, any> = {};
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

  // Supplier Management
  async createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  async getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
  }

  // Consumption Tracking & Forecasting (Enhanced implementations)
  async getInventoryConsumption(branchId: string, days = 7): Promise<any> {
    // Calculate actual consumption from food prep records
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // In a real implementation, we would join food prep with batches and recipes
    // to calculate ingredient consumption. For now, return enhanced placeholder
    return {
      branchId,
      periodDays: days,
      consumptionData: [
        // This would contain actual consumption per item
        { itemId: 'sample-item-1', itemName: 'Sample Ingredient', consumed: 10.5, unit: 'kg', cost: 52.50 }
      ],
      totalConsumptionCost: 52.50,
      generatedAt: new Date()
    };
  }

  async forecastInventoryNeeds(branchId: string, daysAhead = 7): Promise<any> {
    // Use historical consumption data to forecast future needs
    const consumption = await this.getInventoryConsumption(branchId, daysAhead * 2); // Look at past 2x period
    
    // Simple forecasting: average daily consumption * days ahead + safety stock
    return {
      branchId,
      forecastDays: daysAhead,
      predictions: consumption.consumptionData.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        predictedConsumption: item.consumed * (daysAhead / consumption.periodDays) * 1.2, // 20% safety stock
        unit: item.unit,
        recommendedOrderQuantity: Math.ceil(item.consumed * (daysAhead / consumption.periodDays) * 1.2)
      })),
      generatedAt: new Date()
    };
  }
}