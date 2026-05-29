import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { DriverIncentiveEntity, IncentiveStatus } from '../../db/entities/driver-incentive.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';

@Injectable()
export class DriverPayoutService {
  private readonly logger = new Logger(DriverPayoutService.name);

  constructor(
    @InjectRepository(DriverIncentiveEntity)
    private incentiveRepo: Repository<DriverIncentiveEntity>,
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    private dataSource: DataSource,
  ) {}

  async calculateWeeklyIncentives(driverId: string, weekStart: Date): Promise<any> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const orders = await this.orderRepo.find({
      where: {
        driverId: driverId as any,
        status: OrderStatus.DELIVERED,
        createdAt: Between(weekStart, weekEnd),
      },
    });

    const completedDeliveries = orders.length;
    const onTimeDeliveries = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

    const onTimeRate = completedDeliveries > 0 ? onTimeDeliveries / completedDeliveries : 0;

    const incentives = {
      baseIncentive: completedDeliveries * 15,
      onTimeBonus: onTimeRate >= 0.95 ? completedDeliveries * 10 : 0,
      peakHourBonus: Math.floor(completedDeliveries * 0.3) * 20,
      ratingBonus: 0,
      total: 0,
    };

    incentives.total = Object.values(incentives).reduce(
      (sum, value) => sum + (typeof value === 'number' ? value : 0),
      0,
    ) - incentives.baseIncentive; // Subtract base to avoid double counting
    incentives.total += incentives.baseIncentive;

    return {
      driverId,
      period: { weekStart, weekEnd },
      deliveries: completedDeliveries,
      onTimeRate,
      incentives,
    };
  }

  async generateIncentive(
    driverId: string,
    type: string,
    amount: number,
    description: string,
    referenceId?: string,
  ): Promise<DriverIncentiveEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new Error('Driver not found');
    }

    const incentive = this.incentiveRepo.create({
      driverId,
      type: type as any,
      amount,
      description,
      referenceId,
    });

    return this.incentiveRepo.save(incentive);
  }

  async approveIncentive(incentiveId: string, approverId: string): Promise<DriverIncentiveEntity> {
    const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
    if (!incentive) {
      throw new Error('Incentive not found');
    }

    await this.incentiveRepo.update(incentiveId, {
      status: IncentiveStatus.APPROVED,
      approvedBy: approverId,
      approvedAt: new Date(),
    });

    return this.incentiveRepo.findOne({ where: { id: incentiveId } });
  }

  async markPaid(incentiveId: string, payoutReference: string): Promise<DriverIncentiveEntity> {
    const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
    if (!incentive) {
      throw new Error('Incentive not found');
    }

    await this.incentiveRepo.update(incentiveId, {
      status: IncentiveStatus.PAID,
      payoutReference,
      paidAt: new Date(),
    });

    return this.incentiveRepo.findOne({ where: { id: incentiveId } });
  }

  async getPendingIncentives(driverId?: string): Promise<DriverIncentiveEntity[]> {
    const where: any = { status: IncentiveStatus.APPROVED };
    if (driverId) {
      where.driverId = driverId as any;
    }

    return this.incentiveRepo.find({
      where,
      relations: ['driver'],
      order: { createdAt: 'ASC' },
    });
  }

  async getIncentiveSummary(driverId: string, month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const incentives = await this.incentiveRepo.find({
      where: {
        driverId: driverId as any,
        createdAt: Between(startDate, endDate),
      },
    });

    return {
      driverId,
      period: { month, year },
      totalEarned: incentives
        .filter(i => i.status === IncentiveStatus.PAID)
        .reduce((sum, i) => sum + Number(i.amount), 0),
      pendingAmount: incentives
        .filter(i => i.status === IncentiveStatus.APPROVED)
        .reduce((sum, i) => sum + Number(i.amount), 0),
      totalIncentives: incentives.length,
    };
  }
}