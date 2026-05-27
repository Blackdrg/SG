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
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idempotency_entity_1 = require("./idempotency.entity");
let RetryService = RetryService_1 = class RetryService {
    constructor(configService, idempotencyRepo) {
        this.configService = configService;
        this.idempotencyRepo = idempotencyRepo;
        this.logger = new common_1.Logger(RetryService_1.name);
        this.defaultConfig = {
            maxAttempts: 5,
            baseDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
        };
    }
    getConfig(key) {
        const configKey = `PAYMENT_RETRY_${key.toUpperCase()}`;
        return this.configService.get(configKey, this.defaultConfig[key]);
    }
    calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter) {
        const exponentialDelay = baseDelay * Math.pow(multiplier, attempt - 1);
        const cappedDelay = Math.min(exponentialDelay, maxDelay);
        const jitterOffset = cappedDelay * jitter * Math.random();
        return Math.floor(cappedDelay + jitterOffset);
    }
    async executeWithRetry(operation, operationName, context = {}) {
        const maxAttempts = this.getConfig('maxAttempts');
        const baseDelay = this.getConfig('baseDelayMs');
        const maxDelay = this.getConfig('maxDelayMs');
        const multiplier = this.getConfig('backoffMultiplier');
        const jitter = this.getConfig('jitterFactor');
        let lastError;
        let attempts = 0;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            attempts = attempt;
            try {
                const result = await operation();
                return { success: true, result, attempts };
            }
            catch (error) {
                lastError = error;
                const retryableErrors = [
                    'network_error',
                    'timeout',
                    'rate_limit',
                    'service_unavailable',
                    'temporary_failure',
                ];
                const isRetryable = retryableErrors.some(re => lastError.message.toLowerCase().includes(re) ||
                    lastError.type === 'api_connection_error');
                if (!isRetryable || attempt === maxAttempts) {
                    this.logger.error(`Operation ${operationName} failed after ${attempt} attempts: ${lastError.message}`);
                    return { success: false, error: lastError, attempts };
                }
                const delay = this.calculateDelay(attempt, baseDelay, maxDelay, multiplier, jitter);
                this.logger.warn(`Operation ${operationName} failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms: ${lastError.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        return { success: false, error: lastError, attempts };
    }
    async getRetryableFailedPayments() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.idempotencyRepo
            .createQueryBuilder('id')
            .where('id.operation = :op', { op: 'create_payment_intent' })
            .andWhere('id.isCompleted = :completed', { completed: false })
            .andWhere('id.createdAt <= :threshold', { threshold: oneHourAgo })
            .orderBy('id.createdAt', 'ASC')
            .limit(100)
            .getMany();
    }
    async cleanupStaleRetries() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await this.idempotencyRepo
            .createQueryBuilder()
            .delete()
            .where('isCompleted = :completed', { completed: false })
            .andWhere('createdAt <= :threshold', { threshold: twentyFourHoursAgo })
            .execute();
        return result.affected || 0;
    }
    async getRetryStats() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const [pendingRetries, completedRetries, failedRetries, recentCompleted, recentFailed,] = await Promise.all([
            this.idempotencyRepo.count({ where: { isCompleted: false } }),
            this.idempotencyRepo.createQueryBuilder('id')
                .where('id.isCompleted = :completed', { completed: true })
                .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'succeeded' })
                .getCount(),
            this.idempotencyRepo.createQueryBuilder('id')
                .where('id.isCompleted = :completed', { completed: true })
                .andWhere('id."responsePayload"->>\'status\' = :status', { status: 'failed' })
                .getCount(),
            this.idempotencyRepo.count({
                where: {
                    operation: 'create_payment_intent',
                    isCompleted: true,
                    completedAt: (0, typeorm_2.MoreThanOrEqual)(oneHourAgo)
                }
            }),
            this.idempotencyRepo.count({
                where: {
                    operation: 'create_payment_intent',
                    isCompleted: true,
                    createdAt: (0, typeorm_2.MoreThanOrEqual)(oneHourAgo)
                }
            }),
        ]);
        return {
            pendingRetries,
            completedRetries,
            failedRetries,
            retryAttemptsLastHour: recentCompleted + recentFailed,
        };
    }
};
exports.RetryService = RetryService;
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(idempotency_entity_1.IdempotencyEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], RetryService);
//# sourceMappingURL=retry.service.js.map