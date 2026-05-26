import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';
export declare class AdminService {
    private readonly orderRepo;
    private readonly userRepo;
    private readonly driverRepo;
    private readonly auditRepo;
    constructor(orderRepo: Repository<OrderEntity>, userRepo: Repository<UserEntity>, driverRepo: Repository<DriverEntity>, auditRepo: Repository<AuditLogEntity>);
    getDashboardStats(branchId?: string): Promise<{
        stats: {
            revenue: any;
            orders: number;
            driversOnline: number;
            complaints: number;
            refunds: number;
            fraudAlerts: number;
            activeBranches: number;
            pendingWithdrawals: number;
        };
        revenueData: {
            t: string;
            revenue: number;
            orders: number;
        }[];
        branches: {
            name: string;
            status: string;
            orderCount: number;
            avgPrepMins: number;
            driversAssigned: number;
        }[];
        tickets: any[];
    }>;
    private generateMockRevenueData;
    logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any): Promise<AuditLogEntity>;
    getAllOrders(page?: number, limit?: number): Promise<OrderEntity[]>;
    banUser(userId: string, reason: string): Promise<{
        success: boolean;
    }>;
}
