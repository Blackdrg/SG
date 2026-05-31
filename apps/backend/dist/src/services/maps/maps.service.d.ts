import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
export interface ETAResponse {
    distance: number;
    duration: number;
    durationInTraffic: number;
    trafficLevel: 'light' | 'normal' | 'heavy' | 'severe';
}
export interface RerouteResponse {
    alternativeRoutes: {
        distance: number;
        duration: number;
        summary: string;
    }[];
    originalRoute: {
        distance: number;
        duration: number;
    };
}
export interface HeatmapPoint {
    lat: number;
    lng: number;
    weight: number;
}
export declare class MapsService {
    private configService;
    private readonly surgeZoneRepo;
    private readonly branchRepo;
    private readonly logger;
    private readonly googleMapsApiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService, surgeZoneRepo: Repository<SurgeZoneEntity>, branchRepo: Repository<RestaurantBranchEntity>);
    calculateETA(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): Promise<ETAResponse>;
    private calculateHaversineETA;
    private determineTrafficLevel;
    calculateSurgeETA(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): Promise<ETAResponse>;
    private getSurgeMultiplier;
    private isPointInPolygon;
    getReroutingOptions(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }, waypoints?: {
        lat: number;
        lng: number;
    }[]): Promise<RerouteResponse>;
    getHeatmapData(bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    }, zoom?: number): Promise<HeatmapPoint[]>;
    getSurgeZones(): Promise<SurgeZoneEntity[]>;
    isAddressInSurgeZone(lat: number, lng: number): Promise<{
        inSurgeZone: boolean;
        multiplier?: number;
        zoneName?: string;
    }>;
}
