import { DriverAssignmentService } from './driver-assignment.service';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
export declare class DriverAssignmentController {
    private readonly driverAssignmentService;
    constructor(driverAssignmentService: DriverAssignmentService);
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
    getAvailableDrivers(lat: number, lng: number, radius?: number): Promise<DriverEntity[]>;
    updateDriverScore(driverId: string): Promise<DriverScoreEntity>;
    calculateETA(orderId: string, driverId: string): Promise<{
        etaMinutes: number;
        confidence: number;
        factors: {
            distance: number;
            trafficConditions: {
                multiplier: number;
                level: string;
            };
            kitchenDelay: {
                delayMinutes: number;
                confidence: number;
            };
            driverExperience: number;
            timeOfDay: number;
            weatherImpact: {
                multiplier: number;
                condition: string;
            };
        };
    }>;
    recordDeliverySLA(data: {
        driverId: string;
        branchId: string;
        metricName: string;
        value: number;
        unit: string;
        targetValue?: number;
        targetUnit?: string;
        measurementPeriod?: string;
    }): Promise<DeliverySLAEntity>;
    getDeliverySLAMetrics(driverId?: string, branchId?: string, metricName?: string, limit?: number): Promise<DeliverySLAEntity[]>;
    recordFraudIncident(data: {
        driverId: string;
        orderId: string;
        branchId: string;
        fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other';
        evidence: any;
        severity: 'low' | 'medium' | 'high';
    }): Promise<DriverFraudEntity>;
    getDriverFraudHistory(driverId: string): Promise<DriverFraudEntity[]>;
    getAllFraudIncidents(driverId?: string, limit?: number): Promise<any[]>;
}
