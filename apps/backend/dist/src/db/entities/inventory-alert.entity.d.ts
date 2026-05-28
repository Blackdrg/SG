import { InventoryItemEntity } from './inventory-item.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class InventoryAlertEntity {
    id: string;
    inventoryItem: InventoryItemEntity;
    branch: RestaurantBranchEntity;
    alertType: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'wastage_high';
    currentLevel: number;
    thresholdLevel: number;
    expiresAt?: Date;
    isResolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
