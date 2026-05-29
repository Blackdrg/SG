import { Repository, DataSource } from 'typeorm';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
export declare class DriverPayoutService {
    private incentiveRepo;
    private driverRepo;
    private orderRepo;
    private dataSource;
    private readonly logger;
    constructor(incentiveRepo: Repository<DriverIncentiveEntity>, driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, dataSource: DataSource);
    calculateWeeklyIncentives(driverId: string, weekStart: Date): Promise<any>;
    generateIncentive(driverId: string, type: string, amount: number, description: string, referenceId?: string): Promise<DriverIncentiveEntity>;
    approveIncentive(incentiveId: string, approverId: string): Promise<DriverIncentiveEntity>;
    markPaid(incentiveId: string, payoutReference: string): Promise<DriverIncentiveEntity>;
    getPendingIncentives(driverId?: string): Promise<DriverIncentiveEntity[]>;
    getIncentiveSummary(driverId: string, month: number, year: number): Promise<any>;
}
