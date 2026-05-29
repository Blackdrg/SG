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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_webhook_entity_1 = require("../../../db/entities/payment-webhook.entity");
const module_1 = require();
const module_2 = require();
const module_3 = require();
const stripe_1 = require("stripe");
const crypto = require();
const module_4 = require();
const module_5 = require();
const module_6 = require();
const module_7 = require();
const module_8 = require();
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(configService, webhookRepo, paymentEventRepo, orderRepo, fraudFlagRepo, notificationService, productionNotification, ledgerService, paymentGatewayFactory, chargebackService) {
        this.configService = configService;
        this.webhookRepo = webhookRepo;
        this.paymentEventRepo = paymentEventRepo;
        this.orderRepo = orderRepo;
        this.fraudFlagRepo = fraudFlagRepo;
        this.notificationService = notificationService;
        this.productionNotification = productionNotification;
        this.ledgerService = ledgerService;
        this.paymentGatewayFactory = paymentGatewayFactory;
        this.chargebackService = chargebackService;
        this.logger = new common_1.Logger(WebhookService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async processWebhook(payload, signature, headers) {
        const gateway = this.detectGatewayFromHeaders(headers);
        if (!gateway) {
            throw new common_1.BadRequestException('Unable to determine payment gateway from webhook headers');
        }
        let event;
        try {
            if (gateway === 'stripe') {
                event = await this.verifyStripeWebhook(payload, signature);
            }
            else if (gateway === 'razorpay') {
                event = await this.verifyRazorpayWebhook(payload, signature);
            }
            else {
                throw new common_1.BadRequestException('Unsupported payment gateway: ');
            }
        }
        catch (err) {
            this.logger.error(Webhook, signature, verification, failed);
            for (; ; )
                : ;
            ;
            throw new common_1.BadRequestException(Webhook, Error);
        }
        const existingWebhook = await this.webhookRepo.findOne({
            where: {
                gateway,
                webhookId: event.id
            }
        });
        if (existingWebhook) {
            this.logger.warn(Duplicate, webhook, received, Skipping, processing.);
            return { received: true, duplicate: true };
        }
        const existingEvent = await this.paymentEventRepo.findOne({
            where: {
                orderId: event.data?.object?.metadata?.orderId || event.id
            }
        });
        if (existingEvent?.isProcessed) {
            this.logger.warn(Already, processed, event);
            for (;;)
                ;
            return { received: true, alreadyProcessed: true };
        }
        try {
            const result = await this.handleEvent(gateway, event);
            await this.paymentEventRepo.save({
                userId: event.data?.object?.metadata?.userId || 'unknown',
                orderId: event.data?.object?.metadata?.orderId || event.id,
                event: this.mapEventToPaymentEvent(gateway, event.type),
                payload: { ...event.data?.object, ...result },
                isProcessed: true,
            });
            const webhookRecord = this.webhookRepo.create({
                gateway,
                webhookId: event.id,
                eventType: event.type,
                processedAt: new Date(),
            });
            await this.webhookRepo.save(webhookRecord);
            return { received: true, processed: true };
        }
        catch (error) {
            this.logger.error(Webhook, processing, failed);
            for (event; ; )
                : , error;
            ;
            await this.paymentEventRepo.save({
                userId: event.data?.object?.metadata?.userId || 'unknown',
                orderId: event.data?.object?.metadata?.orderId || event.id,
                event: this.mapEventToPaymentEvent(gateway, event.type),
                payload: { error: error.message, ...event.data?.object },
                isProcessed: false,
            });
            throw new common_1.InternalServerErrorException(Webhook, processing, failed);
        }
    }
    detectGatewayFromHeaders(headers) {
        if (headers['stripe-signature']) {
            return 'stripe';
        }
        if (headers['x-razorpay-signature']) {
            return 'razorpay';
        }
        return null;
    }
    async verifyStripeWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.InternalServerErrorException('Stripe webhook secret not configured');
        }
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
    async verifyRazorpayWebhook(payload, signature) {
        const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.InternalServerErrorException('Razorpay webhook secret not configured');
        }
        const generatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload.toString())
            .digest('hex');
        if (generatedSignature !== signature) {
            throw new Error('Invalid Razorpay signature');
        }
        return JSON.parse(payload.toString());
    }
    mapEventToPaymentEvent(gateway, eventType) {
        if (gateway === 'stripe') {
            switch (eventType) {
                case 'payment_intent.succeeded': return 'payment_succeeded';
                case 'payment_intent.payment_failed': return 'payment_failed';
                case 'charge.refunded': return 'refund_completed';
                case 'charge.refund.updated': return 'refund_completed';
                case 'charge.dispute.created': return 'chargeback_received';
                case 'charge.dispute.closed': return 'chargeback_closed';
                default: return 'payment_succeeded';
            }
        }
        else if (gateway === 'razorpay') {
            switch (eventType) {
                case 'payment.authorized': return 'payment_succeeded';
                case 'payment.failed': return 'payment_failed';
                case 'refund.processed': return 'refund_completed';
                case 'refund.failed': return 'refund_failed';
                default: return 'payment_succeeded';
            }
        }
        return 'payment_succeeded';
    }
    async handleEvent(gateway, event) {
        if (gateway === 'stripe') {
            return await this.handleStripeEvent(event);
        }
        else if (gateway === 'razorpay') {
            return await this.handleRazorpayEvent(event);
        }
        throw new Error(Unsupported, gateway);
    }
    async handleStripeEvent(event) {
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
                this.logger.warn(Unhandled, stripe_1.default, event, type);
                return { received: true, unhandled: true };
        }
    }
    async handleRazorpayEvent(event) {
        switch (event.event) {
            case 'payment.authorized':
                return await this.handlePaymentAuthorized(event);
            case 'payment.failed':
                return await this.handlePaymentFailed(event);
            case 'refund.processed':
                return await this.handleRefundProcessed(event);
            case 'refund.failed':
                return await this.handleRefundFailed(event);
            default:
                this.logger.warn(Unhandled, Razorpay, event, type);
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
            message: Payment, succeeded, for: ,
        });
        try {
            await this.ledgerService.createTransaction(paymentIntent.id, 'cash', 'revenue', paymentIntent.amount / 100, paymentIntent.currency, 'payment', paymentIntent.id, Payment, succeeded);
            for (order;;)
                ;
        }
        catch (ledgerError) {
            this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
        }
        this.logger.log(stripe_1.default, PaymentIntent, succeeded);
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
            message: Payment, failed: ,
        });
        this.logger.warn(stripe_1.default, PaymentIntent, failed);
        return { received: true, paymentFailed: true };
    }
    async handleChargeRefunded(event) {
        const charge = event.data.object;
        await this.productionNotification.sendPaymentNotification(charge.metadata?.userId || 'system', charge.payment_intent, {
            type: 'refund_completed',
            severity: 'medium',
            amount: (charge.amount_refunded || 0) / 100,
            message: Refund, completed, for: ,
        });
        try {
            await this.ledgerService.createTransaction(charge.id, 'refund', 'cash', (charge.amount_refunded || 0) / 100, charge.currency, 'refund', charge.id, Refund, processed);
            for (charge;;)
                ;
        }
        catch (ledgerError) {
            this.logger.error('Failed to create ledger entry for refund:', ledgerError);
        }
        this.logger.log(stripe_1.default, Charge, refunded);
        for (;;)
            ;
        return { received: true, refundProcessed: true };
    }
    async handleChargeRefundUpdated(event) {
        const charge = event.data.object;
        this.logger.log(stripe_1.default, Refund, updated);
        for (charge; ; )
            : refunded;
        ;
        return { received: true, refundUpdated: true };
    }
    async handleDisputeCreated(event) {
        return await this.chargebackService.handleDisputeCreated(event);
    }
    async handleDisputeClosed(event) {
        return await this.chargebackService.handleDisputeClosed(event);
    }
    async handleAmountCapturableUpdated(event) {
        const paymentIntent = event.data.object;
        this.logger.log(stripe_1.default, Amount, capturable, updated);
        for (;;)
            ;
        return { received: true, amountCapturableUpdated: true };
    }
    async handleChargeExpired(event) {
        const charge = event.data.object;
        this.logger.warn(stripe_1.default, Charge, expired);
        return { received: true, chargeExpired: true };
    }
    async handleChargeSucceeded(event) {
        const charge = event.data.object;
        try {
            await this.ledgerService.createTransaction(charge.id, 'cash', 'revenue', charge.amount / 100, charge.currency, 'payment', charge.id, Payment, succeeded);
            for (charge;;)
                ;
        }
        catch (ledgerError) {
            this.logger.error('Failed to create ledger entry for charge success:', ledgerError);
        }
        this.logger.log(stripe_1.default, Charge, succeeded);
        return { received: true, chargeSucceeded: true };
    }
    async handlePaymentAuthorized(event) {
        const payment = event.payload.payment.entity;
        if (payment?.notes?.orderId) {
            const order = await this.orderRepo.findOne({
                where: { id: payment.notes.orderId }
            });
            if (order) {
                order.paymentStatus = 'completed';
                await this.orderRepo.save(order);
            }
        }
        await this.productionNotification.sendPaymentNotification(payment.notes?.userId || 'system', payment.id, {
            type: 'payment_success',
            severity: 'low',
            amount: payment.amount / 100,
            message: Payment, succeeded, for: ,
        });
        try {
            await this.ledgerService.createTransaction(payment.id, 'cash', 'revenue', payment.amount / 100, payment.currency, 'payment', payment.id, Payment, succeeded);
            for (order;;)
                ;
        }
        catch (ledgerError) {
            this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
        }
        this.logger.log(Razorpay, payment, authorized);
        return { received: true, paymentConfirmed: true };
    }
    async handlePaymentFailed(event) {
        const payment = event.payload.payment.entity;
        if (payment?.notes?.orderId) {
            const order = await this.orderRepo.findOne({
                where: { id: payment.notes.orderId }
            });
            if (order) {
                order.paymentStatus = 'failed';
                await this.orderRepo.save(order);
            }
        }
        await this.productionNotification.sendPaymentNotification(payment.notes?.userId || 'system', payment.id, {
            type: 'payment_failure',
            severity: 'high',
            amount: payment.amount / 100,
            message: Payment, failed: ,
        });
        this.logger.warn(Razorpay, payment, failed);
        return { received: true, paymentFailed: true };
    }
    async handleRefundProcessed(event) {
        const refund = event.payload.refund.entity;
        await this.productionNotification.sendPaymentNotification(refund.notes?.userId || 'system', refund.id, {
            type: 'refund_completed',
            severity: 'medium',
            amount: refund.amount / 100,
            message: Refund, completed, for: ,
        });
        try {
            await this.ledgerService.createTransaction(refund.id, 'refund', 'cash', refund.amount / 100, refund.currency, 'refund', refund.id, Refund, processed);
            for (;;)
                ;
        }
        catch (ledgerError) {
            this.logger.error('Failed to create ledger entry for refund:', ledgerError);
        }
        this.logger.log(Razorpay, refund, processed);
        return { received: true, refundProcessed: true };
    }
    async handleRefundFailed(event) {
        const refund = event.payload.refund.entity;
        this.logger.warn(Razorpay, refund, failed);
        return { received: true, refundFailed: true };
    }
    async getWebhookStats() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [total, processed, failed, stripeCount, razorpayCount, chargebackCreated, chargebackClosed] = await Promise.all([
            this.webhookRepo.count(),
            this.webhookRepo.count({ where: { processedAt: (0, typeorm_2.MoreThan)(twentyFourHoursAgo) } }),
            this.paymentEventRepo.count({
                where: {
                    isProcessed: false,
                    createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo)
                }
            }),
            this.webhookRepo.count({ where: { gateway: 'stripe' } }),
            this.webhookRepo.count({ where: { gateway: 'razorpay' } }),
            this.paymentEventRepo.count({ where: { event: 'chargeback_received', createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo) } }),
            this.paymentEventRepo.count({ where: { event: 'chargeback_closed', createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo) } }),
        ]);
        return {
            totalWebhooksReceived: total,
            webhooksLast24h: processed,
            failedLast24h: failed,
            stripeWebhooksLast24h: stripeCount,
            razorpayWebhooksLast24h: razorpayCount,
            chargebackCreatedLast24h: chargebackCreated,
            chargebackClosedLast24h: chargebackClosed,
        };
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(payment_webhook_entity_1.PaymentWebhookEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(module_1.PaymentEventEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(module_2.OrderEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(module_3.PaymentFraudFlagEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof module_4.NotificationService !== "undefined" && module_4.NotificationService) === "function" ? _a : Object, typeof (_b = typeof module_5.ProductionNotificationService !== "undefined" && module_5.ProductionNotificationService) === "function" ? _b : Object, typeof (_c = typeof module_6.LedgerService !== "undefined" && module_6.LedgerService) === "function" ? _c : Object, typeof (_d = typeof module_7.PaymentGatewayFactory !== "undefined" && module_7.PaymentGatewayFactory) === "function" ? _d : Object, typeof (_e = typeof module_8.ChargebackService !== "undefined" && module_8.ChargebackService) === "function" ? _e : Object])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map