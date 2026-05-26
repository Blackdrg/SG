import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { OrderStatus } from '../../shared/domain/order.interface';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { GeoService } from '../../services/geo/geo.service';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(WalletEntity)
    private walletRepo: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepo: Repository<WalletTransactionEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(BatchEntity)
    private batchRepo: Repository<BatchEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private driverAssignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectRepository(DriverScoreEntity)
    private driverScoreRepo: Repository<DriverScoreEntity>,
    @InjectRepository(DriverFraudEntity)
    private driverFraudRepo: Repository<DriverFraudEntity>,
    private geoService: GeoService,
    private dataSource: DataSource
  ) {}

  async registerDriver(userId: string, data: any) {
    const driver = this.driverRepo.create({
      userId,
      ...data,
      kycStatus: 'pending',
    });
    const savedDriver = await this.driverRepo.save(driver);
    
    const wallet = this.walletRepo.create({ userId, balance: 0 });
    await this.walletRepo.save(wallet);
    
    return savedDriver;
  }

  async updateLocation(driverId: string, lat: number, lng: number) {
    return this.driverRepo.update(driverId, {
      currentLocation: { lat, lng },
    });
  }

  async findAvailableDrivers(lat: number, lng: number, radiusInKm: number = 5) {
    const radius = radiusInKm * 1000;
    return this.driverRepo
      .createQueryBuilder('driver')
      .where('driver.isOnline = :online', { online: true })
      .andWhere('driver.kycStatus = :status', { status: 'approved' })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius }
      )
      .getMany();
  }

  async assignOrderToDriver(orderId: string, driverId: string) {
    return this.orderRepo.update(orderId, {
      driverId,
      status: OrderStatus.DRIVER_ASSIGNED,
    });
  }

  calculateTrafficAwareRoute(
    restaurantLocation: { lat: number; lng: number },
    customerLocation: { lat: number; lng: number },
    historicalSpeed?: number
  ): { eta: number; distance: number; duration: number; trafficFactor: number } {
    const distance = this.geoService.calculateDistance(restaurantLocation, customerLocation);
    const basePrediction = this.geoService.predictETA(distance, historicalSpeed || 30);
    
    const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
    const historicalSpeedFactor = historicalSpeed ? (30 / historicalSpeed) : 1;
    
    const trafficFactor = Math.max(0.5, Math.min(3.0, (timeOfDayFactor * historicalSpeedFactor)));
    
    const adjustedDuration = basePrediction.duration * trafficFactor;
    const adjustedETA = Math.ceil(adjustedDuration + (adjustedDuration * 0.2));
    
    return {
      eta: adjustedETA,
      distance: basePrediction.distance,
      duration: Math.ceil(adjustedDuration),
      trafficFactor
    };
  }

  getTimeOfDayTrafficFactor(): number {
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9) return 1.5; // Morning rush
    if (hour >= 12 && hour <= 14) return 1.3; // Lunch rush
    if (hour >= 17 && hour <= 20) return 1.7; // Evening rush
    return 1.0; // Normal hours
  }

  async updateActualDeliveryTime(assignmentId: string, actualTimeMinutes: number) {
    return this.driverAssignmentRepo.update(assignmentId, {
      actualTimeMinutes: actualTimeMinutes,
      updatedAt: new Date()
    });
  }

  async calculateScoreComponents(driverId: string, restaurantId?: string): Promise<{ 
    overallScore: number; 
    onTimeRate: number; 
    acceptanceRate: number; 
    cancellationRate: number 
  }> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const totalDeliveries = driver.totalDeliveries || 0;
    
    // For now, calculate based on basic metrics
    const onTimeRate = totalDeliveries > 0 ? 0.95 : 0;
    const acceptanceRate = totalDeliveries > 0 ? 0.90 : 0;
    const cancellationRate = totalDeliveries > 0 ? 0.05 : 0;

    return {
      overallScore: driver.rating || 4.5,
      onTimeRate,
      acceptanceRate,
      cancellationRate,
    };
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}