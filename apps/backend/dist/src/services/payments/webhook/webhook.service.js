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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stripe_webhook_entity_1 = require("../../../db/entities/stripe-webhook.entity");
const payment_event_entity_1 = require("../payment-event.entity");
const order_entity_1 = require("../../../db/entities/order.entity");
const payment_fraud_entity_1 = require("../payment-fraud.entity");
const stripe_1 = require("stripe");
const notification_service_1 = require("../../notifications/notification.service");
const production_notification_service_1 = require("../../notifications/production-notification.service");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(configService, webhookRepo, paymentEventRepo, orderRepo, fraudFlagRepo, notificationService, productionNotification) {
        this.configService = configService;
        this.webhookRepo = webhookRepo;
        this.paymentEventRepo = paymentEventRepo;
        this.orderRepo = orderRepo;
        this.fraudFlagRepo = fraudFlagRepo;
        this.notificationService = notificationService;
        this.productionNotification = productionNotification;
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
            this.logger.error(`Webhook signature verification failed: ${err?.message || err}`);
            throw new common_1.BadRequestException(`Webhook Error: ${err?.message || err}`);
        }
        const existingWebhook = await this.webhookRepo.findOne({
            where: { webhookId: event.id }
        });
        if (existingWebhook) {
            this.logger.warn(`Duplicate webhook received: ${event.id}. Skipping processing.`);
            return { received: true, duplicate: true };
        }
        const existingEvent = await this.paymentEventRepo.findOne({
            where: { orderId: event.data.object?.metadata?.orderId || event.id }
        });
        if (existingEvent?.isProcessed) {
            this.logger.warn(`Already processed event for ${event.id}`);
            return { received: true, alreadyProcessed: true };
        }
        try {
            const result = await this.handleEvent(event);
            await this.paymentEventRepo.save({
                userId: event.data.object?.metadata?.userId || 'unknown',
                orderId: event.data.object?.metadata?.orderId || event.id,
                event: this.mapEventToPaymentEvent(event.type),
                payload: { ...event.data.object, ...result },
                isProcessed: true,
            });
            const webhookRecord = this.webhookRepo.create({
                webhookId: event.id,
                eventType: event.type,
                processedAt: new Date(),
            });
            await this.webhookRepo.save(webhookRecord);
            return { received: true, processed: true };
        }
        catch (error) {
            this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
            await this.paymentEventRepo.save({
                userId: event.data.object?.metadata?.userId || 'unknown',
                orderId: event.data.object?.metadata?.orderId || event.id,
                event: this.mapEventToPaymentEvent(event.type),
                payload: { error: error.message, ...event.data.object },
                isProcessed: false,
            });
            throw new common_1.InternalServerErrorException(`Webhook processing failed: ${error?.message || error}`);
        }
    }
    mapEventToPaymentEvent(eventType) {
        switch (eventType) {
            case 'payment_intent.succeeded': return 'payment_succeeded';
            case 'payment_intent.payment_failed': return 'payment_failed';
            case 'charge.refunded': return 'refund_completed';
            case 'charge.refund.updated': return 'refund_completed';
            default: return 'payment_succeeded';
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
            case 'payment_intent.amount_capturable_updated':
                return await this.handleAmountCapturableUpdated(event);
            case 'charge.expired':
                return await this.handleChargeExpired(event);
            case 'charge.succeeded':
                return await this.handleChargeSucceeded(event);
            default:
                this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
                return { received: true, unhandled: true };
        }
    }
    async handlePaymentIntentSucceeded(event) {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.orderId) {
            const order = await this.orderRepo.findOne({
                where: { id: paymentIntent.metadata.orderId }
            });
            if (order) {
                order.paymentStatus = 'completed';
                await this.orderRepo.save(order);
            }
        }
        await this.productionNotification.sendPaymentNotification(paymentIntent.metadata?.userId || 'system', paymentIntent.id, {
            type: 'payment_success',
            severity: 'low',
            amount: paymentIntent.amount / 100,
            message: `Payment succeeded for ${paymentIntent.amount / 100}`,
        });
        this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        return { received: true, paymentConfirmed: true };
    }
    async handlePaymentIntentFailed(event) {
        const paymentIntent = event.data.object;
        if (paymentIntent.metadata?.orderId) {
            const order = await this.orderRepo.findOne({
                where: { id: paymentIntent.metadata.orderId }
            });
            if (order) {
                order.paymentStatus = 'failed';
                await this.orderRepo.save(order);
            }
        }
        await this.productionNotification.sendPaymentNotification(paymentIntent.metadata?.userId || 'system', paymentIntent.id, {
            type: 'payment_failure',
            severity: 'high',
            amount: paymentIntent.amount / 100,
            message: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
        });
        this.logger.warn(`PaymentIntent ${paymentIntent.id} failed`);
        return { received: true, paymentFailed: true };
    }
    async handleChargeRefunded(event) {
        const charge = event.data.object;
        await this.productionNotification.sendPaymentNotification(charge.metadata?.userId || 'system', charge.payment_intent, {
            type: 'refund_completed',
            severity: 'medium',
            amount: (charge.amount_refunded || 0) / 100,
            message: `Refund completed for ${(charge.amount_refunded || 0) / 100}`,
        });
        this.logger.log(`Charge ${charge.id} refunded for ${charge.amount_refunded}`);
        return { received: true, refundProcessed: true };
    }
    async handleChargeRefundUpdated(event) {
        const charge = event.data.object;
        this.logger.log(`Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
        return { received: true, refundUpdated: true };
    }
    async handleDisputeCreated(event) {
        const dispute = event.data.object;
        this.logger.warn(`Dispute created for charge ${dispute.id}`);
        return { received: true, disputeCreated: true };
    }
    async handleDisputeClosed(event) {
        const dispute = event.data.object;
        this.logger.log(`Dispute closed for charge ${dispute.id}, status: ${dispute.status}`);
        return { received: true, disputeClosed: true };
    }
    async handleAmountCapturableUpdated(event) {
        const paymentIntent = event.data.object;
        this.logger.log(`Amount capturable updated for ${paymentIntent.id}`);
        return { received: true, amountCapturableUpdated: true };
    }
    async handleChargeExpired(event) {
        const charge = event.data.object;
        this.logger.warn(`Charge expired: ${charge.id}`);
        return { received: true, chargeExpired: true };
    }
    async handleChargeSucceeded(event) {
        const charge = event.data.object;
        this.logger.log(`Charge succeeded: ${charge.id}`);
        return { received: true, chargeSucceeded: true };
    }
    async getWebhookStats() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [total, processed, failed, critical] = await Promise.all([
            this.webhookRepo.count(),
            this.webhookRepo.count({ where: { processedAt: (0, typeorm_2.MoreThan)(twentyFourHoursAgo) } }),
            this.paymentEventRepo.count({
                where: {
                    isProcessed: false,
                    createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo)
                }
            }),
            this.fraudFlagRepo.count({
                where: {
                    isBlocked: true,
                    blockedAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo)
                }
            }),
        ]);
        return {
            totalWebhooksReceived: total,
            webhooksLast24h: processed,
            failedLast24h: failed,
            duplicateWebhooksLast24h: 0,
            fraudFlagsLast24h: critical,
        };
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(stripe_webhook_entity_1.StripeWebhookEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_event_entity_1.PaymentEventEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_fraud_entity_1.PaymentFraudFlagEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        production_notification_service_1.ProductionNotificationService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map