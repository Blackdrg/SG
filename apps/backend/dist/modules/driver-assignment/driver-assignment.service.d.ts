import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { DispatchEngineService } from './dispatch-engine.service';
import { ETAIntelligenceService } from './eta-intelligence.service';
export declare class DriverAssignmentService {
    private readonly driverRepo;
    private readonly orderRepo;
    private readonly assignmentRepo;
    private readonly branchRepo;
    private readonly scoreRepo;
    private readonly slaRepo;
    private readonly fraudRepo;
    private readonly dataSource;
    private readonly dispatchEngine;
    private readonly etaIntelligence;
    constructor(driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, branchRepo: Repository<RestaurantBranchEntity>, scoreRepo: Repository<DriverScoreEntity>, slaRepo: Repository<DeliverySLAEntity>, fraudRepo: Repository<DriverFraudEntity>, dataSource: DataSource, dispatchEngine: DispatchEngineService, etaIntelligence: ETAIntelligenceService);
    assignDriverToOrder(orderId: string): Promise<DriverAssignmentEntity>;
    assignBatchDelivery(orderIds: string[], driverId: string): Promise<DriverAssignmentEntity[]>;
    reassignOrder(assignmentId: string, newDriverId: string, reason?: string): Promise<DriverAssignmentEntity>;
    getDriverAssignments(driverId: string, status?: string): Promise<DriverAssignmentEntity[]>;
    getOrderAssignments(orderId: string): Promise<DriverAssignmentEntity[]>;
    updateAssignmentStatus(assignmentId: string, status: DriverAssignmentEntity['status'], actualTimeMinutes?: number): Promise<DriverAssignmentEntity>;
    updateAssignmentRoute(assignmentId: string, routeData: {
        start: {
            lat: number;
            lng: number;
        };
        end: {
            lat: number;
            lng: number;
        };
        waypoints: Array<{
            lat: number;
            lng: number;
            timestamp: Date;
        }>;
    }): Promise<DriverAssignmentEntity>;
    getAvailableDrivers(lat: number, lng: number, radiusInKm?: number): Promise<DriverEntity[]>;
    updateDriverScore(driverId: string): Promise<DriverScoreEntity>;
    recordDeliverySLA(driverId: string, branchId: string, metricName: string, value: number, unit: string, targetValue?: number, targetUnit?: string, measurementPeriod?: string): Promise<DeliverySLAEntity>;
    recordFraudIncident(driverId: string, orderId: string, branchId: string, fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other', evidence: any, severity: 'low' | 'medium' | 'high'): Promise<DriverFraudEntity>;
    private updateDriverFraudScore;
    getDriverFraudHistory(driverId: string): Promise<DriverFraudEntity[]>;
    getDeliverySLAMetrics(driverId?: string, branchId?: string, metricName?: string, limit?: number): Promise<DeliverySLAEntity[]>;
}
