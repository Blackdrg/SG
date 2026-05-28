import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { GeoService } from '../../services/geo/geo.service';
import { EventsGateway } from '../../events.gateway';
interface GeoPoint {
    lat: number;
    lng: number;
}
export declare class EnhancedDeliveryService {
    private driverRepo;
    private orderRepo;
    private batchRepo;
    private driverAssignmentRepo;
    private geoService;
    private eventsGateway;
    private dataSource;
    private readonly logger;
    private surgeZones;
    private incentiveRules;
    constructor(driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, batchRepo: Repository<BatchEntity>, driverAssignmentRepo: Repository<DriverAssignmentEntity>, geoService: GeoService, eventsGateway: EventsGateway, dataSource: DataSource);
    private initializeSurgeZones;
    private initializeIncentiveRules;
    registerDriver(userId: string, data: any): Promise<DriverEntity[]>;
    updateLocation(driverId: string, lat: number, lng: number): Promise<import("typeorm").UpdateResult>;
    findAvailableDrivers(lat: number, lng: number, radiusInKm?: number): Promise<DriverEntity[]>;
    assignOrderToDriver(orderId: string, driverId: string): Promise<void>;
    calculateTrafficAwareRoute(restaurantLocation: GeoPoint, customerLocation: GeoPoint, historicalSpeed?: number): {
        eta: number;
        distance: number;
        duration: number;
        trafficFactor: number;
    };
    getTimeOfDayTrafficFactor(): number;
    getSurgeMultiplier(location: GeoPoint): number;
    calculateSurgeForOrder(orderId: string): Promise<number>;
    handleFailedDelivery(orderId: string, driverId: string, failureReason: string, reasonDetails?: string): Promise<void>;
    private handleDriverNoShow;
    batchOrdersForDriver(orders: OrderEntity[]): Promise<BatchEntity[]>;
    private createBatch;
    calculateDeliveryIncentives(driverId: string, date?: Date): Promise<{
        totalIncentive: number;
        breakdown: {
            [key: string]: number;
        };
    }>;
    validateGeoFence(driverId: string, centerLat: number, centerLng: number, radiusKm?: number): Promise<boolean>;
    rerouteDriver(driverId: string, orderId: string, newDestination: GeoPoint, reason: string): Promise<void>;
    reassignOrder(orderId: string, excludeDriverId?: string): Promise<boolean>;
    getDriverEarnings(driverId: string, period?: 'today' | 'week' | 'month'): Promise<{
        totalEarnings: number;
        pendingPayout: number;
        incentives: number;
        ordersCompleted: number;
    }>;
    private toRadians;
}
export {};
