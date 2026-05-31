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
var WebhookRetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRetryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_retry_queue_entity_1 = require("../../../db/entities/webhook-retry-queue.entity");
let WebhookRetryService = WebhookRetryService_1 = class WebhookRetryService {
    constructor(retryRepo) {
        this.retryRepo = retryRepo;
        this.logger = new common_1.Logger(WebhookRetryService_1.name);
    }
    async enqueueWebhook(webhookId, gateway, eventType, payload, maxAttempts = 5) {
        const job = this.retryRepo.create({
            webhookId,
            gateway,
            eventType,
            payload,
            attempt: 0,
            maxAttempts,
            status: 'pending',
            scheduledAt: new Date(),
        });
        return await this.retryRepo.save(job);
    }
    async getNextJob() {
        const now = new Date();
        const job = await this.retryRepo.findOne({
            where: {
                status: 'pending',
                scheduledAt: (0, typeorm_2.LessThan)(now),
            },
            order: { scheduledAt: 'ASC' },
        });
        if (!job)
            return null;
        await this.retryRepo.update(job.id, { status: 'processing' });
        return {
            webhookId: job.webhookId,
            gateway: job.gateway,
            eventType: job.eventType,
            payload: job.payload,
            attempt: job.attempt + 1,
            maxAttempts: job.maxAttempts,
        };
    }
    async success(jobId) {
        await this.retryRepo.update(jobId, { status: 'succeeded', processedAt: new Date() });
    }
    async fail(jobId, error) {
        const job = await this.retryRepo.findOne({ where: { id: jobId } });
        if (!job)
            return;
        const nextAttempt = job.attempt + 1;
        const delay = this.calculateDelay(nextAttempt);
        if (nextAttempt >= job.maxAttempts) {
            await this.retryRepo.update(jobId, {
                status: 'discarded',
                lastError: error,
                processedAt: new Date(),
            });
            this.logger.error(`Webhook ${job.webhookId} discarded after ${job.maxAttempts} attempts: ${error}`);
        }
        else {
            const nextScheduled = new Date(Date.now() + delay);
            await this.retryRepo.update(jobId, {
                status: 'pending',
                attempt: nextAttempt,
                scheduledAt: nextScheduled,
                lastError: error,
            });
            this.logger.warn(`Webhook ${job.webhookId} retry scheduled for attempt ${nextAttempt}/${job.maxAttempts}`);
        }
    }
    calculateDelay(attempt) {
        const baseDelay = 60000;
        const delay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = delay * 0.1 * Math.random();
        return Math.min(delay + jitter, 1800000);
    }
    async getStats() {
        const [pending, processing, succeeded, failed, discarded] = await Promise.all([
            this.retryRepo.count({ where: { status: 'pending' } }),
            this.retryRepo.count({ where: { status: 'processing' } }),
            this.retryRepo.count({ where: { status: 'succeeded' } }),
            this.retryRepo.count({
                where: {
                    status: (0, typeorm_2.In)(['pending', 'processing']),
                    attempt: (0, typeorm_2.MoreThan)(0),
                }
            }),
            this.retryRepo.count({ where: { status: 'discarded' } }),
        ]);
        return {
            pending,
            processing,
            succeeded,
            retrying: failed,
            discarded,
        };
    }
    async processRetryQueue() {
        const job = await this.getNextJob();
        if (!job)
            return;
        this.logger.log(`Processing webhook retry ${job.webhookId} (attempt ${job.attempt})`);
    }
};
exports.WebhookRetryService = WebhookRetryService;
exports.WebhookRetryService = WebhookRetryService = WebhookRetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_retry_queue_entity_1.WebhookRetryQueueEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WebhookRetryService);
//# sourceMappingURL=webhook-retry.service.js.map