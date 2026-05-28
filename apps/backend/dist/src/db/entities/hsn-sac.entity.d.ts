import { MenuItemEntity } from './menu-item.entity';
export declare class HSNSACEntity {
    id: string;
    menuItem: MenuItemEntity;
    menuItemId: string;
    hsnCode: string;
    description: string;
    gstRate?: number;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    createdAt: Date;
    updatedAt: Date;
}
