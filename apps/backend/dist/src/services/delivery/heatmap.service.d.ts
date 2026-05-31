import { Repository, DataSource } from 'typeorm';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
interface GeoPoint {
    lat: number;
    lng: number;
}
interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
}
interface HeatmapData {
    points: HeatmapPoint[];
    maxWeight: number;
    totalDeliveries: number;
}
interface SurgeZoneCheck {
    inSurgeZone: boolean;
    multiplier: number;
    zoneName?: string;
}
export declare class HeatmapService {
    private readonly branchRepo;
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly surgeZoneRepo;
    private readonly dataSource;
    private readonly logger;
    constructor(branchRepo: Repository<RestaurantBranchEntity>, driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, surgeZoneRepo: Repository<SurgeZoneEntity>, dataSource: DataSource);
    generateDeliveryHeatmap(centralPoint: GeoPoint, radiusKm?: number): Promise<HeatmapData>;
    getSurgeZoneStatus(point: GeoPoint): Promise<SurgeZoneCheck>;
    calculateSurgeAdjustedETA(origin: GeoPoint, destination: GeoPoint): Promise<{
        etaMinutes: number;
        surgeMultiplier: number;
        surgeZone?: string;
    }>;
    createSurgeZone(name: string, polygon: GeoPoint[], multiplier: number, startTime?: string, endTime?: string): Promise<SurgeZoneEntity>;
    updateSurgeZone(zoneId: string, updates: Partial<SurgeZoneEntity>): Promise<SurgeZoneEntity>;
    getAllSurgeZones(): Promise<SurgeZoneEntity[]>;
    private isPointInPolygon;
    private hashToGrid;
    private gridToCoords;
    private calculateDistance;
}
export {};
