import { Repository, DataSource } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
export declare class RestaurantService {
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly dataSource;
    constructor(restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, dataSource: DataSource);
    findNearby(lat: number, lng: number, radiusInKm?: number): Promise<RestaurantBranchEntity[]>;
    getRestaurantDetails(slug: string): Promise<RestaurantEntity>;
    updateBranchStatus(branchId: string, isOnline: boolean): Promise<import("typeorm").UpdateResult>;
}
