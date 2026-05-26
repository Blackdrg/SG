import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { SupplierEntity } from './supplier.entity';
export declare class InventoryItemEntity {
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    lowStockThreshold: number;
    expiryDate: Date;
    reorderPoint: number;
    reorderQuantity: number;
    unitCost: number;
    totalCost: number;
    wastage: number;
    wastageCost: number;
    branch: RestaurantBranchEntity;
    supplier: SupplierEntity;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
