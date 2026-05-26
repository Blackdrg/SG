import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { AuditLogEntity } from '../../db/entities/audit-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async getDashboardStats(branchId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let where: any = { createdAt: Between(today, new Date()) };
    if (branchId) {
      where = { ...where, restaurantId: branchId };
    }

    try {
      const [ordersToday, totalRevenue] = await Promise.all([
        this.orderRepo.count({ where }),
        this.orderRepo.createQueryBuilder('order')
          .select('SUM(order.grandTotal)', 'total')
          .where('order.createdAt >= :today', { today })
          .getRawOne(),
      ]);

      const activeDrivers = await this.driverRepo.count({ where: { isOnline: true } });

      return {
        stats: {
          revenue: totalRevenue?.total || 0,
          orders: ordersToday,
          driversOnline: activeDrivers,
          complaints: 0,
          refunds: 0,
          fraudAlerts: 0,
          activeBranches: 3,
          pendingWithdrawals: 0,
        },
        revenueData: this.generateMockRevenueData(),
        branches: [
          { name: 'Downtown', status: 'operational', orderCount: 12, avgPrepMins: 15, driversAssigned: 8 },
          { name: 'Mall Road', status: 'operational', orderCount: 8, avgPrepMins: 12, driversAssigned: 6 },
          { name: 'Gulshan', status: 'operational', orderCount: 5, avgPrepMins: 10, driversAssigned: 4 },
        ],
        tickets: [],
      };
    } catch (e) {
      return {
        stats: {
          revenue: 0,
          orders: 0,
          driversOnline: 0,
          complaints: 0,
          refunds: 0,
          fraudAlerts: 0,
          activeBranches: 3,
          pendingWithdrawals: 0,
        },
        revenueData: this.generateMockRevenueData(),
        branches: [
          { name: 'Downtown', status: 'operational', orderCount: 0, avgPrepMins: 15, driversAssigned: 0 },
          { name: 'Mall Road', status: 'operational', orderCount: 0, avgPrepMins: 12, driversAssigned: 0 },
          { name: 'Gulshan', status: 'operational', orderCount: 0, avgPrepMins: 10, driversAssigned: 0 },
        ],
        tickets: [],
      };
    }
  }

  private generateMockRevenueData() {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => ({
      t: `${String(i).padStart(2, '0')}:00`,
      revenue: Math.floor(Math.random() * 2000) + 500,
      orders: Math.floor(Math.random() * 20) + 5,
    }));
  }

  async logAction(action: string, userId: string, entityType: string, entityId: string, metadata: any) {
    const log = this.auditRepo.create({
      action,
      performedBy: userId,
      entityType,
      entityId,
      metadata,
    });
    return this.auditRepo.save(log);
  }

  async getAllOrders(page: number = 1, limit: number = 10) {
    return this.orderRepo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async banUser(userId: string, reason: string) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    return { success: true };
  }
}
