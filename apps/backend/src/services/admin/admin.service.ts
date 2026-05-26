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

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersToday, totalRevenue] = await Promise.all([
      this.orderRepo.count({ where: { createdAt: Between(today, new Date()) } }),
      this.orderRepo.createQueryBuilder('order')
        .select('SUM(order.grandTotal)', 'total')
        .where('order.createdAt >= :today', { today })
        .getRawOne(),
    ]);

    const activeDrivers = await this.driverRepo.count({ where: { isOnline: true } });

    return {
      ordersToday,
      revenueToday: totalRevenue.total || 0,
      activeDrivers,
    };
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

  async banUser(userId: string, adminId: string, reason: string) {
    await this.userRepo.update(userId, { status: 'suspended' as any });
    await this.logAction('BAN_USER', adminId, 'USER', userId, { reason });
    return { success: true };
  }
}
