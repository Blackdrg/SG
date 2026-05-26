import { InventoryItemEntity } from './inventory-item.entity';
export declare class SupplierEntity {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    isActive: boolean;
    inventoryItems: InventoryItemEntity[];
    createdAt: Date;
    updatedAt: Date;
}
