import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { GeoService } from '../../services/geo/geo.service';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';

interface GeoPoint {
  lat: number;
  lng: number;
}

interface SurgeZone {
  id: string;
  center: GeoPoint;
  radiusKm: number;
  surgeMultiplier: number;
  active: boolean;
}

interface IncentiveRule {
  id: string;
  type: 'bonus_per_order' | 'surge_multiplier' | 'completion_bonus' | 'peak_hour_rate';
  value: number;
  conditions: {
    minDeliveries?: number;
    timeWindow?: { start: string; end: string };
    zoneId?: string;
    minRating?: number;
  };
  active: boolean;
}

@Injectable()
export class EnhancedDeliveryService {
  private readonly logger = new Logger(EnhancedDeliveryService.name);
  private surgeZones: Map<string, SurgeZone> = new Map();
  private incentiveRules: Map<string, IncentiveRule[]> = new Map();

  constructor(
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(BatchEntity)
    private batchRepo: Repository<BatchEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private driverAssignmentRepo: Repository<DriverAssignmentEntity>,
    private geoService: GeoService,
    private dataSource: DataSource,
  ) {
    this.initializeSurgeZones();
    this.initializeIncentiveRules();
  }

  private initializeSurgeZones() {
    this.surgeZones.set('central', {
      id: 'central',
      center: { lat: 30.7333, lng: 76.7794 },
      radiusKm: 5,
      surgeMultiplier: 1.0,
      active: false,
    });
  }

  private initializeIncentiveRules() {
    this.incentiveRules.set('default', [
      {
        id: 'on_time_bonus',
        type: 'bonus_per_order',
        value: 15,
        conditions: { minDeliveries: 0 },
        active: true,
      },
      {
        id: 'peak_hour_rate',
        type: 'peak_hour_rate',
        value: 1.2,
        conditions: { timeWindow: { start: '12:00', end: '14:00' } },
        active: true,
      },
    ]);
  }

  async registerDriver(userId: string, data: any) {
    const driver = this.driverRepo.create({
      userId,
      ...data,
      kycStatus: 'pending',
    });
    return await this.driverRepo.save(driver);
  }

  async updateLocation(driverId: string, lat: number, lng: number) {
    return this.driverRepo.update(driverId, {
       currentLocation: { lat, lng } as any,
       lastLocationUpdate: new Date(),
    });
  }

  async findAvailableDrivers(lat: number, lng: number, radiusInKm: number = 5): Promise<DriverEntity[]> {
    const radius = radiusInKm * 1000;
    return this.driverRepo
      .createQueryBuilder('driver')
      .where('driver.isOnline = :online', { online: true })
      .andWhere('driver.kycStatus = :status', { status: 'approved' })
      .andWhere('driver.isFraudSuspicious = :suspicious', { suspicious: false })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius }
      )
      .orderBy('driver.rating', 'DESC')
      .addOrderBy('driver.totalDeliveries', 'ASC')
      .getMany();
  }

  async assignOrderToDriver(orderId: string, driverId: string): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await manager.update(OrderEntity, orderId, {
        driverId,
        status: OrderStatus.DRIVER_ASSIGNED,
      });

      await manager.increment(DriverEntity, driverId, 'totalDeliveries', 0);

      const assignment = manager.create(DriverAssignmentEntity, {
        driverId: driverId as any,
        orderId: orderId as any,
        status: 'assigned' as any,
        distance: 5,
        estimatedTimeMinutes: 30,
      });
      await manager.save(DriverAssignmentEntity, assignment);
    });
  }

  calculateTrafficAwareRoute(
    restaurantLocation: GeoPoint,
    customerLocation: GeoPoint,
    historicalSpeed?: number
  ): { eta: number; distance: number; duration: number; trafficFactor: number } {
    const distance = this.geoService.calculateDistance(restaurantLocation, customerLocation);
    const basePrediction = this.geoService.predictETA(distance, historicalSpeed || 30);
    
    const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
    const historicalSpeedFactor = historicalSpeed ? (30 / historicalSpeed) : 1;
    const trafficFactor = Math.max(0.5, Math.min(3.0, (timeOfDayFactor * historicalSpeedFactor)));
    
    const adjustedDuration = basePrediction.duration * trafficFactor;
    const adjustedETA = Math.ceil(adjustedDuration + (adjustedDuration * 0.2));
    
    return { eta: adjustedETA, distance: basePrediction.distance, duration: Math.ceil(adjustedDuration), trafficFactor };
  }

  getTimeOfDayTrafficFactor(): number {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return 1.5;
    if (hour >= 12 && hour <= 14) return 1.3;
    if (hour >= 17 && hour <= 20) return 1.7;
    return 1.0;
  }

  getSurgeMultiplier(location: GeoPoint): number {
    for (const zone of this.surgeZones.values()) {
      if (zone.active && this.geoService.calculateDistance(location, zone.center) <= zone.radiusKm) {
        return zone.surgeMultiplier;
      }
    }
    return 1.0;
  }

  async calculateSurgeForOrder(orderId: string, restaurantLocation: GeoPoint): Promise<number> {
    const surge = this.getSurgeMultiplier(restaurantLocation);
    const timeSurge = this.getTimeOfDayTrafficFactor();
    return Math.max(surge, timeSurge);
  }

  async handleFailedDelivery(
    orderId: string, 
    driverId: string, 
    failureReason: string,
    reasonDetails?: string
  ): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await manager.update(OrderEntity, orderId, {
        status: OrderStatus.CANCELLED,
        paymentStatus: PaymentStatus.FAILED,
      });

       const driver = await manager.findOne(DriverEntity, { where: { id: driverId } });
       if (driver && reasonDetails !== 'customer_unavailable') {
         const newFailureCount = driver.failureCount + 1;
         await manager.update(DriverEntity, driverId, {
           failureCount: newFailureCount,
           isFraudSuspicious: newFailureCount >= 3,
         });
       }
    });

    this.handleDriverNoShow(driverId);
  }

  private async handleDriverNoShow(driverId: string): Promise<void> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) return;

    const assignments = await this.driverAssignmentRepo.find({
      where: { driver: { id: driverId } as any },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentNoShows = assignments.filter(a => 
      a.status === 'failed' && (a as any).failureReason === 'no_show'
    ).length;

    if (recentNoShows >= 2) {
      await this.driverRepo.update(driverId, {
        isFraudSuspicious: true,
        fraudFlags: { ...driver.fraudFlags, noShowRisk: 0.8 } as any,
      });
      this.logger.warn(`Driver ${driverId} flagged for no-shows`);
    }
  }

  async reassignOrder(restaurantLat: number, restaurantLng: number, orderId: string, excludeDriverId?: string): Promise<boolean> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return false;

    const availableDrivers = await this.findAvailableDrivers(restaurantLat, restaurantLng, 5);
    const driversToConsider = availableDrivers.filter(d => 
      d.id !== excludeDriverId && !d.isFraudSuspicious
    );

    if (driversToConsider.length === 0) return false;

    const bestDriver = driversToConsider.reduce((best, current) => 
      (current.rating || 0) > (best.rating || 0) ? current : best
    );

    await this.assignOrderToDriver(orderId, bestDriver.id);
    return true;
  }

  async calculateDeliveryIncentives(driverId: string, date: Date = new Date()): Promise<{
    totalIncentive: number;
    breakdown: { [key: string]: number };
  }> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) return { totalIncentive: 0, breakdown: {} };

    const rules = this.incentiveRules.get('default') || [];
    const breakdown: { [key: string]: number } = {};
    let totalIncentive = 0;

    for (const rule of rules) {
      if (!rule.active) continue;

      switch (rule.type) {
        case 'bonus_per_order':
          const completedToday = await this.driverAssignmentRepo.count({
            where: { status: 'delivered' as any },
          });
          if ((!rule.conditions.minDeliveries || completedToday >= rule.conditions.minDeliveries)) {
            breakdown[rule.id] = rule.value * completedToday;
            totalIncentive += breakdown[rule.id];
          }
          break;
      }
    }

    return { totalIncentive, breakdown };
  }

  async validateGeoFence(driverId: string, centerLat: number, centerLng: number, radiusKm: number = 1): Promise<boolean> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver?.currentLocation) return false;

    const distance = this.geoService.calculateDistance(
      driver.currentLocation as any,
      { lat: centerLat, lng: centerLng }
    );

    return distance <= radiusKm;
  }

  async rerouteDriver(
    driverId: string,
    orderId: string,
    newDestination: GeoPoint,
    reason: string
  ): Promise<void> {
    const assignment = await this.driverAssignmentRepo.findOne({
      where: { order: { id: orderId } as any } as any,
    });
    if (!assignment) return;

    const newRoute = this.geoService.calculateDistance(
      { lat: 0, lng: 0 },
      newDestination
    );

    await this.driverAssignmentRepo.update(assignment.id, {
      status: 'assigned' as any,
    });
  }
}