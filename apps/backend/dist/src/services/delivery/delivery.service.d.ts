import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { GeoService } from '../../services/geo/geo.service';
export declare class DeliveryService {
    private driverRepo;
    private walletRepo;
    private transactionRepo;
    private orderRepo;
    private batchRepo;
    private driverAssignmentRepo;
    private driverScoreRepo;
    private driverFraudRepo;
    private geoService;
    private dataSource;
    constructor(driverRepo: Repository<DriverEntity>, walletRepo: Repository<WalletEntity>, transactionRepo: Repository<WalletTransactionEntity>, orderRepo: Repository<OrderEntity>, batchRepo: Repository<BatchEntity>, driverAssignmentRepo: Repository<DriverAssignmentEntity>, driverScoreRepo: Repository<DriverScoreEntity>, driverFraudRepo: Repository<DriverFraudEntity>, geoService: GeoService, dataSource: DataSource);
    registerDriver(userId: string, data: any): Promise<DriverEntity[]>;
    updateLocation(driverId: string, lat: number, lng: number): Promise<import("typeorm").UpdateResult>;
    findAvailableDrivers(lat: number, lng: number, radiusInKm?: number): Promise<DriverEntity[]>;
    assignOrderToDriver(orderId: string, driverId: string): Promise<import("typeorm").UpdateResult>;
    calculateTrafficAwareRoute(restaurantLocation: {
        lat: number;
        lng: number;
    }, customerLocation: {
        lat: number;
        lng: number;
    }, historicalSpeed?: number): Promise<{
        eta: number;
        distance: number;
        duration: number;
        trafficFactor: number;
    }>;
    correctETAWithRealTimeData(assignmentId: string): Promise<{
        correctionFactor: number;
        originalETA: number;
        actualTime: number;
        correctedETA: number;
    }>;
    updateActualDeliveryTime(assignmentId: string, actualTimeMinutes: number): Promise<import("typeorm").UpdateResult>;
    calculateAndUpdateDriverScore(driverId: string, restaurantId?: string): Promise<DriverScoreEntity>;
    private calculateScoreComponents;
    getDriverScore(scoreId: string): Promise<DriverScoreEntity>;
    getCurrentDriverScore(driverId: string, restaurantId?: string): Promise<DriverScoreEntity | null>;
    detectFraudFromGPSData(assignmentId: string, gpsData: Array<{
        lat: number;
        lng: number;
        timestamp: Date;
    }>): Promise<{
        fraudDetected: boolean;
        fraudType: 'gps_spoofing' | 'route_deviation' | 'timing_abuse' | 'fake_delivery' | null;
        riskScore: number;
        evidence: any;
    }>;
    private detectGPSSpoofing;
    private detectRouteDeviation;
    private detectTimingAbuse;
    private detectFakeDelivery;
    recordFraudIncident(assignmentId: string, fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other', evidence: any, severity?: 'low' | 'medium' | 'high'): Promise<DriverFraudEntity>;
    getDriverFraudScore(driverId: string): Promise<{
        fraudScore: number;
        isFraudSuspicious: boolean;
        fraudFlags: {
            gpsSpoofingRisk: number;
            routeDeviationRisk: number;
            timingAbuseRisk: number;
            fakeDeliveryRisk: number;
        };
        lastFraudCheck: Date | null;
    }>;
    updateDriverFraudScore(driverId: string): Promise<void>;
    private toRadians;
    private calculateDistance;
    createBatch(name: string, description: string, restaurantId: string, recipeId: string, quantityPrepared: number, quantityUnit: string): Promise<BatchEntity>;
    addOrdersToBatch(batchId: string, orderIds: string[]): Promise<{
        success: boolean;
        batchId: string;
        orderCount: number;
    }>;
    assignBatchToDriver(batchId: string, driverId: string): Promise<{
        success: boolean;
        batchId: string;
        driverId: string;
        orderCount: number;
        message: string;
    }>;
    reassignOrderToDriver(orderId: string, newDriverId: string, reason?: string): Promise<{
        success: boolean;
        orderId: string;
        newDriverId: string;
        reason: string;
    }>;
    completeDelivery(orderId: string, driverId: string, earning: number): Promise<void>;
}
