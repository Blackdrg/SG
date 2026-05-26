import { Repository, DataSource } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
interface GeoPoint {
    lat: number;
    lng: number;
}
interface BranchWithDistance extends RestaurantBranchEntity {
    distance: number;
}
interface ETAPrediction {
    eta: number;
    distance: number;
    duration: number;
}
export declare class GeoService {
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly dataSource;
    private readonly EARTH_RADIUS_KM;
    private readonly AVERAGE_SPEED_KMH;
    constructor(restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, dataSource: DataSource);
    calculateDistance(point1: GeoPoint, point2: GeoPoint): number;
    predictETA(distance: number, speedKmh?: number): ETAPrediction;
    findNearbyBranches(customerLocation: GeoPoint, radiusInKm?: number, limit?: number): Promise<BranchWithDistance[]>;
    findNearestBranchForOrder(restaurantId: string, customerLocation: GeoPoint): Promise<RestaurantBranchEntity | null>;
    findAvailableDrivers(restaurantLocation: GeoPoint, radiusInKm?: number, limit?: number): Promise<DriverEntity[]>;
    calculateDeliveryRoute(restaurantLocation: GeoPoint, customerLocation: GeoPoint): Promise<ETAPrediction>;
    private toRadians;
}
export {};
