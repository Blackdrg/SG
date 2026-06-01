"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DriverFleetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverFleetService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_entity_1 = require("../../db/entities/driver.entity");
const driver_shift_entity_1 = require("../../db/entities/driver-shift.entity");
const driver_score_entity_1 = require("../../db/entities/driver-score.entity");
const driver_penalty_entity_1 = require("../../db/entities/driver-penalty.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const driver_assignment_entity_1 = require("../../db/entities/driver-assignment.entity");
let DriverFleetService = DriverFleetService_1 = class DriverFleetService {
    constructor(driverRepo, shiftRepo, scoreRepo, penaltyRepo, incentiveRepo, orderRepo, assignmentRepo, dataSource) {
        this.driverRepo = driverRepo;
        this.shiftRepo = shiftRepo;
        this.scoreRepo = scoreRepo;
        this.penaltyRepo = penaltyRepo;
        this.incentiveRepo = incentiveRepo;
        this.orderRepo = orderRepo;
        this.assignmentRepo = assignmentRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DriverFleetService_1.name);
    }
    async startShift(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        if (driver.kycStatus !== 'approved')
            throw new common_1.BadRequestException('KYC not approved');
        const activeShift = await this.shiftRepo.findOne({
            where: { driverId, status: driver_shift_entity_1.DriverShiftStatus.ACTIVE },
        });
        if (activeShift)
            throw new common_1.BadRequestException('Already has an active shift');
        const shift = this.shiftRepo.create({
            driverId,
            startTime: new Date(),
            status: driver_shift_entity_1.DriverShiftStatus.ACTIVE,
        });
        return this.shiftRepo.save(shift);
    }
    async endShift(driverId, shiftId) {
        const shift = await this.shiftRepo.findOne({ where: { id: shiftId, driverId } });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        if (shift.status !== driver_shift_entity_1.DriverShiftStatus.ACTIVE)
            throw new common_1.BadRequestException('Shift is not active');
        const endTime = new Date();
        const hours = (endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60);
        shift.endTime = endTime;
        shift.status = driver_shift_entity_1.DriverShiftStatus.COMPLETED;
        shift.totalHours = Math.round(hours * 100) / 100;
        return this.shiftRepo.save(shift);
    }
    async getShifts(driverId, limit = 20) {
        return this.shiftRepo.find({
            where: { driverId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getEarnings(driverId, period) {
        const earnings = await this.shiftRepo.find({
            where: {
                driverId,
                status: driver_shift_entity_1.DriverShiftStatus.COMPLETED,
                startTime: (0, typeorm_2.Between)(period.start, period.end),
            },
            order: { startTime: 'DESC' },
        });
        const totalEarnings = earnings.reduce((s, e) => s + Number(e.totalEarnings || 0), 0);
        const totalDeliveries = earnings.reduce((s, e) => s + (e.totalDeliveries || 0), 0);
        const totalHours = earnings.reduce((s, e) => s + Number(e.totalHours || 0), 0);
        const totalDistance = earnings.reduce((s, e) => s + Number(e.totalDistance || 0), 0);
        const incentives = await this.incentiveRepo.find({
            where: { driverId, status: driver_incentive_entity_1.IncentiveStatus.PAID },
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
    async calculateIncentives(driverId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const score = await this.scoreRepo.findOne({
            where: { driver: { id: driverId } },
            order: { createdAt: 'DESC' },
        });
        let bonusAmount = 0;
        const bonuses = [];
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
    async issuePenalty(driverId, data) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const penalty = this.penaltyRepo.create({
            driverId,
            type: data.type || driver_penalty_entity_1.DriverPenaltyType.LATE_PICKUP,
            amount: data.amount || 0,
            orderId: data.orderId,
            description: data.description || '',
            status: driver_penalty_entity_1.DriverPenaltyStatus.ISSUED,
            issuedBy: data.issuedBy,
        });
        return this.penaltyRepo.save(penalty);
    }
    async getPerformanceRanking(driverId) {
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
            driverId: s.driver.id,
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
    async getDriverSchedule(driverId, days = 14) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        const shifts = await this.shiftRepo.find({
            where: {
                driverId,
                startTime: (0, typeorm_2.Between)(startDate, endDate),
            },
            order: { startTime: 'DESC' },
        });
        const upcoming = shifts.filter(s => s.status === driver_shift_entity_1.DriverShiftStatus.SCHEDULED || s.status === driver_shift_entity_1.DriverShiftStatus.ACTIVE);
        const past = shifts.filter(s => s.status === driver_shift_entity_1.DriverShiftStatus.COMPLETED || s.status === driver_shift_entity_1.DriverShiftStatus.CANCELLED);
        return { upcoming, past, totalShifts: past.length + upcoming.length };
    }
    async approvePenalty(penaltyId, approvedBy) {
        const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
        if (!penalty)
            throw new common_1.NotFoundException('Penalty not found');
        penalty.status = driver_penalty_entity_1.DriverPenaltyStatus.PENDING;
        return this.penaltyRepo.save(penalty);
    }
    async waivePenalty(penaltyId, waivedBy, reason) {
        const penalty = await this.penaltyRepo.findOne({ where: { id: penaltyId } });
        if (!penalty)
            throw new common_1.NotFoundException('Penalty not found');
        penalty.status = driver_penalty_entity_1.DriverPenaltyStatus.WAIVED;
        penalty.waivedBy = waivedBy;
        penalty.waivedAt = new Date();
        penalty.waiverReason = reason;
        return this.penaltyRepo.save(penalty);
    }
    async getPenalties(driverId) {
        return this.penaltyRepo.find({
            where: { driverId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.DriverFleetService = DriverFleetService;
exports.DriverFleetService = DriverFleetService = DriverFleetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_shift_entity_1.DriverShiftEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(driver_score_entity_1.DriverScoreEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_penalty_entity_1.DriverPenaltyEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(driver_incentive_entity_1.DriverIncentiveEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(driver_assignment_entity_1.DriverAssignmentEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DriverFleetService);
//# sourceMappingURL=driver-fleet.service.js.map