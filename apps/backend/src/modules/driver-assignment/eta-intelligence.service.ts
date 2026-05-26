import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';

@Injectable()
export class ETAIntelligenceService {
  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private readonly assignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectRepository(DeliverySLAEntity)
    private readonly slaRepo: Repository<DeliverySLAEntity>,
    @InjectRepository(DriverFraudEntity)
    private readonly fraudRepo: Repository<DriverFraudEntity>
  ) {}

  /**
   * Calculate ETA for an order based on multiple factors
   */
  async calculateETA(
    orderId: string,
    driverId: string
  ): Promise<{
    etaMinutes: number;
    confidence: number; // 0-1
    factors: Record<string, any>;
  }> {
    // Get all necessary data
    const [order, driver, branch, recentAssignments] = await Promise.all([
      this.orderRepo.findOne({ where: { id: orderId } }),
      this.driverRepo.findOne({ where: { id: driverId } }),
      this.branchRepo.findOne({ 
        where: { restaurant: { id: orderId } } // Simplified - adjust based on actual relations
      }),
      this.assignmentRepo.find({
        where: { driver: { id: driverId } },
        order: { createdAt: 'DESC' },
        take: 10
      })
    ]);

    if (!order || !driver || !branch) {
      throw new Error('Required data not found for ETA calculation');
    }

    // Base ETA calculation factors
    const factors = {
      distance: await this.calculateDistance(order, driver, branch),
      trafficConditions: await this.getTrafficConditions(),
      kitchenDelay: await this.getKitchenDelay(branch.id),
      driverExperience: driver.totalDeliveries,
      timeOfDay: new Date().getHours(),
      weatherImpact: await this.getWeatherImpact()
    };

    // Calculate base time based on distance and average speed
    const baseTimeMinutes = (factors.distance / Math.max(driver.averageSpeed, 10)) * 60; // Convert to minutes

    // Apply multipliers based on conditions
    let totalMultiplier = 1.0;
    
    // Traffic impact (1.0 = normal, 1.5 = heavy traffic, etc.)
    totalMultiplier *= factors.trafficConditions.multiplier || 1.0;
    
    // Kitchen delay impact
    totalMultiplier *= (1 + (factors.kitchenDelay.delayMinutes / 60));
    
    // Time of day impact (rush hours)
    const hour = factors.timeOfDay;
    if ((hour >= 7 && hour <= 9) || (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
      totalMultiplier *= 1.3; // Rush hour multiplier
    }
    
    // Weather impact
    totalMultiplier *= factors.weatherImpact.multiplier || 1.0;
    
    // Driver experience factor (experienced drivers are slightly faster)
    const experienceFactor = Math.max(0.8, 1 - (driver.totalDeliveries / 2000));
    totalMultiplier *= experienceFactor;

    const etaMinutes = baseTimeMinutes * totalMultiplier;
    
    // Calculate confidence based on data availability and historical accuracy
    const confidence = this.calculateConfidence(factors, recentAssignments);

    return {
      etaMinutes: Math.round(etaMinutes),
      confidence,
      factors
    };
  }

  /**
   * Calculate distance between restaurant and delivery location
   * (In reality, this would use a mapping service like Google Maps API)
   */
  private async calculateDistance(
    order: OrderEntity,
    driver: DriverEntity,
    branch: RestaurantBranchEntity
  ): Promise<number> {
    // Placeholder implementation - in reality you'd:
    // 1. Get restaurant coordinates from branch
    // 2. Get delivery coordinates from order
    // 3. Use a distance calculation service (Haversine formula or mapping API)
    
    // For now, return a reasonable placeholder
    return 5.0; // 5 km average
  }

  /**
   * Get current traffic conditions
   * (In reality, this would call a traffic API like Google Maps Traffic API)
   */
  private async getTrafficConditions(): Promise<{ multiplier: number; level: string }> {
    // Placeholder - in reality you'd call a traffic API
    // Return normal traffic conditions
    return {
      multiplier: 1.0,
      level: 'normal'
    };
  }

  /**
   * Get average kitchen delay for a branch
   */
  private async getKitchenDelay(branchId: string): Promise<{ delayMinutes: number; confidence: number }> {
    // Placeholder - in reality you'd query recent SLA data or kitchen metrics
    return {
      delayMinutes: 5, // 5 minutes average delay
      confidence: 0.7
    };
  }

  /**
   * Get weather impact factor
   * (In reality, this would call a weather API)
   */
  private async getWeatherImpact(): Promise<{ multiplier: number; condition: string }> {
    // Placeholder - in reality you'd call a weather API
    return {
      multiplier: 1.0,
      condition: 'clear'
    };
  }

  /**
   * Calculate confidence in ETA prediction based on data quality and historical accuracy
   */
  private calculateConfidence(
    factors: Record<string, any>,
    recentAssignments: DriverAssignmentEntity[]
  ): number {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence if we don't have enough historical data
    if (recentAssignments.length < 3) {
      confidence *= 0.8;
    }
    
    // Reduce confidence if any factor has low confidence
    if (factors.kitchenDelay && factors.kitchenDelay.confidence < 0.8) {
      confidence *= factors.kitchenDelay.confidence;
    }
    
    // Increase confidence for experienced drivers with good track record
    // This would be based on historical ETA accuracy in a real implementation
    
    return Math.min(0.95, Math.max(0.3, confidence)); // Clamp between 30% and 95%
  }

  /**
   * Update ETA for an ongoing delivery based on real-time progress
   */
  async updateETARegionalTime(
    assignmentId: string,
    currentLocation: { lat: number; lng: number }
  ): Promise<{ etaMinutes: number; timestamp: Date }> {
    // Placeholder implementation - in reality you'd:
    // 1. Get the assignment details
    // 2. Calculate remaining distance to destination
    // 3. Factor in current traffic, speed, etc.
    // 4. Return updated ETA
    
    return {
      etaMinutes: 15, // Placeholder
      timestamp: new Date()
    };
  }

  /**
   * Get historical ETA accuracy for a driver or branch
   */
  async getHistoricalETAAccuracy(
    driverId?: string,
    branchId?: string,
    days: number = 7
  ): Promise<{ averageErrorMinutes: number; accuracyPercentage: number }> {
    // Placeholder - in reality you'd compare predicted vs actual ETAs
    return {
      averageErrorMinutes: 3,
      accuracyPercentage: 85
    };
  }
}