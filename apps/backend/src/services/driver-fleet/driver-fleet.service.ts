import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { DriverShiftEntity, DriverShiftStatus } from '../../db/entities/driver-shift.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DriverPenaltyEntity, DriverPenaltyType, DriverPenaltyStatus } from '../../db/entities/driver-penalty.entity';
import { DriverIncentiveEntity, IncentiveType, IncentiveStatus } from '../../db/entities/driver-incentive.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';

@Injectable()
export class DriverFleetService {
  private readonly logger = new Logger(DriverFleetService.name);

  constructor(
    @InjectRepository(DriverEntity) private driverRepo: Repository<DriverEntity>,
    @InjectRepository(DriverShiftEntity) private shiftRepo: Repository<DriverShiftEntity>,
    @InjectRepository(DriverScoreEntity) private scoreRepo: Repository<DriverScoreEntity>,
    @InjectRepository(DriverPenaltyEntity) private penaltyRepo: Repository<DriverPenaltyEntity>,
    @InjectRepository(DriverIncentiveEntity) private incentiveRepo: Repository<DriverIncentiveEntity>,
    @InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>,
    @InjectRepository(DriverAssignmentEntity) private assignmentRepo: Repository<DriverAssignmentEntity>,
    private dataSource: DataSource,
  ) {}

  async startShift(driverId: string): Promise<DriverShiftEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');
    if (driver.kycStatus !== 'approved') throw new BadRequestException('KYC not approved');

    const activeShift = await this.shiftRepo.findOne({
      where: { driverId, status: DriverShiftStatus.ACTIVE } as any,
    });
    if (activeShift) throw new BadRequestException('Already has an active shift');

    const shift = this.shiftRepo.create({
      driverId,
      startTime: new Date(),
      status: DriverShiftStatus.ACTIVE,
    });
    return this.shiftRepo.save(shift);
  }

  async endShift(driverId: string, shiftId: string): Promise<DriverShiftEntity> {
    const shift = await this.shiftRepo.findOne({ where: { id: shiftId, driverId } });
    if (!shift) throw new NotFoundException('Shift not found');
    if (shift.status !== DriverShiftStatus.ACTIVE) throw new BadRequestException('Shift is not active');

    const endTime = new Date();
    const hours = (endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
    shift.endTime = endTime;
    shift.status = DriverShiftStatus.COMPLETED;
    shift.totalHours = Math.round(hours * 100) / 100;
    return this.shiftRepo.save(shift);
  }

  async getShifts(driverId: string, limit = 20): Promise<DriverShiftEntity[]> {
    return this.shiftRepo.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getEarnings(driverId: string, period: { start: Date; end: Date }): Promise<any> {
    const earnings = await this.shiftRepo.find({
      where: {
        driverId,
        status: DriverShiftStatus.COMPLETED,
        startTime: Between(period.start, period.end),
      } as any,
      order: { startTime: 'DESC' },
    });

    const totalEarnings = earnings.reduce((s, e) => s + Number(e.totalEarnings || 0), 0);
    const totalDeliveries = earnings.reduce((s, e) => s + (e.totalDeliveries || 0), 0);
    const totalHours = earnings.reduce((s, e) => s + Number(e.totalHours || 0), 0);
    const totalDistance = earnings.reduce((s, e) => s + Number(e.totalDistance || 0), 0);

    const incentives = await this.incentiveRepo.find({
      where: { driverId, status: IncentiveStatus.PAID },
    });
    const totalIncentives = incentives.reduce((s, i) => s + Number(i.amount || 0), 0);

    return {
      driverId,
      period,
      shiftEarnings: totalEarnings,
      incentives: totalIncentives,
      penalties: 0,
      netEarnings: totalEarnings + totalIncentives,
      totalDeliveries,
      totalHours,
      totalDistance,
      avgEarningsPerHour: totalHours > 0 ? Math.round((totalEarnings / totalHours) * 100) / 100 : 0,
      shifts: earnings,
    };
  }

  async calculateIncentives(driverId: string): Promise<any> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');

    const score = await this.scoreRepo.findOne({
      where: { driver: { id: driverId } } as any,
      order: { createdAt: 'DESC' },
    });

    let bonusAmount = 0;
    const bonuses: any[] = [];

    if (score && score.customerRating >= 4.5) {
      const amount = Math.round(score.totalDeliveries * 5);
      bonusAmount += amount;
      bonuses.push({ type: 'Excellent Rating', amount, reason: `Rating ${score.customerRating}` });
    }
    if (score && score.onTimeDeliveryRate >= 0.95) {
      const amount = Math.round(score.totalDeliveries * 3);
      bonusAmount += amount;
      bonuses.push({ type: 'On Time Bonus', amount, reason: `${Math.round(score.onTimeDeliveryRate * 100)}% on-time` });
    }
    if (score && score.acceptanceRate >= 0.9) {
      const amount = Math.round(score.totalDeliveries * 2);
      bonusAmount += amount;
      bonuses.push({ type: 'High Acceptance Bonus', amount, reason: `${Math.round(score.acceptanceRate * 100)}% acceptance` });
    }
    if (score && score.cancellationRate <= 0.05) {
      bonusAmount += 100;
      bonuses.push({ type: 'Low Cancellation Bonus', amount: 100, reason: 'Excellent reliability' });
    }

    return { driverId, score, bonuses, totalBonus: bonusAmount };
  }

  async issuePenalty(driverId: string, data: any): Promise<DriverPenaltyEntity> {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver not found');

    const penalty = this.penaltyRepo.create({
      driverId,
      type: data.type || DriverPenaltyType.LATE_PICKUP,
      amount: data.amount || 0,
      orderId: data.orderId,
      description: data.description || '',
      status: DriverPenaltyStatus.ISSUED,
      issuedBy: data.issuedBy,
    });
    return this.penaltyRepo.save(penalty);
  }

  async getPerformanceRanking(driverId?: string): Promise<any> {
    let query = this.scoreRepo.createQueryBuilder('score');
    if (driverId) {
      query = query.where('score.driverId = :driverId', { driverId });
    }
    const scores = await query
      .orderBy('score.overallScore', 'DESC')
      .limit(50)
      .getMany();

    const rankings = scores.map((s, idx) => ({
      rank: idx + 1,
      driverId: (s.driver as any).id,
      overallScore: s.overallScore,
      onTimeRate: s.onTimeDeliveryRate,
      acceptanceRate: s.acceptanceRate,
      cancellationRate: s.cancellationRate,
      customerRating: s.customerRating,
      totalDeliveries: s.totalDeliveries,
    }));

    const driverRank = driverId ? rankings.findIndex(r => r.driverId === driverId) + 1 : null;
    return {
      rankings,
      totalDrivers: rankings.length,
      driverRank,
      percentile: driverRank ? Math.round((1 - driverRank / rankings.length) * 100) : null,
    };
  }

  async getDriverSchedule(driverId: string, days = 14): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const shifts = await this.shiftRepo.find({
      where: {
        driverId,
        startTime: Between(startDate, endDate),
      } as any,
      order: { startTime: 'DESC' },
    });

    const upcoming = shifts.filter(s => s.status === DriverShiftStatus.SCHEDULED || s.status === DriverShiftStatus.ACTIVE);
    const past = shifts.filter(s => s.status === DriverShiftStatus.COMPLETED || s.status === DriverShiftStatus.CANCELLED);
    return { upcoming, past, totalShifts: past.length + upcoming.length };
  }

  async approvePenalty(penaltyId: string, approvedBy: string): Promise<DriverPenaltyEntity> {
    const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
    if (!penalty) throw new NotFoundException('Penalty not found');
    penalty.status = DriverPenaltyStatus.PENDING;
    return this.penaltyRepo.save(penalty);
  }

  async waivePenalty(penaltyId: string, waivedBy: string, reason: string): Promise<DriverPenaltyEntity> {
    const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
    if (!penalty) throw new NotFoundException('Penalty not found');
    penalty.status = DriverPenaltyStatus.WAIVED;
    penalty.waivedBy = waivedBy;
    penalty.waivedAt = new Date();
    penalty.waiverReason = reason;
    return this.penaltyRepo.save(penalty);
  }

  async getPenalties(driverId: string): Promise<DriverPenaltyEntity[]> {
    return this.penaltyRepo.find({
      where: { driverId },
      order: { createdAt: 'DESC' },
    });
  }
}
