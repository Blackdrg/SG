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
var CustomerSupportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSupportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dispute_entity_1 = require("../../db/entities/dispute.entity");
const refund_entity_1 = require("../../db/entities/refund.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const wallet_service_1 = require("../wallet/wallet.service");
const payments_service_1 = require("../payments/payments.service");
let CustomerSupportService = CustomerSupportService_1 = class CustomerSupportService {
    constructor(disputeRepo, refundRepo, orderRepo, walletService, paymentService, dataSource) {
        this.disputeRepo = disputeRepo;
        this.refundRepo = refundRepo;
        this.orderRepo = orderRepo;
        this.walletService = walletService;
        this.paymentService = paymentService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CustomerSupportService_1.name);
    }
    async raiseDispute(orderId, customerId, type, description, evidence) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const existingDispute = await this.disputeRepo.findOne({
            where: { orderId: orderId, status: dispute_entity_1.DisputeStatus.RAISED },
        });
        if (existingDispute) {
            throw new common_1.BadRequestException('Dispute already exists for this order');
        }
        const dispute = this.disputeRepo.create({
            orderId,
            customerId,
            restaurantId: order.restaurantId,
            driverId: order.driverId,
            type,
            description,
            evidence: evidence || {},
        });
        return this.disputeRepo.save(dispute);
    }
    async getDisputes(filter) {
        const where = {};
        if (filter?.status)
            where.status = filter.status;
        if (filter?.customerId)
            where.customerId = filter.customerId;
        if (filter?.restaurantId)
            where.restaurantId = filter.restaurantId;
        if (filter?.driverId)
            where.driverId = filter.driverId;
        return this.disputeRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async reviewDispute(disputeId, reviewerId, status, notes, creditAmount) {
        const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        await this.disputeRepo.update(disputeId, {
            status,
            resolutionNotes: notes,
            resolvedBy: reviewerId,
            resolvedAt: new Date(),
            creditAmount: creditAmount || dispute.creditAmount,
        });
        if (status === dispute_entity_1.DisputeStatus.RESOLVED_CREDIT || status === dispute_entity_1.DisputeStatus.RESOLVED_REFUND) {
            await this.initiateRefund(disputeId, reviewerId, creditAmount || 0, status);
        }
        return this.disputeRepo.findOne({ where: { id: disputeId } });
    }
    async initiateRefund(disputeId, initiatedBy, amount, disputeStatus) {
        const dispute = await this.disputeRepo.findOne({ where: { id: disputeId } });
        const refund = this.refundRepo.create({
            orderId: dispute.orderId,
            requestedBy: initiatedBy,
            type: disputeStatus === dispute_entity_1.DisputeStatus.RESOLVED_CREDIT
                ? refund_entity_1.RefundType.CUSTOMER_REFUND
                : refund_entity_1.RefundType.RESTAURANT_PENALTY,
            amount,
            status: refund_entity_1.RefundStatus.PROCESSED,
            approvalNotes: `Auto-approved via dispute resolution`,
            approvedBy: initiatedBy,
            approvedAt: new Date(),
        });
        await this.refundRepo.save(refund);
    }
    async requestRefund(orderId, requestedBy, type, amount, reason, evidence) {
        const refund = this.refundRepo.create({
            orderId,
            requestedBy,
            type,
            amount,
            reason,
            evidence: evidence || {},
        });
        return this.refundRepo.save(refund);
    }
    async processRefund(refundId, processedBy, paymentReference) {
        const refund = await this.refundRepo.findOne({ where: { id: refundId } });
        if (!refund) {
            throw new common_1.NotFoundException('Refund not found');
        }
        const order = await this.orderRepo.findOne({ where: { id: refund.orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        await this.refundRepo.update(refundId, {
            status: refund_entity_1.RefundStatus.PROCESSED,
            processedBy,
            processedAt: new Date(),
            paymentReference,
        });
        await this.walletService.creditWallet(order.userId, refund.amount, `Refund for order #${order.orderNumber}: ${refund.reason}`);
        return this.refundRepo.findOne({ where: { id: refundId } });
    }
    async getRefunds(filter) {
        const where = {};
        if (filter?.status)
            where.status = filter.status;
        if (filter?.orderId)
            where.orderId = filter.orderId;
        return this.refundRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async getDisputeStats(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.createdAt = (0, typeorm_2.Between)(startDate, endDate);
        }
        const [totalDisputes, resolvedCredit, resolvedRefund, avgResolutionTime,] = await Promise.all([
            this.disputeRepo.count({ where }),
            this.disputeRepo.count({ where: { ...where, status: dispute_entity_1.DisputeStatus.RESOLVED_CREDIT } }),
            this.disputeRepo.count({ where: { ...where, status: dispute_entity_1.DisputeStatus.RESOLVED_REFUND } }),
            this.getAverageResolutionTime(where),
        ]);
        return {
            totalDisputes,
            creditDisputes: resolvedCredit,
            refundDisputes: resolvedRefund,
            avgResolutionHours: avgResolutionTime,
        };
    }
    async getAverageResolutionTime(where) {
        const result = await this.disputeRepo
            .createQueryBuilder('dispute')
            .select('AVG(TIMESTAMPDIFF(HOUR, dispute.createdAt, dispute.resolvedAt))', 'avgHours')
            .where('dispute.resolvedAt IS NOT NULL')
            .getRawOne();
        return result?.avgHours || 0;
    }
};
exports.CustomerSupportService = CustomerSupportService;
exports.CustomerSupportService = CustomerSupportService = CustomerSupportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dispute_entity_1.DisputeEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(refund_entity_1.RefundEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        wallet_service_1.WalletService,
        payments_service_1.PaymentService,
        typeorm_2.DataSource])
], CustomerSupportService);
//# sourceMappingURL=customer-support.service.js.map