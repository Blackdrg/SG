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
var PayoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const commission_rule_entity_1 = require("../../db/entities/commission-rule.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
let PayoutService = PayoutService_1 = class PayoutService {
    constructor(payoutRepo, orderRepo, restaurantRepo, commissionRepo, gstRepo, dataSource) {
        this.payoutRepo = payoutRepo;
        this.orderRepo = orderRepo;
        this.restaurantRepo = restaurantRepo;
        this.commissionRepo = commissionRepo;
        this.gstRepo = gstRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PayoutService_1.name);
    }
    async generatePayoutReport(restaurantId, periodStart, periodEnd) {
        const orders = await this.orderRepo.find({
            where: {
                restaurantId: restaurantId,
                status: order_interface_1.OrderStatus.DELIVERED,
                createdAt: (0, typeorm_2.Between)(periodStart, periodEnd),
            },
            relations: ['gstDetail'],
        });
        const grossSales = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
        const commissionRules = await this.commissionRepo.find({
            where: {
                restaurantId: restaurantId,
                status: 'active',
            },
        });
        let platformCommission = grossSales * 0.15;
        if (commissionRules.length > 0) {
            const applicableRule = commissionRules[0];
            if (applicableRule.type === 'percentage') {
                platformCommission = grossSales * (Number(applicableRule.value) / 100);
            }
            else {
                platformCommission = Number(applicableRule.value) * orders.length;
            }
        }
        const gstAmount = orders.reduce((sum, o) => sum + Number(o.gstDetail?.totalGstAmount || 0), 0);
        const netPayout = grossSales - platformCommission - gstAmount;
        const payout = this.payoutRepo.create({
            restaurantId,
            periodStart,
            periodEnd,
            grossSales,
            platformCommission,
            gstAmount,
            cancellationFees: 0,
            incentives: 0,
            penalties: 0,
            netPayout,
            status: payout_report_entity_1.PayoutStatus.PENDING,
            orderBreakdown: {
                totalOrders: orders.length,
                completedOrders: orders.filter(o => o.status === order_interface_1.OrderStatus.DELIVERED).length,
                cancelledOrders: orders.filter(o => o.status === order_interface_1.OrderStatus.CANCELLED).length,
                refundedOrders: orders.filter(o => o.paymentStatus === order_interface_1.PaymentStatus.REFUNDED).length,
            },
            paymentBreakdown: {
                onlinePayments: orders.filter(o => o.paymentStatus === order_interface_1.PaymentStatus.COMPLETED).length,
                codPayments: 0,
                walletPayments: 0,
            },
        });
        return this.payoutRepo.save(payout);
    }
    async getPayoutHistory(restaurantId, limit = 10) {
        return this.payoutRepo.find({
            where: { restaurantId: restaurantId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async processPayout(payoutId, reference) {
        const payout = await this.payoutRepo.findOne({ where: { id: payoutId } });
        if (!payout) {
            throw new Error('Payout not found');
        }
        await this.payoutRepo.update(payoutId, {
            status: payout_report_entity_1.PayoutStatus.PROCESSING,
            payoutReference: reference,
            payoutDate: new Date(),
        });
        return this.payoutRepo.findOne({ where: { id: payoutId } });
    }
    async getPendingPayouts(restaurantId) {
        const where = { status: payout_report_entity_1.PayoutStatus.PENDING };
        if (restaurantId) {
            where.restaurantId = restaurantId;
        }
        return this.payoutRepo.find({
            where,
            relations: ['restaurant'],
            order: { createdAt: 'ASC' },
        });
    }
    async getPayoutSummary(restaurantId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const payouts = await this.payoutRepo.find({
            where: {
                restaurantId: restaurantId,
                periodStart: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        return {
            totalGrossSales: payouts.reduce((sum, p) => sum + Number(p.grossSales), 0),
            totalCommission: payouts.reduce((sum, p) => sum + Number(p.platformCommission), 0),
            totalGST: payouts.reduce((sum, p) => sum + Number(p.gstAmount), 0),
            totalNetPayout: payouts.reduce((sum, p) => sum + Number(p.netPayout), 0),
            pendingPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PENDING).length,
            paidPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PAID).length,
        };
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = PayoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payout_report_entity_1.PayoutReportEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(restaurant_entity_1.RestaurantEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(commission_rule_entity_1.CommissionRuleEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(gst_detail_entity_1.GSTDetailEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PayoutService);
//# sourceMappingURL=payout.service.js.map