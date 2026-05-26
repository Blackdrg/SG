import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        ordersToday: number;
        revenueToday: any;
        activeDrivers: number;
    }>;
    getFullStats(): Promise<{
        ordersToday: number;
        revenueToday: any;
        activeDrivers: number;
    }>;
    getOrders(page: string, limit: string): Promise<import("../../db/entities/order.entity").OrderEntity[]>;
    banUser(body: {
        userId: string;
        reason: string;
    }, req: any): Promise<{
        success: boolean;
    }>;
}
