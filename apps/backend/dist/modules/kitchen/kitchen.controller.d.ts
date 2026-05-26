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
    getLowStockItems(branchId: string): Promise<InventoryItemEntity[]>;
    createRecipe(data: Partial<RecipeEntity>): Promise<RecipeEntity>;
    getRecipeById(id: string): Promise<RecipeEntity>;
    createBatch(data: Partial<BatchEntity>): Promise<BatchEntity>;
    updateBatchStatus(id: string, status: BatchEntity['status']): Promise<BatchEntity>;
    logFoodPrep(data: Partial<FoodPrepEntity>): Promise<FoodPrepEntity>;
    updateFoodPrepQuality(id: string, qualityData: Partial<FoodPrepEntity['qualityCheck']>): Promise<FoodPrepEntity>;
    recordKitchenSLA(data: Partial<KitchenSLAEntity>): Promise<KitchenSLAEntity>;
    getKitchenSLABranch(branchId: string, metricName?: string, limit?: number): Promise<KitchenSLAEntity[]>;
    createSupplier(data: Partial<SupplierEntity>): Promise<SupplierEntity>;
    getSupplierInventory(supplierId: string): Promise<InventoryItemEntity[]>;
    getInventoryConsumption(branchId: string, days?: number): Promise<any>;
    forecastInventoryNeeds(branchId: string, daysAhead?: number): Promise<any>;
}
