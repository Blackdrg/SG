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
var DriverPayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverPayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
let DriverPayoutService = DriverPayoutService_1 = class DriverPayoutService {
    constructor(incentiveRepo, driverRepo, orderRepo, dataSource) {
        this.incentiveRepo = incentiveRepo;
        this.driverRepo = driverRepo;
        this.orderRepo = orderRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(DriverPayoutService_1.name);
    }
    async calculateWeeklyIncentives(driverId, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const orders = await this.orderRepo.find({
            where: {
                driverId: driverId,
                status: order_interface_1.OrderStatus.DELIVERED,
                createdAt: (0, typeorm_2.Between)(weekStart, weekEnd),
            },
        });
        const completedDeliveries = orders.length;
        const onTimeDeliveries = orders.filter(o => o.status === order_interface_1.OrderStatus.DELIVERED).length;
        const onTimeRate = completedDeliveries > 0 ? onTimeDeliveries / completedDeliveries : 0;
        const incentives = {
            baseIncentive: completedDeliveries * 15,
            onTimeBonus: onTimeRate >= 0.95 ? completedDeliveries * 10 : 0,
            peakHourBonus: Math.floor(completedDeliveries * 0.3) * 20,
            ratingBonus: 0,
            total: 0,
        };
        incentives.total = Object.values(incentives).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0) - incentives.baseIncentive;
        incentives.total += incentives.baseIncentive;
        return {
            driverId,
            period: { weekStart, weekEnd },
            deliveries: completedDeliveries,
            onTimeRate,
            incentives,
        };
    }
    async generateIncentive(driverId, type, amount, description, referenceId) {
        const driver = await this.driverRepo.findOne({ where: { id: driverId } });
        if (!driver) {
            throw new Error('Driver not found');
        }
        const incentive = this.incentiveRepo.create({
            driverId,
            type: type,
            amount,
            description,
            referenceId,
        });
        return this.incentiveRepo.save(incentive);
    }
    async approveIncentive(incentiveId, approverId) {
        const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
        if (!incentive) {
            throw new Error('Incentive not found');
        }
        await this.incentiveRepo.update(incentiveId, {
            status: driver_incentive_entity_1.IncentiveStatus.APPROVED,
            approvedBy: approverId,
            approvedAt: new Date(),
        });
        return this.incentiveRepo.findOne({ where: { id: incentiveId } });
    }
    async markPaid(incentiveId, payoutReference) {
        const incentive = await this.incentiveRepo.findOne({ where: { id: incentiveId } });
        if (!incentive) {
            throw new Error('Incentive not found');
        }
        await this.incentiveRepo.update(incentiveId, {
            status: driver_incentive_entity_1.IncentiveStatus.PAID,
            payoutReference,
            paidAt: new Date(),
        });
        return this.incentiveRepo.findOne({ where: { id: incentiveId } });
    }
    async getPendingIncentives(driverId) {
        const where = { status: driver_incentive_entity_1.IncentiveStatus.APPROVED };
        if (driverId) {
            where.driverId = driverId;
        }
        return this.incentiveRepo.find({
            where,
            relations: ['driver'],
            order: { createdAt: 'ASC' },
        });
    }
    async getIncentiveSummary(driverId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const incentives = await this.incentiveRepo.find({
            where: {
                driverId: driverId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        return {
            driverId,
            period: { month, year },
            totalEarned: incentives
                .filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PAID)
                .reduce((sum, i) => sum + Number(i.amount), 0),
            pendingAmount: incentives
                .filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.APPROVED)
                .reduce((sum, i) => sum + Number(i.amount), 0),
            totalIncentives: incentives.length,
        };
    }
};
exports.DriverPayoutService = DriverPayoutService;
exports.DriverPayoutService = DriverPayoutService = DriverPayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(driver_incentive_entity_1.DriverIncentiveEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(driver_entity_1.DriverEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DriverPayoutService);
//# sourceMappingURL=driver-payout.service.js.map