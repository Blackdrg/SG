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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = exports.RefundRequestType = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refund_entity_1 = require("../../db/entities/refund.entity");
const refund_approval_entity_1 = require("../../db/entities/refund-approval.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const order_interface_1 = require("../../shared/domain/order.interface");
const user_entity_1 = require("../../db/entities/user.entity");
const payments_service_1 = require("../payments/payments.service");
const notification_service_1 = require("../../services/notifications/notification.service");
const ledger_service_1 = require("../../modules/ledger/ledger.service");
const production_notification_service_1 = require("../../services/notifications/production-notification.service");
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
            throw new common_1.NotFoundException(`Order not found: ${orderId}`);
        }
        const user = await this.userRepo.findOne({ where: { id: requestedBy } });
        if (!user && requestedBy !== 'system') {
            throw new common_1.NotFoundException(`User not found: ${requestedBy}`);
        }
        if (!this.isRefundEligible(order)) {
            throw new common_1.BadRequestException('Order is not eligible for refund');
        }
        if (order.paymentStatus === 'refunded') {
            throw new common_1.BadRequestException('Order has already been refunded');
        }
        const existingApproval = await this.refundApprovalRepo.findOne({
            where: { order: { id: orderId }, approvalStatus: 'pending' }
        });
        if (existingApproval) {
            throw new common_1.BadRequestException('There is already a pending refund request for this order');
        }
        const managerApprovalThreshold = this.configService.get('REFUND_MANAGER_APPROVAL_THRESHOLD', 1000);
        const requiresManagerApproval = amount >= managerApprovalThreshold;
        const refundApproval = this.refundApprovalRepo.create({
            order,
            refundAmount: amount,
            currency: 'USD',
            reason,
            requestedBy,
            requestType,
            approvalStatus: 'pending',
            requiresManagerApproval
        });
        const savedApproval = await this.refundApprovalRepo.save(refundApproval);
        this.logger.log(`Created refund request for order ${orderId}`);
        await this.notifyRefundRequest(savedApproval);
        return savedApproval;
    }
    async approveRefundRequest(approvalId, approverId, notes) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
        }
        const approver = await this.userRepo.findOne({ where: { id: approverId } });
        if (!approver) {
            throw new common_1.NotFoundException(`Approver not found: ${approverId}`);
        }
        if (approval.approvalStatus !== 'pending') {
            throw new common_1.BadRequestException(`Refund request is already ${approval.approvalStatus}`);
        }
        if (approval.requiresManagerApproval) {
        }
        approval.approvalStatus = 'approved';
        approval.approverId = approverId;
        approval.approvedAt = new Date();
        approval.approvalNotes = notes;
        const savedApproval = await this.refundApprovalRepo.save(approval);
        this.logger.log(`Approved refund request by ${approverId}`);
        await this.notifyRefundApproval(savedApproval);
        return savedApproval;
    }
    async rejectRefundRequest(approvalId, approverId, reason) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
        }
        const approver = await this.userRepo.findOne({ where: { id: approverId } });
        if (!approver) {
            throw new common_1.NotFoundException(`Approver not found: ${approverId}`);
        }
        if (approval.approvalStatus !== 'pending') {
            throw new common_1.BadRequestException(`Refund request is already ${approval.approvalStatus}`);
        }
        approval.approvalStatus = 'rejected';
        approval.approverId = approverId;
        approval.approvedAt = new Date();
        approval.rejectionReason = reason;
        const savedApproval = await this.refundApprovalRepo.save(approval);
        this.logger.log(`Rejected refund request by ${approverId}`);
        await this.notifyRefundRejection(savedApproval);
        return savedApproval;
    }
    async processRefund(approvalId, processedBy, gatewayName) {
        const approval = await this.refundApprovalRepo.findOne({ where: { id: approvalId } });
        if (!approval) {
            throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
        }
        const processor = await this.userRepo.findOne({ where: { id: processedBy } });
        if (!processor) {
            throw new common_1.NotFoundException(`Processor not found: ${processedBy}`);
        }
        if (approval.approvalStatus === 'processed') {
            throw new common_1.BadRequestException('Refund request has already been processed');
        }
        if (approval.approvalStatus !== 'approved') {
            throw new common_1.BadRequestException(`Refund request is not approved (current status: ${approval.approvalStatus})`);
        }
        const order = await this.orderRepo.findOne({ where: { id: approval.order.id } });
        if (!order) {
            throw new common_1.NotFoundException(`Order not found: ${approval.order.id}`);
        }
        if (order.paymentStatus === 'refunded') {
            throw new common_1.BadRequestException('Order has already been refunded');
        }
        try {
            const paymentRefund = await this.paymentService.refundPayment(order.paymentIntentId || '', approval.refundAmount, order.userId, approval.reason, undefined, gatewayName);
            const requester = await this.userRepo.findOne({ where: { id: approval.requestedBy } });
            if (!requester && approval.requestedBy !== 'system') {
                throw new common_1.NotFoundException(`User not found: ${approval.requestedBy}`);
            }
            const refund = this.refundRepo.create({
                orderId: order.id,
                requestedBy: approval.requestedBy,
                requester: requester,
                type: this.mapRequestTypeToRefundType(approval.requestType),
                amount: approval.refundAmount,
                status: refund_entity_1.RefundStatus.PROCESSED,
                reason: approval.reason,
                approvalNotes: approval.approvalNotes,
                approvedBy: approval.approverId,
                approvedAt: approval.approvedAt,
                processedBy: processedBy,
                processedAt: new Date(),
                paymentReference: paymentRefund.id,
                evidence: {}
            });
            const savedRefund = await this.refundRepo.save(refund);
            approval.approvalStatus = 'processed';
            approval.processedBy = processedBy;
            approval.processedAt = new Date();
            await this.refundApprovalRepo.save(approval);
            order.paymentStatus = order_interface_1.PaymentStatus.REFUNDED;
            order.updatedAt = new Date();
            await this.orderRepo.save(order);
            try {
                await this.ledgerService.createTransaction(paymentRefund.id, 'refund', 'cash', paymentRefund.amount / 100, 'USD', 'refund', paymentRefund.id, `Refund processed for order ${order.id}, reason: ${approval.reason}`);
            }
            catch (ledgerError) {
                this.logger.error('Failed to create ledger entry for refund:', ledgerError);
            }
            await this.notifyRefundProcessed(savedRefund, order);
            this.logger.log(`Processed refund for order ${order.id}`);
            return { refund: savedRefund, approval };
        }
        catch (error) {
            approval.approvalStatus = 'failed';
            await this.refundApprovalRepo.save(approval);
            this.logger.error(`Failed to process refund for approval ${approval.id}:`, error);
            throw new common_1.InternalServerErrorException('Refund processing failed');
        }
    }
    async getRefundRequest(approvalId) {
        const approval = await this.refundApprovalRepo.findOne({
            where: { id: approvalId },
            relations: ['order', 'requester', 'approver']
        });
        if (!approval) {
            throw new common_1.NotFoundException(`Refund approval not found: ${approvalId}`);
        }
        return approval;
    }
    async getRefundRequestsForOrder(orderId) {
        return await this.refundApprovalRepo.find({
            where: { order: { id: orderId } },
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
            await this.productionNotification.sendPaymentNotification('system', order.paymentIntentId || `refund-request-${approval.id}`, {
                type: 'refund_initiated',
                severity: 'medium',
                orderId: approval.order.id,
                amount: approval.refundAmount,
                message: `New refund request of ${approval.refundAmount} for order #${approval.order.id}. Reason: ${approval.reason}`,
                metadata: {
                    approvalId: approval.id,
                    requestedBy: approval.requestedBy,
                    requestType: approval.requestType,
                    requiresManagerApproval: approval.requiresManagerApproval
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to send refund request notification:', error);
        }
    }
    async notifyRefundApproval(approval) {
        try {
            await this.productionNotification.sendPaymentNotification('system', order.paymentIntentId || `refund-approval-${approval.id}`, {
                type: 'refund_initiated',
                severity: 'medium',
                orderId: approval.order.id,
                amount: approval.refundAmount,
                message: `Refund request approved for ${approval.refundAmount} for order #${approval.order.id}`,
                metadata: {
                    approvalId: approval.id,
                    approverId: approval.approverId
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to send refund approval notification:', error);
        }
    }
    async notifyRefundRejection(approval) {
        try {
            await this.productionNotification.sendPaymentNotification(approval.requestedBy, approval.order.paymentIntentId || `refund-rejection-${approval.id}`, {
                type: 'refund_initiated',
                severity: 'medium',
                orderId: approval.order.id,
                amount: 0,
                message: `Your refund request for order #${approval.order.id} has been rejected. Reason: ${approval.rejectionReason}`,
                metadata: {
                    approvalId: approval.id,
                    rejectionReason: approval.rejectionReason
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to send refund rejection notification:', error);
        }
    }
    async notifyRefundProcessed(refund, order) {
        try {
            await this.productionNotification.sendPaymentNotification(order.userId, refund.paymentReference, {
                type: 'refund_completed',
                severity: 'low',
                orderId: order.id,
                amount: refund.amount,
                message: `Your refund of ${refund.amount} for order #${order.id} has been processed.`,
                metadata: {
                    refundId: refund.id,
                    paymentReference: refund.paymentReference
                }
            });
        }
        catch (error) {
            this.logger.error('Failed to send refund processed notification:', error);
        }
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
        payments_service_1.PaymentService,
        notification_service_1.NotificationService,
        ledger_service_1.LedgerService,
        production_notification_service_1.ProductionNotificationService,
        config_1.ConfigService])
], RefundService);
//# sourceMappingURL=refund.service.js.map