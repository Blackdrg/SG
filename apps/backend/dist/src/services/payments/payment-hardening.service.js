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
var PaymentHardeningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHardeningService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const idempotency_entity_1 = require("./idempotency.entity");
const payment_validation_entity_1 = require("./payment-validation.entity");
const stripe_1 = require("stripe");
const audit_service_1 = require("../../audit/audit.service");
let PaymentHardeningService = PaymentHardeningService_1 = class PaymentHardeningService {
    constructor(configService, auditService, idempotencyRepo, validationRepo) {
        this.configService = configService;
        this.auditService = auditService;
        this.idempotencyRepo = idempotencyRepo;
        this.validationRepo = validationRepo;
        this.logger = new common_1.Logger(PaymentHardeningService_1.name);
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY') || 'sk_test_placeholder', {
            apiVersion: '2024-04-10',
        });
    }
    async validatePayment(amount, userId, request) {
        const errors = [];
        const amountValidation = await this.validateAmount(amount, userId);
        if (!amountValidation.valid) {
            errors.push(...amountValidation.errors);
        }
        const limitValidation = await this.validateLimits(amount, userId);
        if (!limitValidation.valid) {
            errors.push(...limitValidation.errors);
        }
        const velocityValidation = await this.validateVelocity(userId, request);
        if (!velocityValidation.valid) {
            errors.push(...velocityValidation.errors);
        }
        if (errors.length > 0) {
            return { valid: false, errors };
        }
        return { valid: true, errors: [] };
    }
    async validateAmount(amount, userId) {
        const errors = [];
        const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
        if (amount > maxSingleAmount) {
            errors.push(`Payment amount exceeds maximum allowed: $${maxSingleAmount}`);
        }
        if (amount <= 0) {
            errors.push('Payment amount must be greater than zero');
        }
        const minAmount = this.configService.get('PAYMENT_MIN_AMOUNT', 1);
        if (amount < minAmount) {
            errors.push(`Payment amount must be at least $${minAmount}`);
        }
        await this.validationRepo.save({
            userId,
            validationType: 'amount_check',
            amount,
            passed: errors.length === 0,
            failureReason: errors.join(', ') || null,
        });
        return { valid: errors.length === 0, errors };
    }
    async validateLimits(amount, userId) {
        const errors = [];
        const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const idem = await this.idempotencyRepo
            .createQueryBuilder('id')
            .select('SUM((id."requestPayload"->>\'amount\')::numeric)', 'total')
            .where('id."userId" = :userId', { userId })
            .andWhere('id."operation" = :op', { op: 'create_payment_intent' })
            .andWhere('id."createdAt" >= :since', { since: todayStart })
            .getRawOne();
        const dailyTotal = (idem?.total || 0) + amount;
        if (dailyTotal > dailyLimit) {
            errors.push(`Daily payment limit exceeded (attempted: $${dailyTotal}, limit: $${dailyLimit})`);
        }
        await this.validationRepo.save({
            userId,
            validationType: 'daily_limit_check',
            amount,
            validationData: { dailyTotal, dailyLimit },
            passed: errors.length === 0,
            failureReason: errors.join(', ') || null,
        });
        return { valid: errors.length === 0, errors };
    }
    async validateVelocity(userId, request) {
        const errors = [];
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const maxPerHour = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);
        const hourlyCount = await this.idempotencyRepo.count({
            where: {
                userId,
                operation: 'create_payment_intent',
                createdAt: (0, typeorm_2.MoreThanOrEqual)(oneHourAgo)
            }
        });
        if (hourlyCount >= maxPerHour) {
            errors.push(`Too many payment attempts (${hourlyCount} in last hour, max: ${maxPerHour})`);
        }
        if (request) {
            const ip = request.ip || request.connection.remoteAddress;
            const ipAttempts = await this.idempotencyRepo
                .createQueryBuilder('id')
                .where('id."metadata"->>\'ip\' = :ip', { ip })
                .andWhere('id."createdAt" >= :since', { since: oneHourAgo })
                .getCount();
            const maxPerIp = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_IP', 5);
            if (ipAttempts >= maxPerIp) {
                errors.push(`Too many attempts from this IP (${ipAttempts} in last hour)`);
            }
        }
        await this.validationRepo.save({
            userId,
            validationType: 'velocity_check',
            validationData: { hourlyCount, maxPerHour },
            passed: errors.length === 0,
            failureReason: errors.join(', ') || null,
        });
        return { valid: errors.length === 0, errors };
    }
    async validateIdempotency(idempotencyKey, operation, userId, requestPayload) {
        if (!idempotencyKey) {
            return { isDuplicate: false };
        }
        const existing = await this.idempotencyRepo.findOne({
            where: { key: idempotencyKey, operation }
        });
        if (existing?.isCompleted) {
            this.logger.warn(`Duplicate request detected: ${operation} with key ${idempotencyKey}`);
            return { isDuplicate: true, existingResponse: existing.responsePayload };
        }
        if (existing && !existing.isCompleted) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            if (existing.createdAt < fiveMinutesAgo) {
                await this.idempotencyRepo.remove(existing);
                return { isDuplicate: false };
            }
            return { isDuplicate: true, existingResponse: existing.responsePayload };
        }
        const newKey = this.idempotencyRepo.create({
            key: idempotencyKey,
            operation,
            userId,
            requestPayload,
            isCompleted: false,
        });
        await this.idempotencyRepo.save(newKey);
        return { isDuplicate: false };
    }
    async completeIdempotency(idempotencyKey, operation, responsePayload, statusCode = 200) {
        await this.idempotencyRepo.update({ key: idempotencyKey, operation }, {
            responsePayload,
            statusCode,
            isCompleted: true,
            completedAt: new Date(),
        });
    }
    async checkFraudRisk(userId, amount, paymentMethodId, request) {
        const reasons = [];
        let riskScore = 0;
        const maxSingleAmount = this.configService.get('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
        if (amount > maxSingleAmount) {
            riskScore += 80;
            reasons.push(`Amount exceeds maximum allowed ($${maxSingleAmount})`);
        }
        if (amount <= 0) {
            riskScore += 100;
            reasons.push('Invalid payment amount');
        }
        const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
        const dailyTransactions = await this.idempotencyRepo.count({
            where: {
                userId,
                operation: 'create_payment_intent',
                createdAt: (0, typeorm_2.MoreThanOrEqual)(new Date(Date.now() - 24 * 60 * 60 * 1000))
            }
        });
        if (dailyTransactions > 10) {
            riskScore += 30;
            reasons.push('High transaction velocity (more than 10 payments in 24h)');
        }
        if (request) {
            const ip = request.ip || request.connection.remoteAddress;
            const ipRequests = await this.idempotencyRepo
                .createQueryBuilder('id')
                .where('id."metadata"->>\'ip\' = :ip', { ip })
                .andWhere('id."createdAt" >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
                .getCount();
            if (ipRequests > 5) {
                riskScore += 25;
                reasons.push('Multiple requests from same IP in 1 hour');
            }
        }
        if (paymentMethodId && paymentMethodId.startsWith('pm_fake')) {
            riskScore += 40;
            reasons.push('Test payment method detected');
        }
        const isBlocked = riskScore >= 70;
        const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
        return { riskScore, isBlocked, reasons, riskLevel };
    }
    async validateCard(paymentMethodId, currency = 'usd') {
        try {
            if (!paymentMethodId) {
                return { valid: false, error: 'Payment method ID is required' };
            }
            const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
            if (paymentMethod.type !== 'card') {
                return { valid: false, error: 'Invalid payment method type' };
            }
            const card = paymentMethod.card;
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            if (card) {
                if (card.exp_year < currentYear ||
                    (card.exp_year === currentYear && card.exp_month < currentMonth)) {
                    return { valid: false, error: 'Card is expired' };
                }
                if (!card.checks?.cvc_check || card.checks.cvc_check === 'fail') {
                    return { valid: false, error: 'CVC verification failed' };
                }
                if (card.funding === 'prepaid') {
                    await this.auditService.log('suspicious_payment_method', null, 'Payment', paymentMethodId, { cardFunding: card.funding, reason: 'Prepaid card funding type' });
                }
            }
            return { valid: true, paymentMethod };
        }
        catch (error) {
            this.logger.error(`Card validation failed: ${error.message}`);
            return { valid: false, error: 'Failed to validate payment method' };
        }
    }
    async validateWebhookSignature(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            this.logger.error('Stripe webhook secret not configured');
            return false;
        }
        try {
            this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.PaymentHardeningService = PaymentHardeningService;
exports.PaymentHardeningService = PaymentHardeningService = PaymentHardeningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(idempotency_entity_1.IdempotencyEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_validation_entity_1.PaymentValidationEventEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_service_1.AuditService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentHardeningService);
//# sourceMappingURL=payment-hardening.service.js.map