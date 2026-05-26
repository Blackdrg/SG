import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { OrderStatus } from '../../shared/domain/order.interface';
import { DispatchEngineService } from './dispatch-engine.service';
import { ETAIntelligenceService } from './eta-intelligence.service';

@Injectable()
export class DriverAssignmentService {
  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private readonly assignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverScoreEntity)
    private readonly scoreRepo: Repository<DriverScoreEntity>,
    @InjectRepository(DeliverySLAEntity)
    private readonly slaRepo: Repository<DeliverySLAEntity>,
    @InjectRepository(DriverFraudEntity)
    private readonly fraudRepo: Repository<DriverFraudEntity>,
    private readonly dataSource: DataSource,
    private readonly dispatchEngine: DispatchEngineService,
    private readonly etaIntelligence: ETAIntelligenceService
  ) {}

  /**
   * Assign a driver to an order using the dispatch engine
   */
  async assignDriverToOrder(orderId: string): Promise<DriverAssignmentEntity> {
    return this.dispatchEngine.dispatchOrder(orderId);
  }

  /**
   * Assign multiple orders to a single driver (batch delivery)
   */
  async assignBatchDelivery(
    orderIds: string[],
    driverId: string
  ): Promise<DriverAssignmentEntity[]> {
    return this.dispatchEngine.assignBatchDelivery(orderIds, driverId);
  }

  /**
   * Reassign an order from one driver to another
   */
  async reassignOrder(
    assignmentId: string,
    newDriverId: string,
    reason: string = 'Driver unavailable'
  ): Promise<DriverAssignmentEntity> {
    return this.dispatchEngine.reassignOrder(assignmentId, newDriverId, reason);
  }

  /**
   * Get current assignments for a driver
   */
  async getDriverAssignments(
    driverId: string,
    status?: string
  ): Promise<DriverAssignmentEntity[]> {
    const where: any = { driver: { id: driverId } };
    if (status) {
      where.status = status;
    }
    return this.assignmentRepo.find({
      where,
      relations: ['order', 'driver', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get assignments for an order
   */
  async getOrderAssignments(orderId: string): Promise<DriverAssignmentEntity[]> {
    return this.assignmentRepo.find({
      where: { order: { id: orderId } },
      relations: ['driver', 'branch'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Update assignment status (accepted, picked_up, delivered, etc.)
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: DriverAssignmentEntity['status'],
    actualTimeMinutes?: number
  ): Promise<DriverAssignmentEntity> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = status;
    if (actualTimeMinutes !== undefined) {
      assignment.actualTimeMinutes = actualTimeMinutes;
    }
    
    // If delivered, set completed timestamp
    if (status === 'delivered') {
      assignment.actualTimeMinutes = actualTimeMinutes || 0;
      // In a real system, you'd calculate actual time from timestamps
    }

    return this.assignmentRepo.save(assignment);
  }

  /**
   * Record GPS tracking data for an assignment
   */
  async updateAssignmentRoute(
    assignmentId: string,
    routeData: {
      start: { lat: number; lng: number };
      end: { lat: number; lng: number };
      waypoints: Array<{ lat: number; lng: number; timestamp: Date }>;
    }
  ): Promise<DriverAssignmentEntity> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.routeData = routeData;
    return this.assignmentRepo.save(assignment);
  }

  /**
   * Get available drivers for a location
   */
  async getAvailableDrivers(
    lat: number,
    lng: number,
    radiusInKm: number = 5
  ): Promise<DriverEntity[]> {
    const radius = radiusInKm * 1000; // Convert to meters
    
    return this.driverRepo
      .createQueryBuilder('driver')
      .where('driver.isOnline = :online', { online: true })
      .andWhere('driver.kycStatus = :status', { status: 'approved' })
      .andWhere('driver.isFraudSuspicious = :fraud', { fraud: false })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius }
      )
      .getMany();
  }

  /**
   * Calculate and update driver score based on performance
   */
  async updateDriverScore(driverId: string): Promise<DriverScoreEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new Error('Driver not found');
    }

    // Get recent assignments for scoring calculations
    const recentAssignments = await this.assignmentRepo.find({
      where: { driver: { id: driverId }, status: 'delivered' },
      relations: ['order'],
       order: { createdAt: 'DESC' },
      take: 50 // Look at last 50 deliveries
    });

    if (recentAssignments.length === 0) {
      // No delivery history yet - set default scores
      const score = this.scoreRepo.create({
        driver,
        overallScore: 0,
        onTimeDeliveryRate: 0,
        acceptanceRate: 0,
        cancellationRate: 0,
        customerRating: driver.rating || 0,
        totalDeliveries: driver.totalDeliveries,
        totalDistance: driver.totalDistance,
         averageSpeed: driver.averageSpeed,
        lastCalculatedAt: new Date()
      });
      return this.scoreRepo.save(score);
    }

    // Calculate metrics from recent assignments
    const totalDeliveries = recentAssignments.length;
    const onTimeDeliveries = recentAssignments.filter(a => 
      a.actualTimeMinutes !== null && 
      a.estimatedTimeMinutes !== null && 
      a.actualTimeMinutes <= a.estimatedTimeMinutes * 1.2 // Allow 20% buffer
    ).length;
    
    const onTimeDeliveryRate = (onTimeDeliveries / totalDeliveries) * 100;
    
    // For simplicity, we'll assume acceptance rate based on assignments vs refusals
    // In reality, you'd track refused assignments
    const acceptanceRate = 95; // Placeholder
    
    // Cancellation rate from assignments
    const cancelledAssignments = await this.assignmentRepo.count({
      where: { 
        driver: { id: driverId },
        status: 'failed' // Assuming 'failed' means cancelled
      }
    });
    const totalAssignments = await this.assignmentRepo.count({
      where: { driver: { id: driverId } }
    });
    const cancellationRate = totalAssignments > 0 
      ? (cancelledAssignments / totalAssignments) * 100 
      : 0;

    // Average customer rating would come from order ratings in a real system
    const customerRating = driver.rating || 0;

    // Calculate overall score (weighted average)
    const overallScore = 
      (onTimeDeliveryRate / 100) * 0.3 +
      (acceptanceRate / 100) * 0.2 +
      (1 - cancellationRate / 100) * 0.2 + // Invert cancellation rate
      (customerRating / 5) * 0.3; // Normalize rating to 0-1

    // Update or create driver score
    let score = await this.scoreRepo.findOne({ where: { driver: { id: driverId } } });
    if (!score) {
      score = this.scoreRepo.create({ driver });
    }

    score.overallScore = overallScore * 5; // Convert to 0-5 scale
    score.onTimeDeliveryRate = onTimeDeliveryRate;
    score.acceptanceRate = acceptanceRate;
    score.cancellationRate = cancellationRate;
    score.customerRating = customerRating;
    score.totalDeliveries = driver.totalDeliveries;
    score.totalDistance = driver.totalDistance;
    score.averageSpeed = driver.averageSpeed;
    score.lastCalculatedAt = new Date();

    return this.scoreRepo.save(score);
  }

  /**
   * Record delivery SLA metrics
   */
  async recordDeliverySLA(
    driverId: string,
    branchId: string,
    metricName: string,
    value: number,
    unit: string,
    targetValue?: number,
    targetUnit?: string,
    measurementPeriod: string = 'per_delivery'
  ): Promise<DeliverySLAEntity> {
    const [driver, branch] = await Promise.all([
      this.driverRepo.findOne({ where: { id: driverId } }),
      this.branchRepo.findOne({ where: { id: branchId } })
    ]);

    if (!driver || !branch) {
      throw new Error('Driver or branch not found');
    }

    const sla = this.slaRepo.create({
      driver,
      branch,
      metricName,
      value,
      unit,
      targetValue,
      targetUnit,
      measurementPeriod,
      measuredAt: new Date()
    });

    return this.slaRepo.save(sla);
  }

  /**
   * Record potential fraud incident
   */
  async recordFraudIncident(
    driverId: string,
    orderId: string,
    branchId: string,
    fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other',
    evidence: any,
    severity: 'low' | 'medium' | 'high'
  ): Promise<DriverFraudEntity> {
    const [driver, order, branch] = await Promise.all([
      this.driverRepo.findOne({ where: { id: driverId } }),
      this.orderRepo.findOne({ where: { id: orderId } }),
      this.branchRepo.findOne({ where: { id: branchId } })
    ]);

    if (!driver || !order || !branch) {
      throw new Error('Driver, order, or branch not found');
    }

    const fraud = this.fraudRepo.create({
      driver,
      order,
      branch,
      fraudType,
      evidence,
      severity,
      isResolved: false
    });

    // Update driver fraud score based on incident
    await this.updateDriverFraudScore(driverId, fraudType, severity);

    return this.fraudRepo.save(fraud);
  }

  /**
   * Update driver's fraud risk score based on incident
   */
  private async updateDriverFraudScore(
    driverId: string,
    fraudType: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<void> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      return;
    }

    // Increase fraud score based on severity
    let scoreIncrease = 0;
    switch (severity) {
      case 'low':
        scoreIncrease = 5;
        break;
      case 'medium':
        scoreIncrease = 15;
        break;
      case 'high':
        scoreIncrease = 30;
        break;
    }

    // Adjust based on fraud type (some are more serious)
    let typeMultiplier = 1;
    switch (fraudType) {
      case 'fake_delivery':
      case 'gps_spoofing':
        typeMultiplier = 1.5; // More serious
        break;
      case 'route_deviation':
        typeMultiplier = 1.2;
        break;
      case 'late_delivery_abuse':
        typeMultiplier = 1.0;
        break;
      default:
        typeMultiplier = 1.0;
    }

    const newFraudScore = Math.min(100, driver.fraudScore + (scoreIncrease * typeMultiplier));
    const isFraudSuspicious = newFraudScore >= 70; // Consider suspicious if score >= 70

    await this.driverRepo.update(driverId, {
      fraudScore: newFraudScore,
      isFraudSuspicious,
      lastFraudCheck: new Date()
    });
  }

  /**
   * Get driver's fraud history
   */
  async getDriverFraudHistory(driverId: string): Promise<DriverFraudEntity[]> {
    return this.fraudRepo.find({
      where: { driver: { id: driverId } },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Get delivery SLA metrics for a driver or branch
   */
  async getDeliverySLAMetrics(
    driverId?: string,
    branchId?: string,
    metricName?: string,
    limit: number = 100
  ): Promise<DeliverySLAEntity[]> {
    const where: any = {};
    if (driverId) {
      where.driver = { id: driverId };
    }
    if (branchId) {
      where.branch = { id: branchId };
    }
    if (metricName) {
      where.metricName = metricName;
    }

    return this.slaRepo.find({
      where,
      order: { measuredAt: 'DESC' },
      take: limit
    });
  }
}