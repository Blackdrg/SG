import { ConfigService } from '@nestjs/config';
interface GeoPoint {
    lat: number;
    lng: number;
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
interface ETAResult {
    etaMinutes: number;
    distanceKm: number;
    durationMinutes: number;
    trafficConditions: TrafficCondition[];
}
interface RouteDeviation {
    isDeviation: boolean;
    deviationDistanceKm: number;
    expectedRouteDistanceKm: number;
    actualRouteDistanceKm: number;
    severity: 'low' | 'medium' | 'high';
}
export declare class GoogleMapsService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private fetchFromGoogle;
    getDirections(origin: GeoPoint, destination: GeoPoint, waypoints?: GeoPoint[]): Promise<any>;
    getDistanceMatrix(origins: GeoPoint[], destinations: GeoPoint[], mode?: 'driving' | 'walking' | 'bicycling'): Promise<any>;
    getTrafficConditions(start: GeoPoint, end: GeoPoint): Promise<TrafficCondition[]>;
    calculateETAWithLiveTraffic(origin: GeoPoint, destination: GeoPoint, driverSpeedKmh?: number): Promise<ETAResult>;
    checkRouteDeviation(expectedPath: GeoPoint[], actualPath: GeoPoint[], thresholdKm?: number): Promise<RouteDeviation>;
    rerouteDriver(currentLocation: GeoPoint, destination: GeoPoint, waypoints?: GeoPoint[]): Promise<any>;
    private haversineDistance;
    private calculatePathDistance;
    private toRadians;
    private simulateTraffic;
    private simulateETA;
}
export {};
