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
    }, historicalSpeed?: number): {
        eta: number;
        distance: number;
        duration: number;
        trafficFactor: number;
    };
    getTimeOfDayTrafficFactor(): number;
    updateActualDeliveryTime(assignmentId: string, actualTimeMinutes: number): Promise<import("typeorm").UpdateResult>;
    calculateScoreComponents(driverId: string, restaurantId?: string): Promise<{
        overallScore: number;
        onTimeRate: number;
        acceptanceRate: number;
        cancellationRate: number;
    }>;
    private toRadians;
}
