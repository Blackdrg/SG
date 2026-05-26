import { KitchenService } from './kitchen.service';
import { InventoryItemEntity } from '../../db/entities/inventory-item.entity';
import { RecipeEntity } from '../../db/entities/recipe.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { FoodPrepEntity } from '../../db/entities/food-prep.entity';
import { KitchenSLAEntity } from '../../db/entities/kitchen-sla.entity';
import { SupplierEntity } from '../../db/entities/supplier.entity';
export declare class KitchenController {
    private readonly kitchenService;
    constructor(kitchenService: KitchenService);
    createInventoryItem(data: Partial<InventoryItemEntity>): Promise<InventoryItemEntity>;
    updateInventoryStock(id: string, quantityChange: number): Promise<InventoryItemEntity>;
    recordWastage(id: string, wastedQuantity: number, reason?: string): Promise<InventoryItemEntity>;
    getLowStockItems(branchId: string): Promise<InventoryItemEntity[]>;
    checkAndNotifyLowStock(branchId: string): Promise<{
        lowStockItems: InventoryItemEntity[];
        notificationsSent: number;
    }>;
    createRecipe(data: Partial<RecipeEntity>): Promise<RecipeEntity>;
    getRecipeById(id: string): Promise<RecipeEntity>;
    createBatch(data: Partial<BatchEntity>): Promise<BatchEntity>;
    updateBatchStatus(id: string, status: BatchEntity['status']): Promise<BatchEntity>;
    logFoodPrep(data: Partial<FoodPrepEntity>): Promise<FoodPrepEntity>;
    updateFoodPrepQuality(id: string, qualityData: Partial<FoodPrepEntity['qualityCheck']>): Promise<FoodPrepEntity>;
    recordKitchenSLA(data: Partial<KitchenSLAEntity>): Promise<KitchenSLAEntity>;
    recordAvgPrepTime(branchId: string, prepTimeMinutes: number, period?: 'hourly' | 'daily' | 'weekly'): Promise<KitchenSLAEntity>;
    recordLatePrepPercentage(branchId: string, latePercentage: number, period?: 'hourly' | 'daily' | 'weekly'): Promise<KitchenSLAEntity>;
    recordFoodRejectionRate(branchId: string, rejectionRate: number, period?: 'hourly' | 'daily' | 'weekly'): Promise<KitchenSLAEntity>;
    recordKitchenThroughput(branchId: string, ordersPerHour: number, period?: 'hourly' | 'daily' | 'weekly'): Promise<KitchenSLAEntity>;
    getKitchenSLABranch(branchId: string, metricName?: string, limit?: number): Promise<KitchenSLAEntity[]>;
    getKitchenSLASummary(branchId: string, period?: 'hourly' | 'daily' | 'weekly'): Promise<Record<string, any>>;
    createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity>;
    getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]>;
    getInventoryConsumption(branchId: string, days?: number): Promise<any>;
    forecastInventoryNeeds(branchId: string, daysAhead?: number): Promise<any>;
}
