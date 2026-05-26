import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { OrderStatus } from '../../shared/domain/order.interface';

@Injectable()
export class DispatchEngineService {
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
    private readonly dataSource: DataSource
  ) {}

  /**
   * Core dispatch logic - assigns drivers to orders based on multiple factors
   */
  async dispatchOrder(orderId: string): Promise<DriverAssignmentEntity> {
    // Start transaction for consistency
    return this.dataSource.transaction(async (manager) => {
      // 1. Get the order details
      const order = await manager.findOne(OrderEntity, {
        where: { id: orderId },
        relations: ['restaurantId'] // Assuming we have restaurant relation
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // 2. Get restaurant branch (simplified - in reality you'd get branch from restaurant)
      const branch = await manager.findOne(RestaurantBranchEntity, {
        where: { restaurant: { id: order.restaurantId } } // Adjust based on your entity relations
      });

      if (!branch) {
        throw new Error('Restaurant branch not found');
      }

      // 3. Find available drivers based on multiple criteria
      const availableDrivers = await this.findOptimalDrivers(
        order, 
        branch,
        manager
      );

      if (!availableDrivers || availableDrivers.length === 0) {
        throw new Error('No available drivers found');
      }

      // 4. Select best driver based on scoring algorithm
      const bestDriver = this.selectBestDriver(availableDrivers, order, branch);

      // 5. Create assignment
      const assignment = await this.createAssignment(
        bestDriver,
        order,
        branch,
        'single', // assignment type
        manager
      );

      // 6. Update order with driver assignment
      await manager.update(OrderEntity, orderId, {
        driverId: bestDriver.id,
        status: OrderStatus.DRIVER_ASSIGNED
      });

      return assignment;
    });
  }

  /**
   * Find drivers that meet basic availability and qualification criteria
   */
  private async findOptimalDrivers(
    order: OrderEntity,
    branch: RestaurantBranchEntity,
    manager: any
  ): Promise<DriverEntity[]> {
    // For now, we'll use a simple proximity-based search
    // In reality, you'd want to get the restaurant location from branch
    // This is a simplified version - you'd need to enhance based on your actual data model
    
    // Get drivers who are online and approved
    const drivers = await manager.find(DriverEntity, {
      where: {
        isOnline: true,
        kycStatus: 'approved',
        isFraudSuspicious: false
      }
    });

    // Filter by distance and other factors would go here
    // For now, return all available drivers (in production, you'd filter by proximity)
    return drivers;
  }

  /**
   * Select the best driver based on multiple scoring factors
   */
  private selectBestDriver(
    drivers: DriverEntity[],
    order: OrderEntity,
    branch: RestaurantBranchEntity
  ): DriverEntity {
    // Simple scoring algorithm - in reality this would be much more sophisticated
    return drivers.reduce((best, current) => {
      const bestScore = this.calculateDriverScore(best, order, branch);
      const currentScore = this.calculateDriverScore(current, order, branch);
      return currentScore > bestScore ? current : best;
    }, drivers[0]);
  }

  /**
   * Calculate a driver's suitability score for an order
   */
  private calculateDriverScore(
    driver: DriverEntity,
    order: OrderEntity,
    branch: RestaurantBranchEntity
  ): number {
    let score = 0;

    // Factor 1: Driver rating (0-5 scale, normalized to 0-1)
    score += (driver.rating / 5) * 0.3;

    // Factor 2: Fraud risk (inverted - lower risk is better)
    score += ((100 - driver.fraudScore) / 100) * 0.2;

    // Factor 3: Experience (based on total deliveries, normalized)
    const experienceScore = Math.min(driver.totalDeliveries / 1000, 1); // Cap at 1000 deliveries
    score += experienceScore * 0.2;

    // Factor 4: Average speed (prefer reasonable speeds - not too slow or too fast)
    const speedScore = 1 - Math.abs(driver.averageSpeed - 30) / 50; // Ideal around 30 km/h
    score += Math.max(0, speedScore) * 0.15;

    // Factor 5: Distance from restaurant (would need actual location data)
    // For now, we'll add a placeholder - in reality you'd calculate actual distance
    score += 0.15; // Placeholder for proximity score

    return score;
  }

  /**
   * Create a driver assignment record
   */
  private async createAssignment(
    driver: DriverEntity,
    order: OrderEntity,
    branch: RestaurantBranchEntity,
    assignmentType: 'single' | 'batch' | 'stacked',
    manager: any
  ): Promise<DriverAssignmentEntity> {
    // In a real implementation, you would:
    // 1. Calculate actual distance between restaurant and delivery location
    // 2. Estimate time based on distance, traffic, etc.
    // 3. Get actual route data from GPS/mapping service

    const assignment = manager.create(DriverAssignmentEntity, {
      driver,
      order,
      branch,
      assignmentType,
      status: 'assigned',
      distance: 5.0, // Placeholder - would be calculated
      estimatedTimeMinutes: 30, // Placeholder - would be calculated
      isPriority: false,
      retryCount: 0
    });

    return manager.save(DriverAssignmentEntity, assignment);
  }

  /**
   * Handle batch delivery assignments (multiple orders to one driver)
   */
  async assignBatchDelivery(
    orderIds: string[],
    driverId: string
  ): Promise<DriverAssignmentEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      const driver = await manager.findOne(DriverEntity, { where: { id: driverId } });
      if (!driver) {
        throw new Error('Driver not found');
      }

      const orders = await manager.find(OrderEntity, {
        where: { id: In(orderIds) }
      });

      if (orders.length !== orderIds.length) {
        throw new Error('Some orders not found');
      }

      // Get branch from first order (assuming all orders are from same restaurant)
      const branch = await manager.findOne(RestaurantBranchEntity, {
        where: { restaurant: { id: orders[0].restaurantId } }
      });

      const assignments = [];

      for (const order of orders) {
        const assignment = manager.create(DriverAssignmentEntity, {
          driver,
          order,
          branch,
          assignmentType: 'batch',
          batchId: `batch_${Date.now()}`, // Simple batch ID generation
          status: 'assigned',
          distance: 5.0, // Placeholder
          estimatedTimeMinutes: 30, // Placeholder
          isPriority: false,
          retryCount: 0
        });

        assignments.push(await manager.save(DriverAssignmentEntity, assignment));

        // Update order
        await manager.update(OrderEntity, order.id, {
          driverId: driver.id,
          status: OrderStatus.DRIVER_ASSIGNED
        });
      }

      return assignments;
    });
  }

  /**
   * Handle order reassignment (when driver fails to pickup or complete)
   */
  async reassignOrder(
    assignmentId: string,
    newDriverId: string,
    reason: string
  ): Promise<DriverAssignmentEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Get current assignment
      const currentAssignment = await manager.findOne(DriverAssignmentEntity, {
        where: { id: assignmentId },
        relations: ['driver', 'order', 'branch']
      });

      if (!currentAssignment) {
        throw new Error('Assignment not found');
      }

      // Get new driver
      const newDriver = await manager.findOne(DriverEntity, { where: { id: newDriverId } });
      if (!newDriver) {
        throw new Error('New driver not found');
      }

      // Update current assignment as reassigned
      currentAssignment.status = 'reassigned';
      currentAssignment.reassignedFrom = currentAssignment.driver.id;
      currentAssignment.retryCount += 1;

      await manager.save(DriverAssignmentEntity, currentAssignment);

      // Create new assignment
      const newAssignment = manager.create(DriverAssignmentEntity, {
        driver: newDriver,
        order: currentAssignment.order,
        branch: currentAssignment.branch,
        assignmentType: currentAssignment.assignmentType,
        batchId: currentAssignment.batchId,
        status: 'assigned',
        distance: currentAssignment.distance,
        estimatedTimeMinutes: currentAssignment.estimatedTimeMinutes,
        isPriority: currentAssignment.isPriority,
        reassignedFrom: currentAssignment.driver.id,
        retryCount: 0
      });

      const savedAssignment = await manager.save(DriverAssignmentEntity, newAssignment);

      // Update order with new driver
      await manager.update(OrderEntity, currentAssignment.order.id, {
        driverId: newDriver.id
      });

      return savedAssignment;
    });
  }
}