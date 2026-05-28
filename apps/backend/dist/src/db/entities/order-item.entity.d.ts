import { OrderEntity } from './order.entity';
import { MenuItemEntity } from './menu-item.entity';
import { HSNSACEntity } from './hsn-sac.entity';
export declare class OrderItemEntity {
    id: string;
    orderId: string;
    order: OrderEntity;
    menuItemId: string;
    menuItem: MenuItemEntity;
    hsnSacId?: string;
    hsnSac?: HSNSACEntity;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    instructions: string;
    variants: any;
    addons: any;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTax: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
