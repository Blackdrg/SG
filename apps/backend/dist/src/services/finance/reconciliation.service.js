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
var ReconciliationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const wallet_transaction_entity_1 = require("../../db/entities/wallet-transaction.entity");
const payout_report_entity_1 = require("../../db/entities/payout-report.entity");
const driver_incentive_entity_1 = require("../../db/entities/driver-incentive.entity");
const gst_detail_entity_1 = require("../../db/entities/gst-detail.entity");
let ReconciliationService = ReconciliationService_1 = class ReconciliationService {
    constructor(orderRepo, transactionRepo, payoutRepo, incentiveRepo, gstRepo, dataSource) {
        this.orderRepo = orderRepo;
        this.transactionRepo = transactionRepo;
        this.payoutRepo = payoutRepo;
        this.incentiveRepo = incentiveRepo;
        this.gstRepo = gstRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ReconciliationService_1.name);
    }
    async reconcilePayments(startDate, endDate) {
        const orders = await this.orderRepo.find({
            where: { createdAt: (0, typeorm_2.Between)(startDate, endDate) },
        });
        const transactions = await this.transactionRepo.find({
            where: { createdAt: (0, typeorm_2.Between)(startDate, endDate) },
        });
        const ordersTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
        const transactionsTotal = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const discrepancies = [];
        for (const order of orders) {
            const relatedTxns = transactions.filter(t => t.referenceId === order.id || t.description.includes(order.id));
            const orderTotal = Number(order.grandTotal);
            const txnTotal = relatedTxns.reduce((sum, t) => sum + Number(t.amount), 0);
            if (Math.abs(orderTotal - txnTotal) > 1) {
                discrepancies.push({
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    expected: orderTotal,
                    actual: txnTotal,
                    difference: orderTotal - txnTotal,
                });
            }
        }
        return {
            period: { startDate, endDate },
            totalOrders: orders.length,
            totalTransactions: transactions.length,
            ordersTotal,
            transactionsTotal,
            discrepancies: discrepancies.length,
            discrepancyDetails: discrepancies.slice(0, 20),
            matchRate: discrepancies.length ? ((orders.length - discrepancies.length) / orders.length) * 100 : 100,
        };
    }
    async reconcilePayouts(restaurantId, startDate, endDate) {
        const payouts = await this.payoutRepo.find({
            where: {
                restaurantId: restaurantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const orders = await this.orderRepo.find({
            where: {
                restaurantId: restaurantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const orderTotal = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
        const payoutTotal = payouts.reduce((sum, p) => sum + Number(p.netPayout), 0);
        return {
            restaurantId,
            period: { startDate, endDate },
            orderTotal,
            payoutTotal,
            payoutsGenerated: payouts.length,
            paidPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PAID).length,
            pendingPayouts: payouts.filter(p => p.status === payout_report_entity_1.PayoutStatus.PENDING).length,
            variance: orderTotal - payoutTotal,
        };
    }
    async reconcileDriverPayments(driverId, startDate, endDate) {
        const incentives = await this.incentiveRepo.find({
            where: {
                driverId: driverId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const pendingIncentives = incentives.filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PENDING);
        const paidIncentives = incentives.filter(i => i.status === driver_incentive_entity_1.IncentiveStatus.PAID);
        const pendingTotal = pendingIncentives.reduce((sum, i) => sum + Number(i.amount), 0);
        const paidTotal = paidIncentives.reduce((sum, i) => sum + Number(i.amount), 0);
        return {
            driverId,
            period: { startDate, endDate },
            pendingIncentivesTotal: pendingTotal,
            paidIncentivesTotal: paidTotal,
            pendingCount: pendingIncentives.length,
            paidCount: paidIncentives.length,
        };
    }
    async getGSTReconciliation(restaurantId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const orders = await this.orderRepo.find({
            where: {
                restaurantId: restaurantId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['gstDetail'],
        });
        const gstDetails = orders.filter(o => o.gstDetail).map(o => o.gstDetail);
        return {
            restaurantId,
            period: { month, year },
            totalTaxableValue: gstDetails.reduce((sum, g) => sum + Number(g.taxableValue), 0),
            totalCGST: gstDetails.reduce((sum, g) => sum + Number(g.cgstAmount), 0),
            totalSGST: gstDetails.reduce((sum, g) => sum + Number(g.sgstAmount), 0),
            totalIGST: gstDetails.reduce((sum, g) => sum + Number(g.igstAmount), 0),
            invoicesGenerated: orders.length,
        };
    }
    async runFullReconciliation(dateRange) {
        const [paymentRecon, payoutRecon] = await Promise.all([
            this.reconcilePayments(dateRange.start, dateRange.end),
            this.reconcileDriverPayments('', dateRange.start, dateRange.end),
        ]);
        return {
            paymentReconciliation: paymentRecon,
            payoutReconciliation: payoutRecon,
            overallStatus: this.calculateOverallStatus(paymentRecon, payoutRecon),
        };
    }
    calculateOverallStatus(payment, payout) {
        const paymentMatch = payment.matchRate >= 95;
        const payoutPending = payout.pendingCount === 0;
        if (paymentMatch && payoutPending)
            return 'healthy';
        if (paymentMatch)
            return 'warning';
        return 'critical';
    }
};
exports.ReconciliationService = ReconciliationService;
exports.ReconciliationService = ReconciliationService = ReconciliationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payout_report_entity_1.PayoutReportEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(driver_incentive_entity_1.DriverIncentiveEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(gst_detail_entity_1.GSTDetailEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ReconciliationService);
//# sourceMappingURL=reconciliation.service.js.map