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
var WebhookService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const audit_service_1 = require("../../audit/audit.service");
const order_service_1 = require("../../order/order.service");
const wallet_service_1 = require("../../wallet/wallet.service");
const notification_service_1 = require("../../notifications/notification.service");
const typeorm_1 = require("typeorm");
const stripe_webhook_entity_1 = require("../../db/entities/stripe-webhook.entity");
const stripe_1 = require("stripe");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(configService, auditService, orderService, walletService, notificationService, webhookRepo) {
        this.configService = configService;
        this.auditService = auditService;
        this.orderService = orderService;
        this.walletService = walletService;
        this.notificationService = notificationService;
        this.webhookRepo = webhookRepo;
        this.logger = new common_1.Logger(WebhookService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async processWebhook(payload, signature) {
        let event;
        try {
            const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
            if (!webhookSecret) {
                throw new common_1.InternalServerErrorException('Stripe webhook secret not configured');
            }
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err.message}`);
        }
        const existingWebhook = await this.webhookRepo.findOne({
            where: { webhookId: event.id }
        });
        if (existingWebhook) {
            this.logger.warn(`Duplicate webhook received: ${event.id}. Skipping processing.`);
            return { received: true, duplicate: true };
        }
        try {
            const result = await this.handleEvent(event);
            const webhookRecord = this.webhookRepo.create({
                webhookId: event.id,
                eventType: event.type,
                processedAt: new Date(),
            });
            await this.webhookRepo.save(webhookRecord);
            await this.auditService.logPaymentEvent('webhook_processed', event.data.object?.metadata?.userId || 'unknown', event.data.object?.amount ? event.data.object.amount / 100 : 0, event.data.object?.currency || 'usd', 'stripe', event.id, true, null);
            return { received: true, processed: true };
        }
        catch (error) {
            this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
            await this.auditService.logPaymentEvent('webhook_failed', event.data.object?.metadata?.userId || 'unknown', event.data.object?.amount ? event.data.object.amount / 100 : 0, event.data.object?.currency || 'usd', 'stripe', event.id, false, null, error.message);
            throw new common_1.InternalServerErrorException(`Webhook processing failed: ${error.message}`);
        }
    }
    async handleEvent(event) {
        switch (event.type) {
            case 'payment_intent.succeeded':
                return await this.handlePaymentIntentSucceeded(event);
            case 'payment_intent.payment_failed':
                return await this.handlePaymentIntentFailed(event);
            case 'charge.refunded':
                return await this.handleChargeRefunded(event);
            case 'charge.refund.updated':
                return await this.handleChargeRefundUpdated(event);
            case 'charge.dispute.created':
                return await this.handleDisputeCreated(event);
            case 'charge.dispute.closed':
                return await this.handleDisputeClosed(event);
            default:
                this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
                return { received: true, unhandled: true };
        }
    }
    async handlePaymentIntentSucceeded(event) {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const orderId = paymentIntent.metadata?.orderId;
        if (!userId || !orderId) {
            this.logger.warn(`PaymentIntent ${paymentIntent.id} missing metadata (userId or orderId)`);
            return { received: true, missingMetadata: true };
        }
        try {
            await this.orderService.confirmPayment(orderId, paymentIntent.id);
            await this.notificationService.sendPush(userId, 'Payment Successful', `Your payment of $${paymentIntent.amount / 100} was successful.`, { orderId });
            return { received: true, paymentConfirmed: true };
        }
        catch (error) {
            this.logger.error(`Failed to confirm payment for order ${orderId}:`, error);
            throw error;
        }
    }
    async handlePaymentIntentFailed(event) {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const orderId = paymentIntent.metadata?.orderId;
        if (!userId || !orderId) {
            this.logger.warn(`PaymentIntent ${paymentIntent.id} missing metadata (userId or orderId)`);
            return { received: true, missingMetadata: true };
        }
        try {
            const order = await this.orderService.getOrderWithLock(orderId);
            if (order.paymentIntentId !== paymentIntent.id) {
                this.logger.warn(`PaymentIntent mismatch for order ${orderId}`);
                return { received: true, mismatch: true };
            }
            order.paymentStatus = 'failed';
            order.updatedAt = new Date();
            await this.notificationService.sendPush(userId, 'Payment Failed', `Your payment of $${paymentIntent.amount / 100} failed. Please try again.`, { orderId });
            return { received: true, paymentFailed: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle payment failure for order ${orderId}:`, error);
            throw error;
        }
    }
    async handleChargeRefunded(event) {
        const charge = event.data.object;
        const userId = charge.metadata?.userId;
        const orderId = charge.metadata?.orderId;
        const refundId = event.data.object?.refund?.id;
        if (!userId || !orderId) {
            this.logger.warn(`Charge ${charge.id} missing metadata (userId or orderId)`);
            return { received: true, missingMetadata: true };
        }
        try {
            await this.notificationService.sendPush(userId, 'Refund Processed', `A refund of $${charge.amount_refunded / 100} has been processed for order #${orderId}.`, { orderId });
            return { received: true, refundProcessed: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle refund for order ${orderId}:`, error);
            throw error;
        }
    }
    async handleChargeRefundUpdated(event) {
        const charge = event.data.object;
        this.logger.info(`Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
        return { received: true, refundUpdated: true };
    }
    async handleDisputeCreated(event) {
        const charge = event.data.object;
        const userId = charge.metadata?.userId;
        const orderId = charge.metadata?.orderId;
        if (!userId || !orderId) {
            this.logger.warn(`Dispute charge ${charge.id} missing metadata`);
            return { received: true, missingMetadata: true };
        }
        try {
            await this.notificationService.sendPush(userId, 'Payment Disputed', `A dispute has been filed on your payment for order #${orderId}. We are reviewing it.`, { orderId });
            await this.auditService.logPaymentEvent('dispute_created', userId, charge.amount / 100, charge.currency, 'stripe', charge.id, false, null, `Dispute created: ${event.data.object.reason}`);
            return { received: true, disputeCreated: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle dispute for order ${orderId}:`, error);
            throw error;
        }
    }
    async handleDisputeClosed(event) {
        const charge = event.data.object;
        const userId = charge.metadata?.userId;
        const orderId = charge.metadata?.orderId;
        if (!userId || !orderId) {
            this.logger.warn(`Dispute charge ${charge.id} missing metadata`);
            return { received: true, missingMetadata: true };
        }
        try {
            const dispute = event.data.object;
            let message = '';
            if (dispute.status === 'won') {
                message = `Your dispute for order #${orderId} was resolved in your favor.`;
            }
            else if (dispute.status === 'lost') {
                message = `Your dispute for order #${orderId} was resolved against you.`;
            }
            else {
                message = `Your dispute for order #${orderId} has been closed.`;
            }
            await this.notificationService.sendPush(userId, 'Dispute Resolved', message, { orderId });
            return { received: true, disputeClosed: true };
        }
        catch (error) {
            this.logger.error(`Failed to handle dispute closure for order ${orderId}:`, error);
            throw error;
        }
    }
    async getWebhookStats() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [total, processed, failed, duplicates] = await Promise.all([
            this.webhookRepo.count(),
            this.webhookRepo.count({ where: { processedAt: (0, typeorm_1.MoreThan)(twentyFourHoursAgo) } }),
            this.webhookRepo.count({ where: { processedAt: (0, typeorm_1.MoreThan)(twentyFourHoursAgo) } }),
            0
        ]);
        return {
            totalWebhooksReceived: total,
            webhooksLast24h: processed,
            failedLast24h: failed,
            duplicateWebhooksLast24h: duplicates,
        };
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, InjectRepository(stripe_webhook_entity_1.StripeWebhookEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof audit_service_1.AuditService !== "undefined" && audit_service_1.AuditService) === "function" ? _a : Object, order_service_1.OrderService,
        wallet_service_1.WalletService,
        notification_service_1.NotificationService,
        typeorm_1.Repository])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map