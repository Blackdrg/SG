import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { OrderItemEntity } from '../../db/entities/order-item.entity';
export declare class TaxReportingService {
    private orderRepo;
    private gstDetailRepo;
    private restaurantRepo;
    private restaurantGstRepo;
    private orderItemRepo;
    private dataSource;
    private readonly logger;
    constructor(orderRepo: Repository<OrderEntity>, gstDetailRepo: Repository<GSTDetailEntity>, restaurantRepo: Repository<RestaurantEntity>, restaurantGstRepo: Repository<RestaurantGSTEntity>, orderItemRepo: Repository<OrderItemEntity>, dataSource: DataSource);
    generateGSTReport(restaurantId: string, month: number, year: number): Promise<any>;
    private getHSNBreakdown;
    exportGSTR1(restaurantId: string, month: number, year: number): Promise<any[]>;
    getTaxLiability(reportingMonth: Date): Promise<any>;
    getMonthlyTaxSummary(restaurantId: string, months?: number): Promise<any[]>;
}
