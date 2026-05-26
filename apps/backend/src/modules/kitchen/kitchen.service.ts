import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { RecipeEntity } from '../../db/entities/recipe.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { FoodPrepEntity } from '../../db/entities/food-prep.entity';
import { KitchenSLAEntity } from '../../db/entities/kitchen-sla.entity';
import { SupplierEntity } from '../../db/entities/supplier.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';

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

  // Supplier Management
  async createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity> {
    const supplier = this.supplierRepo.create(data);
    return this.supplierRepo.save(supplier);
  }

  async getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]> {
    return this.inventoryRepo.find({ where: { supplier: { id: supplierId } } });
  }

  // Consumption Tracking & Forecasting (Basic implementations)
  async getInventoryConsumption(branchId: string, days = 7): Promise<any> {
    // This would typically analyze historical usage patterns
    // For now, return a placeholder structure
    return {
      branchId,
      periodDays: days,
      consumptionData: [], // Would be populated with actual consumption analysis
      generatedAt: new Date()
    };
  }

  async forecastInventoryNeeds(branchId: string, daysAhead = 7): Promise<any> {
    // This would use historical data and upcoming orders to forecast needs
    // For now, return a placeholder structure
    return {
      branchId,
      forecastDays: daysAhead,
      predictions: [], // Would be populated with actual forecasts
      generatedAt: new Date()
    };
  }
}