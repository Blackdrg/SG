import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class HeatmapService {
  private readonly logger = new Logger(HeatmapService.name);

  constructor(
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(SurgeZoneEntity)
    private readonly surgeZoneRepo: Repository<SurgeZoneEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async generateDeliveryHeatmap(centralPoint: GeoPoint, radiusKm: number = 10): Promise<HeatmapData> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent deliveries for heatmap
    const recentOrders = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.createdAt >= :since', { since: twentyFourHoursAgo })
      .andWhere('order.status IN (:...statuses)', { statuses: ['delivered', 'completed'] })
      .getMany();

    // Aggregate delivery points into heatmap grid
    const grid: Record<string, number> = {};
    
    for (const order of recentOrders) {
      const key = this.hashToGrid(order.deliveryAddressId || '', 0.001);
      grid[key] = (grid[key] || 0) + 1;
    }

    // Convert grid to points (simulated for demo)
    const points: HeatmapPoint[] = Object.entries(grid).map(([key, weight]) => {
      const [lat, lng] = this.gridToCoords(key);
      return { lat, lng, weight };
    });

    // Add current driver locations as heatmap points
    const onlineDrivers = await this.driverRepo.find({
      where: { isOnline: true, isAvailable: false } as any,
    });

    onlineDrivers.forEach(driver => {
      if (driver.currentLocation) {
        points.push({
          lat: Number(driver.currentLocation.lat),
          lng: Number(driver.currentLocation.lng),
          weight: 2,
        });
      }
    });

    return {
      points,
      maxWeight: Math.max(...points.map(p => p.weight), 1),
      totalDeliveries: recentOrders.length,
    };
  }

  async getSurgeZoneStatus(point: GeoPoint): Promise<SurgeZoneCheck> {
    const activeZones = await this.surgeZoneRepo.find({ where: { isActive: true } });

    for (const zone of activeZones) {
      if (zone.polygon && this.isPointInPolygon(point, zone.polygon)) {
        return {
          inSurgeZone: true,
          multiplier: Number(zone.multiplier),
          zoneName: zone.name,
        };
      }
    }

    return { inSurgeZone: false, multiplier: 1.0 };
  }

  async calculateSurgeAdjustedETA(
    origin: GeoPoint,
    destination: GeoPoint,
  ): Promise<{ etaMinutes: number; surgeMultiplier: number; surgeZone?: string }> {
    const surgeCheck = await this.getSurgeZoneStatus(origin);
    
    // Use basic distance calculation if Google Maps not available
    const distanceKm = this.calculateDistance(origin, destination);
    const avgSpeedKmh = 30;
    const durationMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
    const buffer = durationMinutes * 0.2;
    const etaMinutes = Math.ceil(durationMinutes + buffer);

    return {
      etaMinutes,
      surgeMultiplier: surgeCheck.multiplier,
      surgeZone: surgeCheck.zoneName,
    };
  }

  async createSurgeZone(
    name: string,
    polygon: GeoPoint[],
    multiplier: number,
    startTime?: string,
    endTime?: string
  ): Promise<SurgeZoneEntity> {
    const zone = this.surgeZoneRepo.create({
      name,
      polygon,
      multiplier,
      startTime,
      endTime,
    });
    return await this.surgeZoneRepo.save(zone);
  }

  async updateSurgeZone(
    zoneId: string,
    updates: Partial<SurgeZoneEntity>
  ): Promise<SurgeZoneEntity> {
    await this.surgeZoneRepo.update(zoneId, updates);
    return this.surgeZoneRepo.findOne({ where: { id: zoneId } });
  }

  async getAllSurgeZones(): Promise<SurgeZoneEntity[]> {
    return await this.surgeZoneRepo.find({ order: { isActive: 'DESC' } });
  }

  private isPointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
    let x = point.lng, y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  private hashToGrid(hash: string, gridSize: number): string {
    // Simple hash-based grid for demo
    return `${Math.floor(Math.random() / gridSize) * gridSize},${Math.floor(Math.random() / gridSize) * gridSize}`;
  }

  private gridToCoords(hash: string): [number, number] {
    const [lat, lng] = hash.split(',').map(Number);
    return [lat, lng];
  }

  private calculateDistance(loc1: GeoPoint, loc2: GeoPoint): number {
    const R = 6371;
    const φ1 = loc1.lat * Math.PI / 180;
    const φ2 = loc2.lat * Math.PI / 180;
    const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
    const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}