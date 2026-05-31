import { Repository, DataSource } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { AddressEntity } from '../../db/entities/address.entity';
export declare class AnalyticsService {
    private orderRepo;
    private orderItemRepo;
    private menuItemRepo;
    private userRepo;
    private branchRepo;
    private addressRepo;
    private dataSource;
    constructor(orderRepo: Repository<OrderEntity>, orderItemRepo: Repository<OrderItemEntity>, menuItemRepo: Repository<MenuItemEntity>, userRepo: Repository<UserEntity>, branchRepo: Repository<RestaurantBranchEntity>, addressRepo: Repository<AddressEntity>, dataSource: DataSource);
    getTopDishes(restaurantId?: string, period?: number): Promise<any>;
    getChurnAnalysis(restaurantId?: string, period?: number): Promise<any>;
    getRepeatUsers(restaurantId?: string, period?: number): Promise<any>;
    getConversionRate(restaurantId?: string, period?: number): Promise<any>;
    getDeliveryHeatmap(restaurantId?: string, period?: number): Promise<any>;
    getPeakHours(restaurantId?: string, period?: number): Promise<any>;
    getRestaurantAnalytics(restaurantId: string): Promise<any>;
    getPlatformAnalytics(): Promise<any>;
}
