import { Repository } from 'typeorm';
import { OrderEntity } from '../db/entities/order.entity';
import { OrderItemEntity } from '../db/entities/order-item.entity';
import { GSTDetailEntity } from '../db/entities/gst-detail.entity';
import { HSNSACEntity } from '../db/entities/hsn-sac.entity';
import { RestaurantGSTEntity } from '../db/entities/restaurant-gst.entity';
import { MenuItemEntity } from '../db/entities/menu-item.entity';
import { RestaurantEntity } from '../db/entities/restaurant.entity';
export declare class GSTService {
    private readonly orderRepo;
    private readonly orderItemRepo;
    private readonly gstDetailRepo;
    private readonly hsnSacRepo;
    private readonly restaurantGstRepo;
    private readonly menuItemRepo;
    private readonly restaurantRepo;
    private readonly logger;
    constructor(orderRepo: Repository<OrderEntity>, orderItemRepo: Repository<OrderItemEntity>, gstDetailRepo: Repository<GSTDetailEntity>, hsnSacRepo: Repository<HSNSACEntity>, restaurantGstRepo: Repository<RestaurantGSTEntity>, menuItemRepo: Repository<MenuItemEntity>, restaurantRepo: Repository<RestaurantEntity>);
    calculateGSTForOrder(orderId: string): Promise<GSTDetailEntity>;
    generateGSTInvoice(orderId: string): Promise<any>;
    validateGSTIN(gstin: string): boolean;
    getGSTRateForHSNSAC(hsnSacCode: string): Promise<number>;
    getGSTRateSummary(orderId: string): Promise<any>;
}
