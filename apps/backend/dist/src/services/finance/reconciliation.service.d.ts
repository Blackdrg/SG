import { Repository, DataSource } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletTransactionEntity } from '../../db/entities/wallet-transaction.entity';
import { PayoutReportEntity } from '../../db/entities/payout-report.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { GSTDetailEntity } from '../../db/entities/gst-detail.entity';
export declare class ReconciliationService {
    private orderRepo;
    private transactionRepo;
    private payoutRepo;
    private incentiveRepo;
    private gstRepo;
    private dataSource;
    private readonly logger;
    constructor(orderRepo: Repository<OrderEntity>, transactionRepo: Repository<WalletTransactionEntity>, payoutRepo: Repository<PayoutReportEntity>, incentiveRepo: Repository<DriverIncentiveEntity>, gstRepo: Repository<GSTDetailEntity>, dataSource: DataSource);
    reconcilePayments(startDate: Date, endDate: Date): Promise<any>;
    reconcilePayouts(restaurantId: string, startDate: Date, endDate: Date): Promise<any>;
    reconcileDriverPayments(driverId: string, startDate: Date, endDate: Date): Promise<any>;
    getGSTReconciliation(restaurantId: string, month: number, year: number): Promise<any>;
    runFullReconciliation(dateRange: {
        start: Date;
        end: Date;
    }): Promise<any>;
    private calculateOverallStatus;
}
