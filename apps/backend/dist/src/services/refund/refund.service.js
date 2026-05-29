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
var RefundService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = exports.RefundRequestType = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refund_entity_1 = require("../../db/entities/refund.entity");
const refund_approval_entity_1 = require("../../db/entities/refund-approval.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const payments_service_1 = require("../payments/payments.service");
const notification_service_1 = require("../../notifications/notification.service");
const ledger_service_1 = require("../../modules/ledger/ledger.service");
const production_notification_service_1 = require("../../notifications/production-notification.service");
const config_1 = require("@nestjs/config");
var RefundRequestType;
(function (RefundRequestType) {
    RefundRequestType["CUSTOMER_REQUEST"] = "customer_request";
    RefundRequestType["AGENT_INITIATED"] = "agent_initiated";
    RefundRequestType["POLICY_EXCEPTION"] = "policy_exception";
    RefundRequestType["DISPUTE_RESOLUTION"] = "dispute_resolution";
})(RefundRequestType || (exports.RefundRequestType = RefundRequestType = {}));
let RefundService = RefundService_1 = class RefundService {
    constructor(refundRepo, refundApprovalRepo, orderRepo, userRepo, paymentService, notificationService, ledgerService, productionNotification, configService) {
        this.refundRepo = refundRepo;
        this.refundApprovalRepo = refundApprovalRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
        this.ledgerService = ledgerService;
        this.productionNotification = productionNotification;
        this.configService = configService;
        this.logger = new common_1.Logger(RefundService_1.name);
    }
    async createRefundRequest(orderId, requestedBy, amount, reason, requestType = RefundRequestType.CUSTOMER_REQUEST) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(Order, not, found);
        }
        const user = await this.userRepo.findOne({ where: { id: requestedBy } });
        if (!user && requestedBy !== 'system') {
            throw new common_1.NotFoundException(User, not, found);
        }
        if (!this.isRefundEligible(order)) {
            throw new common_1.BadRequestException(Order, is, not, eligible);
            for (refund;;)
                ;
        }
        if (order.paymentStatus === 'refunded') {
            throw new common_1.BadRequestException(Order, has, already, been, refunded);
        }
        const existingApproval = await this.refundApprovalRepo.findOne({
            where: { orderId, approvalStatus: 'pending' }
        });
        if (existingApproval) {
            throw new common_1.BadRequestException(There, is, already, a, pending, refund, request);
            for (this; order;)
                ;
        }
        const managerApprovalThreshold = this.configService.get('REFUND_MANAGER_APPROVAL_THRESHOLD', 1000);
        const requiresManagerApproval = amount >= managerApprovalThreshold;
        const refundApproval = this.refundApprovalRepo.create({
            orderId,
            refundAmount: amount,
            currency: order.currency || 'USD',
            reason,
            requestedBy,
            requestType,
            approvalStatus: 'pending',
            requiresManagerApproval
        });
        const savedApproval = await this.refundApprovalRepo.save(refundApproval);
        this.logger.log(Created, refund, request);
        for (order;;)
            ;
        await this.notifyRefundRequest(savedApproval);
        return savedApproval;
    }
    async approveRefundRequest(approvalId, approverId, notes) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(Refund, approval, not, found);
        }
        const approver = await this.userRepo.findOne({ where: { id: approverId } });
        if (!approver) {
            throw new common_1.NotFoundException(Approver, not, found);
        }
        if (approval.approvalStatus !== 'pending') {
            throw new common_1.BadRequestException(Refund, request, is, already);
        }
        if (approval.requiresManagerApproval) {
        }
        approval.approvalStatus = 'approved';
        approval.approverId = approverId;
        approval.approvedAt = new Date();
        approval.approvalNotes = notes;
        const savedApproval = await this.refundApprovalRepo.save(approval);
        this.logger.log(Approved, refund, request, by);
        await this.notifyRefundApproval(savedApproval);
        return savedApproval;
    }
    async rejectRefundRequest(approvalId, approverId, reason) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(Refund, approval, not, found);
        }
        const approver = await this.userRepo.findOne({ where: { id: approberId } });
        if (!approver) {
            throw new common_1.NotFoundException(Approver, not, found);
        }
        if (approval.approvalStatus !== 'pending') {
            throw new common_1.BadRequestException(Refund, request, is, already);
        }
        approval.approvalStatus = 'rejected';
        approval.approverId = approberId;
        approval.approvedAt = new Date();
        approval.rejectionReason = reason;
        const savedApproval = await this.refundApprovalRepo.save(approval);
        this.logger.log(Rejected, refund, request, by);
        await this.notifyRefundRejection(savedApproval);
        return savedApproval;
    }
    async processRefund(approvalId, processedBy, gatewayName) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(Refund, approval, not, found);
        }
        const processor = await this.userRepo.findOne({ where: { id: processedBy } });
        if (!processor) {
            throw new common_1.NotFoundException(Processor, not, found);
        }
        if (approval.approvalStatus !== 'approved') {
            throw new common_1.BadRequestException(Refund, request, is, not, approved(current, status));
        }
        if (approval.approvalStatus === 'processed') {
            throw new common_1.BadRequestException(Refund, request, has, already, been, processed);
        }
        const order = await this.orderRepo.findOne({ where: { id: approval.orderId } });
        if (!order) {
            throw new common_1.NotFoundException(Order, not, found);
        }
        if (order.paymentStatus === 'refunded') {
            throw new common_1.BadRequestException(Order, has, already, been, refunded);
        }
        try {
            const paymentRefund = await this.paymentService.refundPayment(order.paymentIntentId || '', approval.refundAmount, order.userId, approval.reason, undefined, gatewayName);
            const refund = this.refundRepo.create({
                orderId: order.id,
                requestedBy: approval.requestedBy,
                requester: await this.userRepo.findOne({ where: { id: approval.requestedBy } }),
                type: this.mapRequestTypeToRefundType(approval.requestType),
                amount: approval.refundAmount,
                status: 'processed',
                reason: approval.reason,
                approvalNotes: approval.approvalNotes,
                approvedBy: approval.approverId,
                approvedAt: approval.approvedAt,
                processedBy: processedBy,
                processedAt: new Date(),
                paymentReference: paymentRefund.id
            });
            const savedRefund = await this.refundRepo.save(refund);
            approval.approvalStatus = 'processed';
            approval.processedBy = processedBy;
            approval.processedAt = new Date();
            await this.refundApprovalRepo.save(approval);
            order.paymentStatus = 'refunded';
            order.updatedAt = new Date();
            await this.orderRepo.save(order);
            try {
                await this.ledgerService.createTransaction(paymentRefund.id, 'refund', 'cash', paymentRefund.amount / 100, order.currency || 'USD', 'refund', paymentRefund.id, Refund, processed);
                for (order, reason; ; )
                    : ;
                ;
            }
            catch (ledgerError) {
                this.logger.error('Failed to create ledger entry for refund:', ledgerError);
            }
            await this.notifyRefundProcessed(savedRefund, order);
            this.logger.log(Processed, refund);
            for (order;;)
                ;
            return { refund: savedRefund, approval };
        }
        catch (error) {
            approval.approvalStatus = 'failed';
            await this.refundApprovalRepo.save(approval);
            this.logger.error(Failed, to, process, refund);
            for (approval; ; )
                : , error;
            ;
            throw new common_1.InternalServerErrorException('Refund processing failed');
        }
    }
    async getRefundRequest(approvalId) {
        const approval = await this.refundApprovalRepo.findOne({
            where: { id: approvalId },
            relations: ['order', 'requester', 'approver']
        });
        if (!approval) {
            throw new common_1.NotFoundException(Refund, approval, not, found);
        }
        return approval;
    }
    async getRefundRequestsForOrder(orderId) {
        return await this.refundApprovalRepo.find({
            where: { orderId },
            relations: ['requester', 'approver'],
            order: { createdAt: 'DESC' }
        });
    }
    async getRefundRequestsByStatus(status) {
        return await this.refundApprovalRepo.find({
            where: { approvalStatus: status },
            relations: ['order', 'requester', 'approver'],
            order: { createdAt: 'DESC' }
        });
    }
    isRefundEligible(order) {
        const refundEligibleStatuses = [
            'delivered',
            'on_the_way',
            'ready',
            'preparing'
        ];
        return refundEligibleStatuses.includes(order.status);
    }
    mapRequestTypeToRefundType(requestType) {
        switch (requestType) {
            case RefundRequestType.CUSTOMER_REQUEST:
                return 'customer_refund';
            case RefundRequestType.AGENT_INITIATED:
                return 'restaurant_penalty';
            case RefundRequestType.POLICY_EXCEPTION:
                return 'customer_refund';
            case RefundRequestType.DISPUTE_RESOLUTION:
                return 'customer_refund';
            default:
                return 'customer_refund';
        }
    }
    async notifyRefundRequest(approval) {
        try {
            await this.productionNotification.sendPaymentNotification('system', 'refund-request-' + approval.id, {
                type: 'refund_initiated',
                severity: 'medium',
                userId: 'system',
                orderId: approval.orderId,
                amount: approval.refundAmount,
                message: New, refund, request, of
            }, { approval, : .refundAmount });
            for (order; .Reason; )
                : ,
                    metadata;
            {
                approvalId: approval.id,
                    requestedBy;
                approval.requestedBy,
                    requestType;
                approval.requestType,
                    requiresManagerApproval;
                approval.requiresManagerApproval;
            }
        }
        finally {
        }
        ;
    }
    catch(error) {
        this.logger.error('Failed to send refund request notification:', error);
    }
};
exports.RefundService = RefundService;
exports.RefundService = RefundService = RefundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(refund_entity_1.RefundEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(refund_approval_entity_1.RefundApprovalEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payments_service_1.PaymentService, typeof (_a = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _a : Object, ledger_service_1.LedgerService, typeof (_b = typeof production_notification_service_1.ProductionNotificationService !== "undefined" && production_notification_service_1.ProductionNotificationService) === "function" ? _b : Object, config_1.ConfigService])
], RefundService);
async;
notifyRefundApproval(approval, refund_approval_entity_1.RefundApprovalEntity);
Promise < void  > {
    try: {
        await, this: .productionNotification.sendPaymentNotification('system', 'refund-approval-' + approval.id, {
            type: 'refund_initiated',
            severity: 'medium',
            userId: 'system',
            orderId: approval.orderId,
            amount: approval.refundAmount,
            message: Refund, request, approved, for: { approval, : .refundAmount }, for: order, : ,
            metadata: {
                approvalId: approval.id,
                approverId: approval.approverId
            }
        })
    }, catch(error) {
        this.logger.error('Failed to send refund approval notification:', error);
    }
};
async;
notifyRefundRejection(approval, refund_approval_entity_1.RefundApprovalEntity);
Promise < void  > {
    try: {
        await, this: .productionNotification.sendPaymentNotification(approval.requestedBy, 'refund-rejection-' + approval.id, {
            type: 'refund_initiated',
            severity: 'medium',
            userId: approval.requestedBy,
            orderId: approval.orderId,
            amount: 0,
            message: Your, refund, request, for: order, : has, been, rejected, : .Reason,
            metadata: {
                approvalId: approval.id,
                rejectionReason: approval.rejectionReason
            }
        })
    }, catch(error) {
        this.logger.error('Failed to send refund rejection notification:', error);
    }
};
async;
notifyRefundProcessed(refund, refund_entity_1.RefundEntity, order, order_entity_1.OrderEntity);
Promise < void  > {
    try: {
        await, this: .productionNotification.sendPaymentNotification(order.userId, 'refund-processed-' + refund.id, {
            type: 'refund_completed',
            severity: 'low',
            userId: order.userId,
            orderId: order.id,
            amount: refund.amount,
            message: Your, refund, of
        }, { refund, : .amount }), for: order, : has, been, processed, : .,
        metadata: {
            refundId: refund.id,
            paymentReference: refund.paymentReference
        }
    }
};
try { }
catch (error) {
    this.logger.error('Failed to send refund processed notification:', error);
}
//# sourceMappingURL=refund.service.js.map