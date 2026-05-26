import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class GeoService {
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly AVERAGE_SPEED_KMH = 30;

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
  ) {}

  calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  predictETA(distance: number, speedKmh: number = this.AVERAGE_SPEED_KMH): ETAPrediction {
    const duration = (distance / speedKmh) * 60;
    const buffer = duration * 0.2;
    const eta = Math.ceil(duration + buffer);

    return {
      eta,
      distance,
      duration: Math.ceil(duration),
    };
  }

  async findNearbyBranches(
    customerLocation: GeoPoint,
    radiusInKm: number = 5,
    limit: number = 20,
  ): Promise<BranchWithDistance[]> {
    const radius = radiusInKm * 1000;

    return this.branchRepo
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.restaurant', 'restaurant')
      .select([
        'branch',
        'restaurant',
        `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
      ])
      .where(
        `ST_DistanceSphere(branch.location::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng: customerLocation.lng, lat: customerLocation.lat, radius },
      )
      .andWhere('branch.isOnline = :isOnline', { isOnline: true })
      .andWhere('restaurant.isActive = :isActive', { isActive: true })
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawMany()
      .then((results) =>
        results.map((r) => ({
          ...r.branch,
          distance: r.distance / 1000,
          restaurant: r.restaurant,
        })),
      );
  }

  async findNearestBranchForOrder(
    restaurantId: string,
    customerLocation: GeoPoint,
  ): Promise<RestaurantBranchEntity | null> {
    const branches = await this.branchRepo.find({
      where: { isOnline: true } as any,
    });

    if (!branches.length) return null;

    let nearest = branches[0];
    let minDistance = Infinity;

    for (const branch of branches) {
      if (branch.location) {
        const branchPoint = {
          lat: Number(branch.location.lat),
          lng: Number(branch.location.lng),
        };
        const distance = this.calculateDistance(customerLocation, branchPoint);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = branch;
        }
      }
    }

    return nearest;
  }

  async findAvailableDrivers(
    restaurantLocation: GeoPoint,
    radiusInKm: number = 5,
    limit: number = 10,
  ): Promise<DriverEntity[]> {
    const radius = radiusInKm * 1000;

    return this.driverRepo
      .createQueryBuilder('driver')
      .select([
        'driver',
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) AS distance`,
      ])
      .where('driver.isOnline = :isOnline', { isOnline: true })
      .andWhere('driver.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng: restaurantLocation.lng, lat: restaurantLocation.lat, radius },
      )
      .orderBy('distance', 'ASC')
      .limit(limit)
      .getRawMany()
      .then((results) => results.map((r) => r.driver));
  }

  async calculateDeliveryRoute(
    restaurantLocation: GeoPoint,
    customerLocation: GeoPoint,
  ): Promise<ETAPrediction> {
    const distance = this.calculateDistance(restaurantLocation, customerLocation);
    return this.predictETA(distance);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}