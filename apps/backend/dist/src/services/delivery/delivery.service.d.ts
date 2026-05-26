import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { WalletEntity } from '../../db/entities/wallet.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { OrderEntity } from '../../db/entities/order.entity';
export declare class DeliveryService {
    private driverRepo;
    private walletRepo;
    private transactionRepo;
    private orderRepo;
    private dataSource;
    constructor(driverRepo: Repository<DriverEntity>, walletRepo: Repository<WalletEntity>, transactionRepo: Repository<WalletTransactionEntity>, orderRepo: Repository<OrderEntity>, dataSource: DataSource);
    registerDriver(userId: string, data: any): Promise<DriverEntity[]>;
    updateLocation(driverId: string, lat: number, lng: number): Promise<import("typeorm").UpdateResult>;
    findAvailableDrivers(lat: number, lng: number, radiusInKm?: number): Promise<DriverEntity[]>;
    assignOrderToDriver(orderId: string, driverId: string): Promise<import("typeorm").UpdateResult>;
    completeDelivery(orderId: string, driverId: string, earning: number): Promise<void>;
}
