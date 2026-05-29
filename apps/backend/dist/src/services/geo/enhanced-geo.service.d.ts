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
interface DriverLocationUpdate {
    driverId: string;
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
    speed?: number;
    heading?: number;
}
interface GeofenceAlert {
    driverId: string;
    branchId: string;
    event: 'entered' | 'exited';
    timestamp: Date;
    location: GeoPoint;
}
interface RouteOptimizationResult {
    orderedWaypoints: GeoPoint[];
    totalDistance: number;
    totalETA: number;
    instructions: Array<{
        step: number;
        instruction: string;
        distance: number;
        duration: number;
    }>;
}
interface TrafficCondition {
    segment: {
        start: GeoPoint;
        end: GeoPoint;
    };
    congestionLevel: 'low' | 'medium' | 'high' | 'severe';
    speedKmh: number;
    delayMinutes: number;
}
export declare class EnhancedGeoService {
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly dataSource;
    private readonly logger;
    private readonly EARTH_RADIUS_KM;
    private readonly AVERAGE_SPEED_KMH;
    private readonly GEOFENCE_RADIUS_M;
    private readonly TRAFFIC_UPDATE_INTERVAL_MS;
    constructor(restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, dataSource: DataSource);
    calculateDistance(point1: GeoPoint, point2: GeoPoint): number;
    predictETA(distance: number, speedKmh?: number, trafficConditions?: TrafficCondition[]): ETAPrediction;
    findNearbyBranches(customerLocation: GeoPoint, radiusInKm?: number, limit?: number): Promise<BranchWithDistance[]>;
    findNearestBranchForOrder(restaurantId: string, customerLocation: GeoPoint): Promise<RestaurantBranchEntity | null>;
    findAvailableDrivers(restaurantLocation: GeoPoint, radiusInKm?: number, limit?: number): Promise<DriverEntity[]>;
    calculateDeliveryRoute(restaurantLocation: GeoPoint, customerLocation: GeoPoint, avoidCongestion?: boolean): Promise<ETAPrediction>;
    updateDriverLocation(driverId: string, locationUpdate: DriverLocationUpdate): Promise<DriverEntity>;
    checkGeofence(driverId: string, branchId: string): Promise<GeofenceAlert | null>;
    optimizeRoute(waypoints: GeoPoint[]): Promise<RouteOptimizationResult>;
    calculateRouteDistance(points: GeoPoint[]): number;
    getTrafficConditions(start: GeoPoint, end: GeoPoint): Promise<TrafficCondition[]>;
    calculateETAWithLiveTraffic(start: GeoPoint, end: GeoPoint, vehicleSpeedKmh?: number): Promise<ETAPrediction & {
        trafficConditions: TrafficCondition[];
    }>;
    private toRadians;
}
export {};
