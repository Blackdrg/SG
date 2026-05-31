import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly googleMapsApiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(
    private configService: ConfigService,
    @InjectRepository(SurgeZoneEntity)
    private readonly surgeZoneRepo: Repository<SurgeZoneEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
  ) {
    this.googleMapsApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  async calculateETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<ETAResponse> {
    if (!this.googleMapsApiKey) {
      return this.calculateHaversineETA(origin, destination);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&departure_time=now&key=${this.googleMapsApiKey}`
      );

      const data = await response.json();
      const row = data.rows?.[0];
      const element = row?.elements?.[0];

      if (!element) {
        throw new Error('No route found');
      }

      const trafficLevel = this.determineTrafficLevel(
        element.duration.value,
        element.duration_in_traffic?.value || element.duration.value
      );

      return {
        distance: element.distance.value,
        duration: element.duration.value,
        durationInTraffic: element.duration_in_traffic?.value || element.duration.value,
        trafficLevel,
      };
    } catch (error) {
      this.logger.error('Google Maps ETA failed, using fallback:', error);
      return this.calculateHaversineETA(origin, destination);
    }
  }

  private calculateHaversineETA(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): ETAResponse {
    const R = 6371e3;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return {
      distance,
      duration: distance / 1000 * 60,
      durationInTraffic: distance / 1000 * 72,
      trafficLevel: 'normal',
    };
  }

  private determineTrafficLevel(normalDuration: number, trafficDuration: number): 'light' | 'normal' | 'heavy' | 'severe' {
    const ratio = trafficDuration / normalDuration;
    if (ratio < 1.1) return 'light';
    if (ratio < 1.3) return 'normal';
    if (ratio < 1.6) return 'heavy';
    return 'severe';
  }

  async calculateSurgeETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<ETAResponse> {
    const baseETA = await this.calculateETA(origin, destination);
    const surgeMultiplier = await this.getSurgeMultiplier(origin.lat, origin.lng);

    return {
      ...baseETA,
      durationInTraffic: Math.round(baseETA.durationInTraffic * surgeMultiplier),
    };
  }

  private async getSurgeMultiplier(lat: number, lng: number): Promise<number> {
    const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    for (const zone of surgeZones) {
      if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
        const now = new Date();
        const currentHour = now.getHours();
        if (zone.startTime && zone.endTime) {
          const startHour = parseInt(zone.startTime.split(':')[0]);
          const endHour = parseInt(zone.endTime.split(':')[0]);
          if (currentHour >= startHour && currentHour <= endHour) {
            return Number(zone.multiplier);
          }
        }
        return Number(zone.multiplier);
      }
    }

    return 1.0;
  }

  private isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
    let x = point.lng, y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;

      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  async getReroutingOptions(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: { lat: number; lng: number }[]
  ): Promise<RerouteResponse> {
    if (!this.googleMapsApiKey) {
      return {
        alternativeRoutes: [],
        originalRoute: { distance: 0, duration: 0 },
      };
    }

    try {
      const waypointParam = waypoints && waypoints.length > 0
        ? `&waypoints=${waypoints.map(w => w.lat + ',' + w.lng).join('|')}`
        : '';

      const response = await fetch(
        `${this.baseUrl}/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&alternatives=true&key=${this.googleMapsApiKey}${waypointParam}`
      );

      const data = await response.json();
      const routes = data.routes || [];
      const originalRoute = routes[0];
      const alternativeRoutes = routes.slice(1).map((route: any) => ({
        distance: route.legs?.[0]?.distance?.value || 0,
        duration: route.legs?.[0]?.duration?.value || 0,
        summary: route.summary || '',
      }));

      return {
        alternativeRoutes,
        originalRoute: {
          distance: originalRoute?.legs?.[0]?.distance?.value || 0,
          duration: originalRoute?.legs?.[0]?.duration?.value || 0,
        },
      };
    } catch (error) {
      this.logger.error('Rerouting failed:', error);
      return {
        alternativeRoutes: [],
        originalRoute: { distance: 0, duration: 0 },
      };
    }
  }

  async getHeatmapData(
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    },
    zoom: number = 12
  ): Promise<HeatmapPoint[]> {
    const branches = await this.branchRepo
      .createQueryBuilder('branch')
      .where('ST_Y(branch.location) BETWEEN :south AND :north', { south: bounds.south, north: bounds.north })
      .andWhere('ST_X(branch.location) BETWEEN :west AND :east', { west: bounds.west, east: bounds.east })
      .getMany();

    return branches.map(branch => ({
      lat: branch.location.lat,
      lng: branch.location.lng,
      weight: Math.floor(Math.random() * 100) + 1,
    }));
  }

  async getSurgeZones(): Promise<SurgeZoneEntity[]> {
    return this.surgeZoneRepo.find({ where: { isActive: true } });
  }

  async isAddressInSurgeZone(
    lat: number,
    lng: number
  ): Promise<{ inSurgeZone: boolean; multiplier?: number; zoneName?: string }> {
    const surgeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    for (const zone of surgeZones) {
      if (this.isPointInPolygon({ lat, lng }, zone.polygon)) {
        return {
          inSurgeZone: true,
          multiplier: Number(zone.multiplier),
          zoneName: zone.name,
        };
      }
    }

    return { inSurgeZone: false };
  }
}
