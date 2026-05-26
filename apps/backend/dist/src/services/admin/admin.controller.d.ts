import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(query: any): Promise<{
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
    getFullStats(query: any): Promise<{
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
    getOrders(page: string, limit: string): Promise<import("../../db/entities/order.entity").OrderEntity[]>;
    banUser(body: {
        userId: string;
        reason: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
}
