import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, MoreThan, LessThan, Between, IsNull, Not } from 'typeorm';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { RecipeEntity } from '../../db/entities/recipe.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { FoodPrepEntity } from '../../db/entities/food-prep.entity';
import { KitchenSLAEntity } from '../../db/entities/kitchen-sla.entity';
import { SupplierEntity } from '../../db/entities/supplier.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { InventoryAlertEntity } from '../../db/entities/inventory-alert.entity';
import { SLAAlertEntity } from '../../db/entities/sla-alert.entity';
import { MenuItemAvailabilityEntity } from '../../db/entities/menu-item-availability.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';

@Injectable()
export class KitchenService {
  private readonly logger = new Logger(KitchenService.name);

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
    @InjectRepository(InventoryAlertEntity)
    private readonly inventoryAlertRepo: Repository<InventoryAlertEntity>,
    @InjectRepository(SLAAlertEntity)
    private readonly slaAlertRepo: Repository<SLAAlertEntity>,
    @InjectRepository(MenuItemAvailabilityEntity)
    private readonly menuItemAvailabilityRepo: Repository<MenuItemAvailabilityEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    private readonly dataSource: DataSource
  ) {}

  /**
   * Check inventory levels and create alerts if thresholds are breached
   */
  private async checkAndCreateInventoryAlert(itemId: string): Promise<void> {
    try {
      const item = await this.inventoryRepo.findOne({
        where: { id: itemId },
        relations: ['branch']
      });
      
      if (!item) return;

      // Check for out of stock
      if (item.currentStock === 0) {
        await this.createInventoryAlert(
          item.id,
          'out_of_stock',
          item.currentStock,
          item.lowStockThreshold
        );
      } 
      // Check for low stock
      else if (item.currentStock <= item.lowStockThreshold) {
        await this.createInventoryAlert(
          item.id,
          'low_stock',
          item.currentStock,
          item.lowStockThreshold
        );
      }
      // Check if we should resolve existing alerts
      else {
        await this.resolveInventoryAlerts(item.id, ['low_stock', 'out_of_stock']);
      }
    } catch (error) {
      this.logger.error(`Error checking inventory alerts for item ${itemId}`, error);
    }
  }

  /**
   * Create an inventory alert
   */
  private async createInventoryAlert(
    itemId: string,
    alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'wastage_high',
    currentLevel: number,
    thresholdLevel: number
  ): Promise<void> {
    try {
      const item = await this.inventoryRepo.findOne({
        where: { id: itemId },
        relations: ['branch']
      });
      
      if (!item || !item.branch) return;

      // Check if there's already an active alert of this type for this item
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
    } catch (error) {
      this.logger.error(`Error creating inventory alert`, error);
    }
  }

  /**
   * Resolve inventory alerts for an item
   */
  private async resolveInventoryAlerts(itemId: string, alertTypes: string[]): Promise<void> {
    try {
      await this.inventoryAlertRepo.update(
        {
          inventoryItem: { id: itemId },
          alertType: In(alertTypes),
          isResolved: false
        },
        {
          isResolved: true,
          resolvedAt: new Date()
        }
      );
    } catch (error) {
      this.logger.error(`Error resolving inventory alerts for item ${itemId}`, error);
    }
  }

  /**
   * Check and create wastage alerts based on wastage percentage
   */
  private async checkAndCreateWastageAlert(itemId: string, wastedQuantity: number, reason?: string): Promise<void> {
    try {
      const item = await this.inventoryRepo.findOne({
        where: { id: itemId },
        relations: ['branch']
      });
      
      if (!item) return;

      // Calculate wastage percentage (wastage / total used + wastage)
      // For simplicity, we'll use wastage vs current stock + wastage as proxy for total usage
      const totalUsage = item.currentStock + item.wastage;
      const wastagePercentage = totalUsage > 0 ? (item.wastage / totalUsage) * 100 : 0;
      
      // Create alert if wastage is high (e.g., > 10%)
      if (wastagePercentage > 10) {
        // Check if there's already an active wastage alert for this item
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
            thresholdLevel: 10 // 10% threshold
          });
          
          await this.inventoryAlertRepo.save(alert);
          this.logger.log(`Created wastage alert for item ${item.name}: ${wastagePercentage.toFixed(1)}% wastage`);
        }
      } else {
        // Resolve any existing wastage alerts if wastage is now acceptable
        await this.resolveInventoryAlerts(itemId, ['wastage_high']);
      }
    } catch (error) {
      this.logger.error(`Error checking wastage alerts for item ${itemId}`, error);
    }
  }

  async createInventoryItem(data: Partial<InventoryItemEntity>): Promise<InventoryItemEntity> {
    const item = this.inventoryRepo.create(data);
    const savedItem = await this.inventoryRepo.save(item);
    
    // Check if this creates a low stock situation
    await this.checkAndCreateInventoryAlert(savedItem.id);
    
    return savedItem;
  }

  async updateInventoryStock(itemId: string, quantityChange: number): Promise<InventoryItemEntity> {
    const item = await this.inventoryRepo.findOne({ where: { id: itemId } });
    if (!item) {
      throw new Error('Inventory item not found');
    }
    item.currentStock = Math.max(0, item.currentStock + quantityChange);
    if (item.unitCost !== null && item.unitCost !== undefined) {
      item.totalCost = item.currentStock * item.unitCost;
    }
    const savedItem = await this.inventoryRepo.save(item);
    
    // Check for stock alerts after update
    await this.checkAndCreateInventoryAlert(itemId);
    
    return savedItem;
  }

  async recordWastage(itemId: string, wastedQuantity: number, reason?: string): Promise<InventoryItemEntity> {
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
    
    // Check for wastage alerts
    await this.checkAndCreateWastageAlert(itemId, wastedQuantity, reason);
    
    // Check for stock alerts after wastage
    await this.checkAndCreateInventoryAlert(itemId);
    
    return savedItem;
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
    const notificationsSent = lowStockItems.length;
    return {
      lowStockItems,
      notificationsSent
    };
  }

  async createRecipe(data: Partial<RecipeEntity>): Promise<RecipeEntity> {
    const recipe = this.recipeRepo.create(data);
    return this.recipeRepo.save(recipe);
  }

  async getRecipeById(id: string): Promise<RecipeEntity> {
    return this.recipeRepo.findOne({ where: { id }, relations: ['branch'] });
  }

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
    const savedBatch = await this.batchRepo.save(batch);
    
    // If batch is completed, calculate actual time and check for delays
    if ((status === 'ready' || status === 'used' || status === 'discarded') && batch.startedAt) {
      await this.calculateAndRecordBatchTiming(batchId);
    }
    
    return savedBatch;
  }

  async logFoodPrep(data: Partial<FoodPrepEntity>): Promise<FoodPrepEntity> {
    const foodPrep = this.foodPrepRepo.create(data);
    const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
    
    // If this is a completion, calculate actual time and check for delays
    if (data.status === 'completed' && data.startedAt) {
      await this.calculateAndRecordFoodPrepTiming(savedFoodPrep.id);
    }
    
    return savedFoodPrep;
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
    const savedFoodPrep = await this.foodPrepRepo.save(foodPrep);
    
    // If this is a completion with quality data, calculate timing
    if (foodPrep.status === 'completed' && foodPrep.startedAt && !foodPrep.actualPrepTimeMinutes) {
      await this.calculateAndRecordFoodPrepTiming(prepId);
    }
    
    return savedFoodPrep;
  }

  /**
   * Calculate and record actual prep time and delays for food preparation
   */
    private async calculateAndRecordFoodPrepTiming(prepId: string): Promise<void> {
     try {
       const foodPrep = await this.foodPrepRepo.findOne({
         where: { id: prepId },
         relations: ['batch', 'batch.recipe', 'branch']
       });

       if (!foodPrep || !foodPrep.startedAt) return;

       // Calculate actual prep time
       const completedAt = foodPrep.completedAt || new Date();
       const actualTimeMs = completedAt.getTime() - foodPrep.startedAt.getTime();
       const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);

       // Get estimated time from recipe or historical data
       let estimatedTimeMinutes = 30; // Default
       if (foodPrep.batch?.recipe?.prepTimeMinutes) {
         estimatedTimeMinutes = foodPrep.batch.recipe.prepTimeMinutes;
       } else if (foodPrep.batch?.recipe?.cookTimeMinutes) {
         estimatedTimeMinutes = foodPrep.batch.recipe.cookTimeMinutes;
       }

       // Calculate delay
       const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;

       // Determine delay reasons (simplified - in reality this would be more sophisticated)
       const delayReasons: string[] = [];
       if (delayMinutes > 10) {
         delayReasons.push('Preparation took longer than expected');
       }
       if (delayMinutes < -5) {
         delayReasons.push('Prepared faster than expected');
       }

       // Update the food prep record
       foodPrep.actualPrepTimeMinutes = actualTimeMinutes;
       foodPrep.estimatedPrepTimeMinutes = estimatedTimeMinutes;
       foodPrep.delayMinutes = delayMinutes;
       foodPrep.delayReasons = delayReasons;

       await this.foodPrepRepo.save(foodPrep);

       // Record SLA for prep time
       await this.recordPrepTimeSLA(foodPrep.branch.id, actualTimeMinutes, estimatedTimeMinutes);

       this.logger.log(`Calculated timing for food prep ${prepId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
     } catch (error) {
       this.logger.error(`Error calculating food prep timing for ${prepId}`, error);
     }
   }
   
   private async calculateAndRecordBatchTiming(batchId: string): Promise<void> {
     try {
       const batch = await this.batchRepo.findOne({
         where: { id: batchId },
         relations: ['recipe', 'branch']
       });
       
       if (!batch || !batch.startedAt) return;
       
       // Calculate actual prep time
       const completedAt = batch.completedAt || new Date();
       const actualTimeMs = completedAt.getTime() - batch.startedAt.getTime();
       const actualTimeMinutes = Math.max(0, actualTimeMs / 60000);
       
        // Get estimated time from batch entity
        let estimatedTimeMinutes = batch.estimatedPrepTimeMinutes ?? 0;
        if (!estimatedTimeMinutes && batch.recipe?.prepTimeMinutes) {
          estimatedTimeMinutes = batch.recipe.prepTimeMinutes;
        } else if (!estimatedTimeMinutes && batch.recipe?.cookTimeMinutes) {
          estimatedTimeMinutes = batch.recipe.cookTimeMinutes;
        }
       
       // Calculate delay
       const delayMinutes = actualTimeMinutes - estimatedTimeMinutes;
       
       // Determine delay reasons (simplified)
       const delayReasons: string[] = [];
       if (delayMinutes > 10) {
         delayReasons.push('Batch preparation took longer than expected');
       }
       if (delayMinutes < -5) {
         delayReasons.push('Batch prepared faster than expected');
       }
       
       // Update the batch record
       batch.actualPrepTimeMinutes = actualTimeMinutes;
       batch.delayMinutes = delayMinutes;
       batch.delayReasons = delayReasons;
       
       await this.batchRepo.save(batch);
       
       // TODO: Consider recording SLA for batch timing if needed
       
       this.logger.log(`Calculated timing for batch ${batchId}: ${actualTimeMinutes.toFixed(1)}m actual vs ${estimatedTimeMinutes.toFixed(1)}m estimated`);
     } catch (error) {
       this.logger.error(`Error calculating batch timing for ${batchId}`, error);
     }
   }
   
   /**
   * Record prep time SLA metrics and check for breaches
   */
  private async recordPrepTimeSLA(branchId: string, actualTime: number, targetTime: number): Promise<void> {
    try {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) return;

      const isBreached = actualTime > targetTime;
      const breachSeverity = isBreached 
        ? (actualTime > targetTime * 1.5 ? 'high' : actualTime > targetTime * 1.2 ? 'medium' : 'low')
        : null;

      // Check if there's already an recent SLA alert for this branch and metric
      const recentAlert = await this.slaAlertRepo.findOne({
        where: {
          branch: { id: branchId },
          slaType: 'prep_time',
          createdAt: MoreThan(new Date(Date.now() - 60 * 60 * 1000)) // Last hour
        },
        order: { createdAt: 'DESC' }
      });

      // Only create alert if breached and no recent alert for same issue
      if (isBreached && !recentAlert) {
        const alert = this.slaAlertRepo.create({
          branch,
          slaType: 'prep_time',
          targetValue: targetTime,
          actualValue: actualTime,
          isBreached: true,
          breachSeverity: breachSeverity as any
        });
        
        await this.slaAlertRepo.save(alert);
        this.logger.log(`Created prep time SLA alert for branch ${branchId}: ${actualTime.toFixed(1)}m vs ${targetTime.toFixed(1)}m target`);
      } else if (!isBreached && recentAlert) {
        // Resolve previous alert if now within SLA
        await this.slaAlertRepo.update(
          { id: recentAlert.id },
          { isBreached: false, isNotified: true }
        );
      }
    } catch (error) {
      this.logger.error(`Error recording prep time SLA for branch ${branchId}`, error);
    }
  }

  async recordKitchenSLA(data: Partial<KitchenSLAEntity>): Promise<KitchenSLAEntity> {
    const sla = this.slaRepo.create(data);
    return this.slaRepo.save(sla);
  }

  async recordAvgPrepTime(branchId: string, prepTimeMinutes: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
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

  async recordLatePrepPercentage(branchId: string, latePercentage: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
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

  async recordFoodRejectionRate(branchId: string, rejectionRate: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
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

  /**
   * Automatically calculate and record food rejection rate based on actual food prep data
   */
  async calculateAndRecordFoodRejectionRate(branchId: string, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    try {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) throw new Error(`Branch not found: ${branchId}`);

      // Determine time period for calculation
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
          break;
        default:
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
      }

      // Get completed food prep records for the branch in the time period
      const foodPrepRecords = await this.foodPrepRepo.find({
        where: {
          branch: { id: branchId },
          status: In(['completed', 'failed']),
          completedAt: Between(startDate, now)
        }
      });

      if (foodPrepRecords.length === 0) {
        // No data to calculate rejection rate, record 0 or skip?
        // For now, record 0% rejection rate
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

      // Calculate rejection rate: (failed preparations / total preparations) * 100
      const failedCount = foodPrepRecords.filter(record => record.status === 'failed').length;
      const totalCount = foodPrepRecords.length;
      const rejectionRate = (totalCount > 0) ? (failedCount / totalCount) * 100 : 0;

      // Record the SLA
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
    } catch (error) {
      this.logger.error(`Error calculating food rejection rate for branch ${branchId}`, error);
      throw error;
    }
  }

  async recordKitchenThroughput(branchId: string, ordersPerHour: number, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
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

  /**
   * Automatically calculate and record kitchen throughput based on actual order data
   */
  async calculateAndRecordKitchenThroughput(branchId: string, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    try {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) throw new Error(`Branch not found: ${branchId}`);

      // Determine time period for calculation
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
          break;
        default:
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
      }

      // Get completed orders for the branch in the time period
      const completedOrders = await this.orderRepo.count({
        where: {
          restaurantId: branch.id, // Assuming restaurantId maps to branch - may need adjustment
          status: In(['delivered', 'completed']), // Completed orders
          updatedAt: Between(startDate, now)
        }
      });

      // Calculate orders per hour
      const hoursInPeriod = {
        hourly: 1,
        daily: 24,
        weekly: 24 * 7
      }[period];

      const ordersPerHour = completedOrders / hoursInPeriod;

      // Record the SLA
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
    } catch (error) {
      this.logger.error(`Error calculating kitchen throughput for branch ${branchId}`, error);
      throw error;
    }
  }

  /**
   * Automatically calculate and record average prep time based on actual food prep data
   */
  async calculateAndRecordAvgPrepTime(branchId: string, period: 'hourly' | 'daily' | 'weekly' = 'hourly'): Promise<KitchenSLAEntity> {
    try {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) throw new Error(`Branch not found: ${branchId}`);

      // Determine time period for calculation
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Last hour
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last day
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last week
          break;
        default:
          startDate = new Date(now.getTime() - 60 * 60 * 1000); // Default to hourly
      }

      // Get completed food prep records for the branch in the time period
      const foodPrepRecords = await this.foodPrepRepo.find({
        where: {
          branch: { id: branchId },
          status: 'completed',
          actualPrepTimeMinutes: Not(IsNull()),
          completedAt: Between(startDate, now)
        }
      });

      if (foodPrepRecords.length === 0) {
        // No data to calculate average prep time, record 0 or skip?
        // For now, record 0 minutes average prep time
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

      // Calculate average prep time
      const totalPrepTime = foodPrepRecords.reduce((sum, record) => sum + (record.actualPrepTimeMinutes || 0), 0);
      const avgPrepTime = totalPrepTime / foodPrepRecords.length;

      // Record the SLA
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
    } catch (error) {
      this.logger.error(`Error calculating average prep time for branch ${branchId}`, error);
      throw error;
    }
  }

  /**
   * Record prep delay SLA metrics and check for breaches
   */
  private async recordPrepDelaySLA(branchId: string, actualDelay: number, targetDelay: number): Promise<void> {
    try {
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) return;

      // For prep delay, we want to know if actual delay exceeds target delay (usually 0 or negative for early completion)
      const isBreached = actualDelay > targetDelay;
      const breachSeverity = isBreached 
        ? (actualDelay > targetDelay + 15 ? 'high' : actualDelay > targetDelay + 5 ? 'medium' : 'low')
        : null;

      // Check if there's already an recent SLA alert for this branch and metric
      const recentAlert = await this.slaAlertRepo.findOne({
        where: {
          branch: { id: branchId },
          slaType: 'prep_delay',
          createdAt: MoreThan(new Date(Date.now() - 60 * 60 * 1000)) // Last hour
        },
        order: { createdAt: 'DESC' }
      });

      // Only create alert if breached and no recent alert for same issue
      if (isBreached && !recentAlert) {
        const alert = this.slaAlertRepo.create({
          branch,
          slaType: 'prep_delay',
          targetValue: targetDelay,
          actualValue: actualDelay,
          isBreached: true,
          breachSeverity: breachSeverity as any
        });
        
        await this.slaAlertRepo.save(alert);
        this.logger.log(`Created prep delay SLA alert for branch ${branchId}: ${actualDelay.toFixed(1)}m delay vs ${targetDelay.toFixed(1)}m target`);
      } else if (!isBreached && recentAlert) {
        // Resolve previous alert if now within SLA
        await this.slaAlertRepo.update(
          { id: recentAlert.id },
          { isBreached: false, isNotified: true }
        );
      }
    } catch (error) {
      this.logger.error(`Error recording prep delay SLA for branch ${branchId}`, error);
    }
  }

  /**
   * Automatically record all kitchen SLA metrics based on actual data
   * This would typically be called by a cron job or scheduler
   */
  async recordAllKitchenSLAs(branchId: string): Promise<void> {
    try {
      this.logger.log(`Recording all kitchen SLAs for branch ${branchId}`);
      
      // Record all SLA metrics
      await Promise.all([
        this.calculateAndRecordAvgPrepTime(branchId, 'hourly'),
        this.calculateAndRecordFoodRejectionRate(branchId, 'hourly'),
        this.calculateAndRecordKitchenThroughput(branchId, 'hourly')
      ]);
      
      this.logger.log(`Completed recording all kitchen SLAs for branch ${branchId}`);
    } catch (error) {
      this.logger.error(`Error recording all kitchen SLAs for branch ${branchId}`, error);
      throw error;
    }
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

  async createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  async getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
  }

  async getInventoryConsumption(branchId: string, days = 7): Promise<any> {
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

  async forecastInventoryNeeds(branchId: string, daysAhead = 7): Promise<any> {
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

  async getKitchenAnalytics(branchId: string): Promise<any> {
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
          measuredAt: MoreThan(thirtyDaysAgo)
        },
        order: { measuredAt: 'DESC' }
      }),
      this.slaRepo.findOne({
        where: {
          branch: { id: branchId },
          metricName: 'food_rejection_rate',
          measuredAt: MoreThan(thirtyDaysAgo)
        },
        order: { measuredAt: 'DESC' }
      }),
      this.slaRepo.findOne({
        where: {
          branch: { id: branchId },
          metricName: 'kitchen_throughput',
          measuredAt: MoreThan(thirtyDaysAgo)
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
}