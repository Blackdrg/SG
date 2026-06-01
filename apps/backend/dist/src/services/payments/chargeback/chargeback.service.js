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
var ChargebackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargebackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_dispute_entity_1 = require("../../../db/entities/payment-dispute.entity");
const order_entity_1 = require("../../../db/entities/order.entity");
const user_entity_1 = require("../../../db/entities/user.entity");
const notification_service_1 = require("../../../services/notifications/notification.service");
const production_notification_service_1 = require("../../../services/notifications/production-notification.service");
const stripe_1 = require("stripe");
let ChargebackService = ChargebackService_1 = class ChargebackService {
    constructor(configService, disputeRepo, orderRepo, userRepo, notificationService, productionNotification) {
        this.configService = configService;
        this.disputeRepo = disputeRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.notificationService = notificationService;
        this.productionNotification = productionNotification;
        this.logger = new common_1.Logger(ChargebackService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async handleDisputeCreated(event) {
        try {
            const dispute = event.data.object;
            const charge = await this.stripe.charges.retrieve(typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id);
            const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
            const order = paymentIntentId ? await this.orderRepo.findOne({
                where: { paymentIntentId: paymentIntentId }
            }) : null;
            if (!order) {
                this.logger.warn(`Order not found for payment intent ${paymentIntentId || 'unknown'}`);
            }
            const existingDispute = await this.disputeRepo.findOne({
                where: { disputeId: dispute.id }
            });
            if (existingDispute) {
                this.logger.warn(`Dispute ${dispute.id} already exists in our system`);
                return existingDispute;
            }
            const paymentDispute = this.disputeRepo.create({
                disputeId: dispute.id,
                orderId: order ? order.id : null,
                order: order,
                disputeType: dispute.reason,
                disputedAmount: dispute.amount / 100,
                currency: dispute.currency,
                reason: dispute.reason,
                evidence: dispute.evidence || {},
                status: this.mapStripeDisputeStatus(dispute.status),
            });
            const savedDispute = await this.disputeRepo.save(paymentDispute);
            if (order) {
                await this.productionNotification.sendPaymentNotification(order.userId, dispute.id, {
                    type: 'fraud_detected',
                    severity: 'high',
                    orderId: order.id,
                    amount: dispute.amount / 100,
                    message: `Chargeback received for amount ${(dispute.amount / 100).toFixed(2)}. Reason: ${dispute.reason}`,
                    metadata: {
                        disputeId: dispute.id,
                        stripeDisputeReason: dispute.reason,
                    }
                });
            }
            this.logger.log(`Created dispute record for Stripe dispute ${dispute.id}`);
            return savedDispute;
        }
        catch (error) {
            this.logger.error(`Failed to handle dispute created:`, error);
            throw new common_1.InternalServerErrorException('Failed to process dispute');
        }
    }
    async handleDisputeClosed(event) {
        try {
            const dispute = event.data.object;
            const paymentDispute = await this.disputeRepo.findOne({
                where: { disputeId: dispute.id }
            });
            if (!paymentDispute) {
                this.logger.warn(`Dispute ${dispute.id} not found in our system`);
                throw new common_1.NotFoundException(`Dispute ${dispute.id} not found`);
            }
            paymentDispute.status = this.mapStripeDisputeStatus(dispute.status);
            paymentDispute.chargedBackAmount = dispute.chargeback_amount ? dispute.chargeback_amount / 100 : null;
            paymentDispute.chargedBackAt = dispute.chargeback_at ? new Date(dispute.chargeback_at * 1000) : null;
            if (dispute.status === 'won' && paymentDispute.isRefundedToCustomer === false) {
                this.logger.log(`Dispute ${dispute.id} was won, considering customer refund`);
            }
            const updatedDispute = await this.disputeRepo.save(paymentDispute);
            const order = paymentDispute.orderId ?
                await this.orderRepo.findOne({ where: { id: paymentDispute.orderId } }) :
                null;
            if (order) {
                await this.productionNotification.sendPaymentNotification(order.userId, `chargeback-resolution-${dispute.id}`, {
                    type: dispute.status === 'won' ? 'payment_success' : 'payment_failure',
                    severity: dispute.status === 'won' ? 'medium' : 'high',
                    orderId: order.id,
                    amount: paymentDispute.disputedAmount,
                    message: `Chargeback ${dispute.id}: ${dispute.status}`,
                    metadata: {
                        disputeId: dispute.id,
                        stripeDisputeStatus: dispute.status,
                        chargedBackAmount: paymentDispute.chargedBackAmount
                    }
                });
            }
            this.logger.log(`Updated dispute record for Stripe dispute ${dispute.id} with status ${dispute.status}`);
            return updatedDispute;
        }
        catch (error) {
            this.logger.error(`Failed to handle dispute closed:`, error);
            throw new common_1.InternalServerErrorException('Failed to process dispute closure');
        }
    }
    async getDisputeById(disputeId) {
        const dispute = await this.disputeRepo.findOne({
            where: { disputeId: disputeId },
            relations: ['order']
        });
        if (!dispute) {
            throw new common_1.NotFoundException(`Dispute ${disputeId} not found`);
        }
        return dispute;
    }
    async getDisputesForOrder(orderId) {
        return await this.disputeRepo.find({
            where: { orderId: orderId },
            order: { createdAt: 'DESC' }
        });
    }
    async getDisputesByStatus(status) {
        return await this.disputeRepo.find({
            where: { status: status },
            order: { createdAt: 'DESC' }
        });
    }
    mapStripeDisputeStatus(stripeStatus) {
        switch (stripeStatus) {
            case 'warning':
                return 'warning';
            case 'needs_response':
                return 'needs_response';
            case 'under_review':
                return 'under_review';
            case 'won':
                return 'won';
            case 'lost':
                return 'lost';
            default:
                return 'under_review';
        }
    }
    async getDisputeStats(startDate, endDate) {
        const where = {};
        if (startDate && endDate) {
            where.createdAt = (0, typeorm_2.MoreThanOrEqual)(startDate);
            if (endDate) {
                where.createdAt = (0, typeorm_2.LessThanOrEqual)(endDate);
            }
        }
        const [totalDisputes, wonDisputes, lostDisputes, underReviewDisputes, needsResponseDisputes, warningDisputes, totalDisputedAmount, totalChargedBackAmount] = await Promise.all([
            this.disputeRepo.count({ where }),
            this.disputeRepo.count({ where: { ...where, status: 'won' } }),
            this.disputeRepo.count({ where: { ...where, status: 'lost' } }),
            this.disputeRepo.count({ where: { ...where, status: 'under_review' } }),
            this.disputeRepo.count({ where: { ...where, status: 'needs_response' } }),
            this.disputeRepo.count({ where: { ...where, status: 'warning' } }),
            this.disputeRepo
                .createQueryBuilder('dispute')
                .select('SUM(dispute.disputedAmount)', 'total')
                .where(where)
                .getRawOne(),
            this.disputeRepo
                .createQueryBuilder('dispute')
                .select('SUM(dispute.chargedBackAmount)', 'total')
                .where({ ...where, chargedBackAmount: (0, typeorm_2.MoreThanOrEqual)(0) })
                .getRawOne(),
        ]);
        return {
            totalDisputes,
            wonDisputes,
            lostDisputes,
            underReviewDisputes,
            needsResponseDisputes,
            warningDisputes,
            winRate: totalDisputes > 0 ? (wonDisputes / totalDisputes) * 100 : 0,
            totalDisputedAmount: totalDisputedAmount?.total || 0,
            totalChargedBackAmount: totalChargedBackAmount?.total || 0,
            netLoss: (totalChargedBackAmount?.total || 0) - (totalDisputedAmount?.total || 0)
        };
    }
};
exports.ChargebackService = ChargebackService;
exports.ChargebackService = ChargebackService = ChargebackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(payment_dispute_entity_1.PaymentDisputeEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        production_notification_service_1.ProductionNotificationService])
], ChargebackService);
//# sourceMappingURL=chargeback.service.js.map