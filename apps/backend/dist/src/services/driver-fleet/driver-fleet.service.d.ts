import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverShiftEntity } from '../../db/entities/driver-shift.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverPenaltyEntity } from '../../db/entities/driver-penalty.entity';
import { DriverIncentiveEntity } from '../../db/entities/driver-incentive.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
export declare class DriverFleetService {
    private driverRepo;
    private shiftRepo;
    private scoreRepo;
    private penaltyRepo;
    private incentiveRepo;
    private orderRepo;
    private assignmentRepo;
    private dataSource;
    private readonly logger;
    constructor(driverRepo: Repository<DriverEntity>, shiftRepo: Repository<DriverShiftEntity>, scoreRepo: Repository<DriverScoreEntity>, penaltyRepo: Repository<DriverPenaltyEntity>, incentiveRepo: Repository<DriverIncentiveEntity>, orderRepo: Repository<OrderEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, dataSource: DataSource);
    startShift(driverId: string): Promise<DriverShiftEntity>;
    endShift(driverId: string, shiftId: string): Promise<DriverShiftEntity>;
    getShifts(driverId: string, limit?: number): Promise<DriverShiftEntity[]>;
    getEarnings(driverId: string, period: {
        start: Date;
        end: Date;
    }): Promise<any>;
    calculateIncentives(driverId: string): Promise<any>;
    issuePenalty(driverId: string, data: any): Promise<DriverPenaltyEntity>;
    getPerformanceRanking(driverId?: string): Promise<any>;
    getDriverSchedule(driverId: string, days?: number): Promise<any>;
    approvePenalty(penaltyId: string, approvedBy: string): Promise<DriverPenaltyEntity>;
    waivePenalty(penaltyId: string, waivedBy: string, reason: string): Promise<DriverPenaltyEntity>;
    getPenalties(driverId: string): Promise<DriverPenaltyEntity[]>;
}
