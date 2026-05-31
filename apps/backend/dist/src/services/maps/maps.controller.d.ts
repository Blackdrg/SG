import { MapsService, ETAResponse, RerouteResponse, HeatmapPoint } from './maps.service';
import { SurgeZoneEntity } from '../../db/entities/surge-zone.entity';
export declare class MapsController {
    private readonly mapsService;
    constructor(mapsService: MapsService);
    getETA(originLat: string, originLng: string, destLat: string, destLng: string): Promise<ETAResponse>;
    getSurgeETA(originLat: string, originLng: string, destLat: string, destLng: string): Promise<ETAResponse>;
    getRerouting(body: {
        origin: {
            lat: number;
            lng: number;
        };
        destination: {
            lat: number;
            lng: number;
        };
        waypoints?: {
            lat: number;
            lng: number;
        }[];
    }): Promise<RerouteResponse>;
    getHeatmap(north: string, south: string, east: string, west: string, zoom?: string): Promise<HeatmapPoint[]>;
    getSurgeZones(): Promise<SurgeZoneEntity[]>;
    checkSurgeZone(lat: string, lng: string): Promise<{
        inSurgeZone: boolean;
        multiplier?: number;
        zoneName?: string;
    }>;
}
