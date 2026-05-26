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
const stripe_1 = require("stripe");
let WebhookService = WebhookService_1 = class WebhookService {
    constructor(configService, webhookRepo) {
        this.configService = configService;
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
        try {
            const result = await this.handleEvent(event);
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
            throw new common_1.InternalServerErrorException(`Webhook processing failed: ${error?.message || error}`);
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
        this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        return { received: true, paymentConfirmed: true };
    }
    async handlePaymentIntentFailed(event) {
        const paymentIntent = event.data.object;
        this.logger.warn(`PaymentIntent ${paymentIntent.id} failed`);
        return { received: true, paymentFailed: true };
    }
    async handleChargeRefunded(event) {
        const charge = event.data.object;
        this.logger.log(`Charge ${charge.id} refunded for ${charge.amount_refunded}`);
        return { received: true, refundProcessed: true };
    }
    async handleChargeRefundUpdated(event) {
        const charge = event.data.object;
        this.logger.log(`Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
        return { received: true, refundUpdated: true };
    }
    async handleDisputeCreated(event) {
        const charge = event.data.object;
        this.logger.warn(`Dispute created for charge ${charge.id}`);
        return { received: true, disputeCreated: true };
    }
    async handleDisputeClosed(event) {
        const dispute = event.data.object;
        this.logger.log(`Dispute closed for charge ${dispute.id}, status: ${dispute.status}`);
        return { received: true, disputeClosed: true };
    }
    async getWebhookStats() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [total, processed] = await Promise.all([
            this.webhookRepo.count(),
            this.webhookRepo.count({ where: { processedAt: (0, typeorm_2.MoreThan)(twentyFourHoursAgo) } }),
        ]);
        return {
            totalWebhooksReceived: total,
            webhooksLast24h: processed,
            failedLast24h: 0,
            duplicateWebhooksLast24h: 0,
        };
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(stripe_webhook_entity_1.StripeWebhookEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map