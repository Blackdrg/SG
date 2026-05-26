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
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

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
    
    // Create wallet for driver
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

  /**
   * Calculate traffic-aware route and ETA for a delivery
   * @param restaurantLocation Location of the restaurant
   * @param customerLocation Location of the customer
   * @param historicalSpeed Optional historical speed data for the route
   * @returns Traffic-aware ETA prediction
   */
  async calculateTrafficAwareRoute(
    restaurantLocation: { lat: number; lng: number },
    customerLocation: { lat: number; lng: number },
    historicalSpeed?: number
  ): Promise<{ eta: number; distance: number; duration: number; trafficFactor: number }> {
    // Use the geo service to calculate basic distance and ETA
    const basePrediction = await this.geoService.calculateDeliveryRoute(
      restaurantLocation,
      customerLocation
    );

    // In a real implementation, we would call a traffic API (like Google Maps, HERE, etc.)
    // For now, we'll simulate traffic-aware adjustments based on time of day and historical data
    const timeOfDayFactor = this.getTimeOfDayTrafficFactor();
    const historicalSpeedFactor = historicalSpeed ? 
      (this.geoService['AVERAGE_SPEED_KMH'] / historicalSpeed) : 1;
    
    // Combine factors to get traffic adjustment
    const trafficFactor = Math.max(0.5, Math.min(3.0, (timeOfDayFactor * historicalSpeedFactor)));
    
    // Apply traffic factor to duration
    const adjustedDuration = basePrediction.duration * trafficFactor;
    const adjustedETA = Math.ceil(adjustedDuration + (adjustedDuration * 0.2)); // Add 20% buffer
    
    return {
      eta: adjustedETA,
      distance: basePrediction.distance,
      duration: Math.ceil(adjustedDuration),
      trafficFactor
    };
  }

  /**
   * Correct ETA based on actual vs estimated delivery times
   * @param assignmentId The driver assignment ID to correct ETA for
   * @returns Correction factor and updated ETA estimate
   */
  async correctETAWithRealTimeData(assignmentId: string): Promise<{ 
    correctionFactor: number; 
    originalETA: number; 
    actualTime: number; 
    correctedETA: number 
  }> {
    const assignment = await this.driverAssignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['order']
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    if (!assignment.actualTimeMinutes) {
      throw new Error(`Actual time not recorded for assignment ${assignmentId}`);
    }

    const originalETA = assignment.estimatedTimeMinutes;
    const actualTime = assignment.actualTimeMinutes;
    
    // Calculate correction factor (actual/estimated)
    // If actual > estimated, we were optimistic (factor > 1)
    // If actual < estimated, we were pessimistic (factor < 1)
    const correctionFactor = actualTime / originalETA;
    
    // Apply correction factor to future similar deliveries
    // For now, we'll return the factor so it can be used in future predictions
    const correctedETA = Math.ceil(originalETA * correctionFactor);
    
    return {
      correctionFactor,
      originalETA,
      actualTime,
      correctedETA
    };
  }

  /**
   * Update actual delivery time for ETA learning
   * @param assignmentId The driver assignment ID
   * @param actualTimeMinutes Actual time taken for delivery in minutes
   */
  async updateActualDeliveryTime(assignmentId: string, actualTimeMinutes: number) {
    return this.driverAssignmentRepo.update(assignmentId, {
      actualTimeMinutes: actualTimeMinutes,
      updatedAt: new Date()
    });
  }

  /**
   * Get average ETA correction factor for a driver or area
   * @param driverId Optional driver ID to get driver-specific correction
   * @param areaCenter Optional geographic area to get area-specific correction
   * @returns Average correction factor and sample size
   */
  async getAverageETACorrectionFactor(
    driverId?: string,
    areaCenter?: { lat: number; lng: number },
    radiusInKm: number = 5
  ): Promise<{ 
    averageCorrectionFactor: number; 
    sampleSize: number; 
    confidence: 'low' | 'medium' | 'high' 
  }> {
    const queryBuilder = this.driverAssignmentRepo
      .createQueryBuilder('assignment')
      .where('assignment.actualTimeMinutes IS NOT NULL')
      .andWhere('assignment.estimatedTimeMinutes IS NOT NULL')
      .andWhere('assignment.actualTimeMinutes > 0')
      .andWhere('assignment.estimatedTimeMinutes > 0');

    if (driverId) {
      queryBuilder.andWhere('assignment.driverId = :driverId', { driverId });
    }

    // Note: For area-based correction, we'd need to join with order/restaurant location
    // This is simplified for now

    const assignments = await queryBuilder.getMany();

    if (assignments.length === 0) {
      return {
        averageCorrectionFactor: 1.0, // No correction needed
        sampleSize: 0,
        confidence: 'low'
      };
    }

    const correctionFactors = assignments.map(a => a.actualTimeMinutes / a.estimatedTimeMinutes);
    const averageFactor = correctionFactors.reduce((sum, factor) => sum + factor, 0) / correctionFactors.length;
    
    // Determine confidence based on sample size
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (assignments.length >= 20) {
      confidence = 'high';
    } else if (assignments.length >= 5) {
      confidence = 'medium';
    }

    return {
      averageCorrectionFactor: averageFactor,
      sampleSize: assignments.length,
      confidence
    };
  }

  /**
   * Calculate and update delivery score for a driver
   * @param driverId The driver ID
   * @param restaurantId Optional restaurant ID to calculate score for specific restaurant
   * @returns Updated driver score
   */
  async calculateAndUpdateDriverScore(driverId: string, restaurantId?: string): Promise<DriverScoreEntity> {
    // Get driver info
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }

    // Get restaurant branch if specified
    let branch = null;
    if (restaurantId) {
      // In a real implementation, we'd find the specific branch
      // For now, we'll just get any online branch for the restaurant
      branch = await this.geoService.branchRepo.findOne({ 
        where: { restaurant: { id: restaurantId }, isOnline: true } as any 
      });
    }

    // Calculate score components
    const scoreComponents = await this.calculateScoreComponents(driverId, restaurantId);
    
    // Check if score already exists for this driver/branch combination
    let existingScore = null;
    if (branch) {
      existingScore = await this.driverScoreRepo.findOne({
        where: { driver: { id: driverId }, branch: { id: branch.id } as any }
      });
    } else {
      // General score (not tied to specific branch)
      existingScore = await this.driverScoreRepo.findOne({
        where: { driver: { id: driverId } }
      });
    }

    const scoreData = {
      driver: driver,
      branch: branch,
      overallScore: scoreComponents.overallScore,
      onTimeDeliveryRate: scoreComponents.onTimeDeliveryRate,
      acceptanceRate: scoreComponents.acceptanceRate,
      cancellationRate: scoreComponents.cancellationRate,
      customerRating: scoreComponents.customerRating,
      totalDeliveries: scoreComponents.totalDeliveries,
      totalDistance: scoreComponents.totalDistance,
      averageSpeed: scoreComponents.averageSpeed,
      lastCalculatedAt: new Date()
    };

    if (existingScore) {
      // Update existing score
      await this.driverScoreRepo.update(existingScore.id, scoreData);
      existingScore = { ...existingScore, ...scoreData };
      return existingScore;
    } else {
      // Create new score
      const newScore = this.driverScoreRepo.create(scoreData);
      return this.driverScoreRepo.save(newScore);
    }
  }

  /**
   * Calculate individual score components for a driver
   * @param driverId The driver ID
   * @param restaurantId Optional restaurant ID
   * @returns Object containing all score components
   */
  private async calculateScoreComponents(driverId: string, restaurantId?: string): Promise<{
    overallScore: number;
    onTimeDeliveryRate: number;
    acceptanceRate: number;
    cancellationRate: number;
    customerRating: number;
    totalDeliveries: number;
    totalDistance: number;
    averageSpeed: number;
  }> {
    // Build base query for assignments
    const assignmentQuery = this.driverAssignmentRepo
      .createQueryBuilder('assignment')
      .leftJoin('assignment.driver', 'driver')
      .leftJoin('assignment.order', 'order')
      .where('driver.id = :driverId', { driverId });

    if (restaurantId) {
      assignmentQuery.andWhere('order.restaurantId = :restaurantId', { restaurantId });
    }

    // Get completed assignments for scoring
    const completedAssignments = await assignmentQuery
      .andWhere('assignment.status = :status', { status: 'delivered' })
      .getMany();

    // Get all assignments (for acceptance/cancellation rates)
    const allAssignments = await assignmentQuery.getMany();

    // Calculate on-time delivery rate
    const onTimeDeliveries = completedAssignments.filter(a => 
      a.actualTimeMinutes !== null && 
      a.estimatedTimeMinutes !== null && 
      a.actualTimeMinutes <= a.estimatedTimeMinutes * 1.2 // Allow 20% buffer
    ).length;
    
    const onTimeDeliveryRate = completedAssignments.length > 0 
      ? (onTimeDeliveries / completedAssignments.length) * 100 
      : 0;

    // Calculate acceptance rate (simplified - in reality would need assignment offers)
    const acceptedAssignments = allAssignments.filter(a => 
      a.status !== 'failed' && a.status !== 'cancelled'
    ).length;
    const acceptanceRate = allAssignments.length > 0 
      ? (acceptedAssignments / allAssignments.length) * 100 
      : 0;

    // Calculate cancellation rate
    const cancelledAssignments = allAssignments.filter(a => 
      a.status === 'cancelled' || a.status === 'failed'
    ).length;
    const cancellationRate = allAssignments.length > 0 
      ? (cancelledAssignments / allAssignments.length) * 100 
      : 0;

    // Get customer rating from driver entity (updated elsewhere)
    const customerRating = Math.max(0, Math.min(5, driver.rating || 0));

    // Calculate total deliveries and distance
    const totalDeliveries = completedAssignments.length;
    const totalDistance = completedAssignments.reduce((sum, a) => sum + (a.distance || 0), 0);
    
    // Calculate average speed (km/h)
    const totalTimeInHours = completedAssignments.reduce((sum, a) => sum + (a.actualTimeMinutes || 0) / 60, 0);
    const averageSpeed = totalTimeInHours > 0 
      ? totalDistance / totalTimeInHours 
      : 0;

    // Calculate overall score (weighted average)
    // Weights: on-time (30%), acceptance (20%), low cancellation (10%), customer rating (30%), speed/distance (10%)
    const onTimeScore = (onTimeDeliveryRate / 100) * 5; // Convert to 0-5 scale
    const acceptanceScore = (acceptanceRate / 100) * 5;
    const cancellationScore = ((100 - cancellationRate) / 100) * 5; // Invert so lower cancellation = higher score
    const customerScore = customerRating; // Already 0-5 scale
    const speedDistanceScore = Math.min(5, (totalDeliveries / 100) * 5); // Cap at 5 for 100+ deliveries
    
    const overallScore = (
      onTimeScore * 0.3 +
      acceptanceScore * 0.2 +
      cancellationScore * 0.1 +
      customerScore * 0.3 +
      speedDistanceScore * 0.1
    );

    return {
      overallScore: parseFloat(overallScore.toFixed(2)),
      onTimeDeliveryRate: parseFloat(onTimeDeliveryRate.toFixed(2)),
      acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
      cancellationRate: parseFloat(cancellationRate.toFixed(2)),
      customerRating: parseFloat(customerRating.toFixed(2)),
      totalDeliveries,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      averageSpeed: parseFloat(averageSpeed.toFixed(2))
    };
  }

  /**
   * Get driver score by ID
   * @param scoreId The driver score ID
   * @returns Driver score entity
   */
  async getDriverScore(scoreId: string): Promise<DriverScoreEntity> {
    const score = await this.driverScoreRepo.findOne(scoreId, {
      relations: ['driver', 'branch']
    });
    if (!score) {
      throw new NotFoundException(`Driver score with ID ${scoreId} not found`);
    }
    return score;
  }

  /**
   * Get driver's current score (most recent)
   * @param driverId The driver ID
   * @param restaurantId Optional restaurant ID
   * @returns Driver's most recent score
   */
  async getCurrentDriverScore(driverId: string, restaurantId?: string): Promise<DriverScoreEntity | null> {
    const query = this.driverScoreRepo
      .createQueryBuilder('score')
      .leftJoin('score.driver', 'driver')
      .where('driver.id = :driverId', { driverId });

    if (restaurantId) {
      query.leftJoin('score.branch', 'branch')
        .andWhere('branch.restaurantId = :restaurantId', { restaurantId });
    } else {
      query.andWhere('score.branch IS NULL'); // General score
    }

    return query
      .orderBy('score.lastCalculatedAt', 'DESC')
      .getOne();
  }

  /**
   * Detect potential fraud based on GPS data and timing
   * @param assignmentId The driver assignment ID
   * @param gpsData Array of GPS points with timestamps
   * @returns Fraud assessment results
   */
  async detectFraudFromGPSData(
    assignmentId: string,
    gpsData: Array<{ lat: number; lng: number; timestamp: Date }>
  ): Promise<{ 
    fraudDetected: boolean; 
    fraudType: 'gps_spoofing' | 'route_deviation' | 'timing_abuse' | 'fake_delivery' | null;
    riskScore: number; // 0-100
    evidence: any 
  }> {
    const assignment = await this.driverAssignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['order', 'driver']
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    // Initialize fraud detection results
    let fraudDetected = false;
    let fraudType: 'gps_spoofing' | 'route_deviation' | 'timing_abuse' | 'fake_delivery' | null = null;
    let riskScore = 0;
    const evidence: any = {};

    // 1. Check for GPS spoofing (impossible speeds, teleportation)
    const gpsSpoofingRisk = this.detectGPSSpoofing(gpsData);
    evidence.gpsSpoofingRisk = gpsSpoofingRisk;
    
    // 2. Check for route deviation
    const routeDeviationRisk = await this.detectRouteDeviation(assignment, gpsData);
    evidence.routeDeviationRisk = routeDeviationRisk;
    
    // 3. Check for timing abuse (unusually fast/slow deliveries)
    const timingAbuseRisk = this.detectTimingAbuse(assignment, gpsData);
    evidence.timingAbuseRisk = timingAbuseRisk;
    
    // 4. Check for fake delivery (no movement, stopped at wrong location)
    const fakeDeliveryRisk = this.detectFakeDelivery(assignment, gpsData);
    evidence.fakeDeliveryRisk = fakeDeliveryRisk;

    // Calculate overall risk score (weighted average)
    riskScore = Math.min(100, 
      (gpsSpoofingRisk * 0.3) + 
      (routeDeviationRisk * 0.3) + 
      (timingAbuseRisk * 0.2) + 
      (fakeDeliveryRisk * 0.2)
    );

    // Determine if fraud is likely and what type
    if (riskScore >= 70) {
      fraudDetected = true;
      // Determine primary fraud type based on highest risk factor
      const risks = {
        gps_spoofing: gpsSpoofingRisk,
        route_deviation: routeDeviationRisk,
        timing_abuse: timingAbuseRisk,
        fake_delivery: fakeDeliveryRisk
      };
      fraudType = Object.keys(risks).reduce((a, b) => risks[a] > risks[b] ? a : b) as any;
    } else if (riskScore >= 40) {
      // Medium risk - flag for review but don't auto-mark as fraud
      fraudDetected = false;
    }

    return {
      fraudDetected,
      fraudType,
      riskScore: parseFloat(riskScore.toFixed(2)),
      evidence
    };
  }

  /**
   * Detect GPS spoofing by checking for impossible speeds or teleportation
   * @param gpsData Array of GPS points
   * @returns Risk score (0-100)
   */
  private detectGPSSpoofing(gpsData: Array<{ lat: number; lng: number; timestamp: Date }>): number {
    if (gpsData.length < 2) return 0;

    let maxSpeedKmh = 0;
    const EARTH_RADIUS_KM = 6371;

    for (let i = 1; i < gpsData.length; i++) {
      const prev = gpsData[i-1];
      const curr = gpsData[i];
      
      // Calculate distance between points
      const dLat = this.toRadians(curr.lat - prev.lat);
      const dLng = this.toRadians(curr.lng - prev.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(prev.lat)) *
        Math.cos(this.toRadians(curr.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = EARTH_RADIUS_KM * c;
      
      // Calculate time difference in hours
      const timeDiffMs = curr.timestamp.getTime() - prev.timestamp.getTime();
      const timeDiffHr = timeDiffMs / (1000 * 60 * 60);
      
      if (timeDiffHr > 0) {
        const speedKmh = distanceKm / timeDiffHr;
        maxSpeedKmh = Math.max(maxSpeedKmh, speedKmh);
      }
    }

    // Normalize risk score: normal delivery speeds are 5-25 km/h
    // Speeds over 100 km/h are suspicious, over 200 km/h are highly suspicious
    if (maxSpeedKmh > 200) return 100;
    if (maxSpeedKmh > 100) return 70 + ((maxSpeedKmh - 100) / 100 * 30); // 70-100 range
    if (maxSpeedKmh > 50) return 30 + ((maxSpeedKmh - 50) / 50 * 40); // 30-70 range
    return Math.max(0, (maxSpeedKmh - 25) / 25 * 30); // 0-30 range for 25-50 km/h
  }

  /**
   * Detect route deviation by comparing actual vs expected route
   * @param assignment The driver assignment
   * @param gpsData Array of GPS points
   * @returns Risk score (0-100)
   */
  private async detectRouteDeviation(
    assignment: any,
    gpsData: Array<{ lat: number; lng: number; timestamp: Date }>
  ): Promise<number> {
    // In a real implementation, we would:
    // 1. Get the expected route from a mapping service (Google Maps, etc.)
    // 2. Compare actual GPS points to expected route
    // 3. Calculate deviation percentage
    
    // For now, we'll simulate based on available data
    if (!assignment.routeData || !gpsData.length) return 0;
    
    // Simple check: if we have waypoints in the assignment, check if GPS data deviates significantly
    const expectedWaypoints = assignment.routeData.waypoints || [];
    if (!expectedWaypoints.length) return 0;
    
    // Calculate average deviation from expected waypoints
    let totalDeviation = 0;
    let validComparisons = 0;
    
    for (const gpsPoint of gpsData) {
      // Find closest expected waypoint
      let minDistance = Infinity;
      for (const waypoint of expectedWaypoints) {
        const distance = this.calculateDistance(
          { lat: gpsPoint.lat, lng: gpsPoint.lng },
          { lat: waypoint.lat, lng: waypoint.lng }
        );
        if (distance < minDistance) minDistance = distance;
      }
      
      if (minDistance !== Infinity) {
        totalDeviation += minDistance;
        validComparisons++;
      }
    }
    
    if (validComparisons === 0) return 0;
    
    const avgDeviationKm = totalDeviation / validComparisons;
    
    // Convert deviation to risk score: >1km deviation is suspicious
    if (avgDeviationKm > 5) return 100;
    if (avgDeviationKm > 2) return 60 + ((avgDeviationKm - 2) / 3 * 40); // 60-100 range
    if (avgDeviationKm > 1) return 30 + ((avgDeviationKm - 1) / 1 * 30); // 30-60 range
    return Math.max(0, avgDeviationKm * 30); // 0-30 range for 0-1km deviation
  }

  /**
   * Detect timing abuse by comparing actual vs estimated delivery times
   * @param assignment The driver assignment
   * @param gpsData Array of GPS points
   * @returns Risk score (0-100)
   */
  private detectTimingAbuse(
    assignment: any,
    gpsData: Array<{ lat: number; lng: number; timestamp: Date }>
  ): number {
    if (!assignment.estimatedTimeMinutes || !gpsData.length) return 0;
    
    // Calculate actual time from first to last GPS point
    if (gpsData.length < 2) return 0;
    
    const firstTimestamp = gpsData[0].timestamp.getTime();
    const lastTimestamp = gpsData[gpsData.length - 1].timestamp.getTime();
    const actualTimeMinutes = (lastTimestamp - firstTimestamp) / (1000 * 60);
    
    if (actualTimeMinutes <= 0) return 0;
    
    // Calculate ratio of actual to estimated time
    const timeRatio = actualTimeMinutes / assignment.estimatedTimeMinutes;
    
    // Unusually fast (<50% of estimated) or unusually slow (>200% of estimated) is suspicious
    if (timeRatio < 0.3) { // Extremely fast - likely fake
      return 100;
    } else if (timeRatio < 0.5) { // Very fast
      return 70 + ((0.5 - timeRatio) / 0.2 * 30); // 70-100 range
    } else if (timeRatio > 2.5) { // Extremely slow
      return 100;
    } else if (timeRatio > 2.0) { // Very slow
      return 60 + ((timeRatio - 2.0) / 0.5 * 40); // 60-100 range
    } else if (timeRatio > 1.5) { // Moderately slow
      return 30 + ((timeRatio - 1.5) / 0.5 * 30); // 30-60 range
    } else if (timeRatio < 0.8) { // Moderately fast
      return 30 + ((0.8 - timeRatio) / 0.3 * 30); // 30-60 range
    }
    
    return 0; // Normal timing
  }

  /**
   * Detect fake delivery by checking if driver actually moved between locations
   * @param assignment The driver assignment
   * @param gpsData Array of GPS points
   * @returns Risk score (0-100)
   */
  private detectFakeDelivery(
    assignment: any,
    gpsData: Array<{ lat: number; lng: number; timestamp: Date }>
  ): number {
    if (gpsData.length < 2) return 50; // Insufficient data is suspicious
    
    // Calculate total distance traveled
    let totalDistanceKm = 0;
    const EARTH_RADIUS_KM = 6371;
    
    for (let i = 1; i < gpsData.length; i++) {
      const prev = gpsData[i-1];
      const curr = gpsData[i];
      
      const dLat = this.toRadians(curr.lat - prev.lat);
      const dLng = this.toRadians(curr.lng - prev.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(prev.lat)) *
        Math.cos(this.toRadians(curr.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = EARTH_RADIUS_KM * c;
      
      totalDistanceKm += distanceKm;
    }
    
    // Get expected distance from assignment or calculate from locations
    let expectedDistanceKm = assignment.distance || 0;
    if (expectedDistanceKm === 0 && assignment.order) {
      // Calculate distance from restaurant to customer if we have locations
      // This would require accessing order/restaurant/customer locations
      // For now, we'll skip this calculation
    }
    
    if (expectedDistanceKm > 0) {
      // Compare actual vs expected distance
      const distanceRatio = totalDistanceKm / expectedDistanceKm;
      
      // If driver traveled less than 30% of expected distance, suspicious
      if (distanceRatio < 0.3) {
        return 80 + ((0.3 - distanceRatio) / 0.3 * 20); // 80-100 range
      } else if (distanceRatio < 0.6) {
        return 40 + ((0.6 - distanceRatio) / 0.3 * 40); // 40-80 range
      }
    } else {
      // If no expected distance, check if movement was minimal
      if (totalDistanceKm < 0.1) { // Less than 100 meters
        return 90; // Highly suspicious
      } else if (totalDistanceKm < 0.5) { // Less than 500 meters
        return 60; // Moderately suspicious
      }
    }
    
    return 0; // Normal movement
  }

  /**
   * Record detected fraud incident
   * @param assignmentId The driver assignment ID
   * @param fraudType Type of fraud detected
   * @param evidence Evidence collected
   * @param severity Severity level
   * @returns Created fraud entity
   */
  async recordFraudIncident(
    assignmentId: string,
    fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other',
    evidence: any,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<DriverFraudEntity> {
    const assignment = await this.driverAssignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['driver', 'order']
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${assignmentId} not found`);
    }

    const fraud = this.driverFraudRepo.create({
      driver: assignment.driver,
      order: assignment.order,
      fraudType,
      evidence,
      severity,
      isResolved: false
    });

    return this.driverFraudRepo.save(fraud);
  }

  /**
   * Get fraud score for a driver (aggregated from driver entity)
   * @param driverId The driver ID
   * @returns Fraud score and details
   */
  async getDriverFraudScore(driverId: string): Promise<{
    fraudScore: number;
    isFraudSuspicious: boolean;
    fraudFlags: {
      gpsSpoofingRisk: number;
      routeDeviationRisk: number;
      timingAbuseRisk: number;
      fakeDeliveryRisk: number;
    };
    lastFraudCheck: Date | null;
  }> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }

    return {
      fraudScore: driver.fraudScore,
      isFraudSuspicious: driver.isFraudSuspicious,
      fraudFlags: driver.fraudFlags || {
        gpsSpoofingRisk: 0,
        routeDeviationRisk: 0,
        timingAbuseRisk: 0,
        fakeDeliveryRisk: 0
      },
      lastFraudCheck: driver.lastFraudCheck || null
    };
  }

  /**
   * Update driver's fraud score based on recent incidents
   * @param driverId The driver ID
   */
  async updateDriverFraudScore(driverId: string): Promise<void> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException(`Driver with ID ${driverId} not found`);
    }

    // Get recent fraud incidents (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentFraud = await this.driverFraudRepo.find({
      where: {
        driver: { id: driverId },
        createdAt: moreThanOrEqual(thirtyDaysAgo)
      }
    });

    // Calculate new fraud score based on recent incidents
    // Each incident contributes to the score based on severity
    let newScore = 0;
    for (const incident of recentFraud) {
      let incidentScore = 0;
      switch (incident.severity) {
        case 'low':
          incidentScore = 10;
          break;
        case 'medium':
          incidentScore = 25;
          break;
        case 'high':
          incidentScore = 50;
          break;
      }
      newScore = Math.min(100, newScore + incidentScore);
    }

    // Decay factor: reduce score over time if no new incidents
    // For simplicity, we'll just set the score to the calculated value
    // In production, you'd want to incorporate time-based decay
    
    // Update fraud flags based on incident types
    const fraudFlags = {
      gpsSpoofingRisk: 0,
      routeDeviationRisk: 0,
      timingAbuseRisk: 0,
      fakeDeliveryRisk: 0
    };

    for (const incident of recentFraud) {
      switch (incident.fraudType) {
        case 'gps_spoofing':
          fraudFlags.gpsSpoofingRisk = Math.min(1, fraudFlags.gpsSpoofingRisk + 0.2);
          break;
        case 'route_deviation':
          fraudFlags.routeDeviationRisk = Math.min(1, fraudFlags.routeDeviationRisk + 0.2);
          break;
        case 'late_delivery_abuse':
          fraudFlags.timingAbuseRisk = Math.min(1, fraudFlags.timingAbuseRisk + 0.2);
          break;
        case 'fake_delivery':
          fraudFlags.fakeDeliveryRisk = Math.min(1, fraudFlags.fakeDeliveryRisk + 0.2);
          break;
        default:
          // Distribute 'other' type across all flags
          fraudFlags.gpsSpoofingRisk = Math.min(1, fraudFlags.gpsSpoofingRisk + 0.05);
          fraudFlags.routeDeviationRisk = Math.min(1, fraudFlags.routeDeviationRisk + 0.05);
          fraudFlags.timingAbuseRisk = Math.min(1, fraudFlags.timingAbuseRisk + 0.05);
          fraudFlags.fakeDeliveryRisk = Math.min(1, fraudFlags.fakeDeliveryRisk + 0.05);
          break;
      }
    }

    // Update driver entity
    driver.fraudScore = newScore;
    driver.isFraudSuspicious = newScore >= 50; // Consider suspicious if score >= 50
    driver.fraudFlags = fraudFlags;
    driver.lastFraudCheck = new Date();

    await this.driverRepo.save(driver);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
      Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; // Earth radius in KM
  }

  /**
   * Get average ETA correction factor for a driver or area
   * @param driverId Optional driver ID to get driver-specific correction
   * @param areaCenter Optional geographic area to get area-specific correction
   * @returns Average correction factor and sample size
   */
  async getAverageETACorrectionFactor(
    driverId?: string,
    areaCenter?: { lat: number; lng: number },
    radiusInKm: number = 5
  ): Promise<{ 
    averageCorrectionFactor: number; 
    sampleSize: number; 
    confidence: 'low' | 'medium' | 'high' 
  }> {
    const queryBuilder = this.driverAssignmentRepo
      .createQueryBuilder('assignment')
      .where('assignment.actualTimeMinutes IS NOT NULL')
      .andWhere('assignment.estimatedTimeMinutes IS NOT NULL')
      .andWhere('assignment.actualTimeMinutes > 0')
      .andWhere('assignment.estimatedTimeMinutes > 0');

    if (driverId) {
      queryBuilder.andWhere('assignment.driverId = :driverId', { driverId });
    }

    // Note: For area-based correction, we'd need to join with order/restaurant location
    // This is simplified for now

    const assignments = await queryBuilder.getMany();

    if (assignments.length === 0) {
      return {
        averageCorrectionFactor: 1.0, // No correction needed
        sampleSize: 0,
        confidence: 'low'
      };
    }

    const correctionFactors = assignments.map(a => a.actualTimeMinutes / a.estimatedTimeMinutes);
    const averageFactor = correctionFactors.reduce((sum, factor) => sum + factor, 0) / correctionFactors.length;
    
    // Determine confidence based on sample size
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (assignments.length >= 20) {
      confidence = 'high';
    } else if (assignments.length >= 5) {
      confidence = 'medium';
    }

    return {
      averageCorrectionFactor: averageFactor,
      sampleSize: assignments.length,
      confidence
    };
  }

  async createBatch(name: string, description: string, restaurantId: string, recipeId: string, quantityPrepared: number, quantityUnit: string) {
    const batch = this.batchRepo.create({
      name,
      description,
      recipe: { id: recipeId } as any,
      quantityPrepared,
      quantityUnit,
      status: 'preparing',
      branch: { id: restaurantId } as any
    });
    return this.batchRepo.save(batch);
  }

  async addOrdersToBatch(batchId: string, orderIds: string[]) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    const orders = await this.orderRepo.findByIds(orderIds);
    if (orders.length !== orderIds.length) {
      throw new Error('One or more orders not found');
    }

    // Update orders to mark them as part of this batch
    const updatePromises = orderIds.map(orderId =>
      this.orderRepo.update(orderId, { 
        status: OrderStatus.BATCHED
      })
    );
    
    await Promise.all(updatePromises);
    
    // Update batch status to ready if it was preparing
    if (batch.status === 'preparing') {
      batch.status = 'ready';
      batch.completedAt = new Date();
      await this.batchRepo.save(batch);
    }
    
    return { success: true, batchId, orderCount: orderIds.length };
  }

  async assignBatchToDriver(batchId: string, driverId: string) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }

    if (batch.status !== 'ready') {
      throw new Error(`Batch ${batchId} is not ready for assignment. Current status: ${batch.status}`);
    }

    // Find orders that are currently batched but not yet assigned to a driver
    const batchedOrders = await this.orderRepo.find({
      where: {
        status: OrderStatus.BATCHED,
        restaurantId: batch.branch.id // Assuming batch.branch has an id
      }
    });

    if (batchedOrders.length === 0) {
      throw new Error(`No batched orders found for batch ${batchId}`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update batch status to indicate it's being used
      await queryRunner.manager.update(BatchEntity, batchId, {
        status: 'used',
        updatedAt: new Date()
      });

      // Create driver assignments for each order in the batch
      const assignmentPromises = batchedOrders.map(async (order) => {
        // Check if order already has an assignment
        const existingAssignment = await this.driverAssignmentRepo.findOne({
          where: { orderId: order.id, status: 'assigned' }
        });
        
        if (!existingAssignment) {
          const assignment = this.driverAssignmentRepo.create({
            orderId: order.id,
            driverId: driverId,
            branchId: order.restaurantId,
            batchId: batchId,
            assignmentType: 'batch',
            status: 'assigned',
            retryCount: 0
          });
          return this.driverAssignmentRepo.save(assignment);
        }
        return null;
      });

      const results = await Promise.all(assignmentPromises);
      const successfulAssignments = results.filter(r => r !== null);

      await queryRunner.commitTransaction();
      return { 
        success: true, 
        batchId, 
        driverId, 
        orderCount: successfulAssignments.length,
        message: `Successfully assigned ${successfulAssignments.length} orders from batch ${batchId} to driver ${driverId}`
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reassignOrderToDriver(orderId: string, newDriverId: string, reason?: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (!order.driverId) {
      throw new Error(`Order ${orderId} is not currently assigned to any driver`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update the order with new driver
      await queryRunner.manager.update(OrderEntity, orderId, {
        driverId: newDriverId,
      });

      // Update the driver assignment record to mark as reassigned
      await queryRunner.manager.update(DriverAssignmentEntity, {
        orderId: orderId,
        status: 'assigned' // Find the current active assignment
      }, {
        status: 'reassigned',
        reassignedFrom: order.driverId,
        updatedAt: new Date()
      });

      // Create a new assignment record for the new driver
      const newAssignment = this.driverAssignmentRepo.create({
        orderId: orderId,
        driverId: newDriverId,
        branchId: order.restaurantId, // Assuming restaurantId relates to branch
        assignmentType: 'single',
        status: 'assigned',
        reassignedFrom: order.driverId,
        retryCount: 0
      });
      
      await queryRunner.manager.save(newAssignment);

      await queryRunner.commitTransaction();
      return { success: true, orderId, newDriverId, reason };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeDelivery(orderId: string, driverId: string, earning: number) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Update order status
      await manager.update(OrderEntity, orderId, { status: OrderStatus.DELIVERED });

      // 2. Update driver wallet
      const wallet = await manager.findOne(WalletEntity, { where: { userId: driverId } });
      if (wallet) {
        wallet.balance = Number(wallet.balance) + earning;
        await manager.save(wallet);

        // 3. Record transaction
        const transaction = this.transactionRepo.create({
          walletId: wallet.id,
          amount: earning,
          type: 'credit',
          description: `Earning for order #${orderId}`,
          referenceId: orderId,
        });
        await manager.save(transaction);
      }
    });
  }
}
