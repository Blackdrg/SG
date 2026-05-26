import { Repository } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
export declare class ETAIntelligenceService {
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly branchRepo;
    private readonly assignmentRepo;
    private readonly slaRepo;
    private readonly fraudRepo;
    constructor(driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, branchRepo: Repository<RestaurantBranchEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, slaRepo: Repository<DeliverySLAEntity>, fraudRepo: Repository<DriverFraudEntity>);
    calculateETA(orderId: string, driverId: string): Promise<{
        etaMinutes: number;
        confidence: number;
        factors: Record<string, any>;
    }>;
    private calculateDistance;
    private getTrafficConditions;
    private getKitchenDelay;
    private getWeatherImpact;
    private calculateConfidence;
    updateETARegionalTime(assignmentId: string, currentLocation: {
        lat: number;
        lng: number;
    }): Promise<{
        etaMinutes: number;
        timestamp: Date;
    }>;
    getHistoricalETAAccuracy(driverId?: string, branchId?: string, days?: number): Promise<{
        averageErrorMinutes: number;
        accuracyPercentage: number;
    }>;
}
