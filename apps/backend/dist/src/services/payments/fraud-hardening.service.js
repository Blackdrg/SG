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
var FraudHardeningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudHardeningService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_fraud_entity_1 = require("./payment-fraud.entity");
const audit_service_1 = require("../../audit/audit.service");
let FraudHardeningService = FraudHardeningService_1 = class FraudHardeningService {
    constructor(configService, auditService, fraudFlagRepo) {
        this.configService = configService;
        this.auditService = auditService;
        this.fraudFlagRepo = fraudFlagRepo;
        this.logger = new common_1.Logger(FraudHardeningService_1.name);
    }
    async checkPaymentFraud(context) {
        const reasons = [];
        let riskScore = 0;
        const velocityCheck = await this.checkVelocity(context.userId, context.amount);
        if (!velocityCheck.allowed) {
            riskScore += velocityCheck.riskScore;
            reasons.push(...velocityCheck.reasons);
        }
        const patternCheck = await this.checkSuspiciousPatterns(context);
        if (!patternCheck.allowed) {
            riskScore += patternCheck.riskScore;
            reasons.push(...patternCheck.reasons);
        }
        const blockThreshold = this.configService.get('PAYMENT_FRAUD_BLOCK_THRESHOLD', 70);
        const allowed = riskScore < blockThreshold;
        if (!allowed) {
            await this.flagFraudulentActivity({
                ...context,
                riskScore,
                reasons,
            });
        }
        return { allowed, riskScore, reasons };
    }
    async checkVelocity(userId, amount) {
        const reasons = [];
        let riskScore = 0;
        const hourlyTransactions = await this.fraudFlagRepo.count({
            where: {
                userId,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(new Date(Date.now() - 60 * 60 * 1000))
            }
        });
        const dailyLimit = this.configService.get('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
        const maxTransactionsPerHour = this.configService.get('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);
        if (hourlyTransactions > maxTransactionsPerHour) {
            riskScore += 20;
            reasons.push(`High transaction velocity (${hourlyTransactions} transactions in last hour)`);
        }
        const recentAmount = await this.fraudFlagRepo
            .createQueryBuilder('f')
            .select('SUM(f.amount)', 'total')
            .where('f.userId = :userId', { userId })
            .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
            .getRawOne();
        const dailyTotal = Number(recentAmount?.total || 0) + amount;
        if (dailyTotal > dailyLimit) {
            riskScore += 40;
            reasons.push(`Daily limit exceeded ($${dailyTotal} > $${dailyLimit})`);
        }
        return { allowed: riskScore < 70, riskScore, reasons };
    }
    async checkSuspiciousPatterns(context) {
        const reasons = [];
        let riskScore = 0;
        const ipCheck = await this.checkIpReputation(context.ipAddress);
        if (ipCheck) {
            riskScore += 15;
            reasons.push('Suspicious IP address detected');
        }
        if (context.cardInfo?.funding === 'prepaid') {
            riskScore += 10;
            reasons.push('Prepaid card detected');
        }
        if (context.amount && context.amount <= this.configService.get('PAYMENT_MIN_AMOUNT', 5)) {
            const smallAmountCount = await this.fraudFlagRepo
                .createQueryBuilder('f')
                .where('f.userId = :userId', { userId: context.userId })
                .andWhere('f.amount = :amount', { amount: context.amount })
                .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
                .getCount();
            if (smallAmountCount > 5) {
                riskScore += 30;
                reasons.push('Potential card testing with small amounts');
            }
        }
        return { allowed: riskScore < 70, riskScore, reasons };
    }
    async checkIpReputation(ipAddress) {
        if (!ipAddress)
            return false;
        const suspiciousPatterns = [
            '10.',
            '192.168.',
            '172.16.',
        ];
        return suspiciousPatterns.some(pattern => ipAddress.startsWith(pattern));
    }
    async flagFraudulentActivity(data) {
        const flag = this.fraudFlagRepo.create({
            userId: data.userId,
            paymentIntentId: data.paymentIntentId,
            orderId: data.orderId,
            flagType: this.determineFlagType(data.riskScore, data.reasons),
            amount: data.amount,
            riskScore: data.riskScore,
            evidence: {
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                ...data.cardInfo,
            },
            isBlocked: data.riskScore >= 70,
            blockedAt: data.riskScore >= 70 ? new Date() : undefined,
        });
        const saved = await this.fraudFlagRepo.save(flag);
        if (data.riskScore >= 50) {
            await this.auditService.log('fraud_flag_raised', data.userId, 'Payment', data.paymentIntentId, {
                riskScore: data.riskScore,
                reasons: data.reasons,
                flagType: flag.flagType,
            });
        }
        return saved;
    }
    determineFlagType(riskScore, reasons) {
        const reasonsStr = reasons.join(' ').toLowerCase();
        if (reasonsStr.includes('velocity') || reasonsStr.includes('transactions')) {
            return 'velocity_abuse';
        }
        if (reasonsStr.includes('testing') || reasonsStr.includes('small amount')) {
            return 'card_testing';
        }
        if (reasonsStr.includes('prepaid')) {
            return 'high_risk_card';
        }
        if (reasonsStr.includes('ip')) {
            return 'suspicious_pattern';
        }
        return 'other';
    }
    async isUserBlocked(userId) {
        const recentBlock = await this.fraudFlagRepo.findOne({
            where: {
                userId,
                isBlocked: true,
                blockedAt: (0, typeorm_2.MoreThanOrEqual)(new Date(Date.now() - 60 * 60 * 1000))
            }
        });
        return !!recentBlock;
    }
    async getFraudHistory(userId, limit = 50) {
        return this.fraudFlagRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getFraudStats() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalFlags, blockedUsers, recentFlags, weeklyFlags] = await Promise.all([
            this.fraudFlagRepo.count(),
            this.fraudFlagRepo
                .createQueryBuilder('f')
                .select('COUNT(DISTINCT f.userId)', 'count')
                .where('f.isBlocked = :blocked', { blocked: true })
                .andWhere('f.blockedAt >= :since', { since: twentyFourHoursAgo })
                .getRawOne()
                .then(r => Number(r?.count || 0)),
            this.fraudFlagRepo.count({
                where: { createdAt: (0, typeorm_2.MoreThanOrEqual)(twentyFourHoursAgo) }
            }),
            this.fraudFlagRepo.count({
                where: { createdAt: (0, typeorm_2.MoreThanOrEqual)(sevenDaysAgo) }
            }),
        ]);
        return {
            totalFraudFlags: totalFlags,
            blockedUsersLast24h: blockedUsers,
            fraudFlagsLast24h: recentFlags,
            fraudFlagsLast7d: weeklyFlags,
        };
    }
};
exports.FraudHardeningService = FraudHardeningService;
exports.FraudHardeningService = FraudHardeningService = FraudHardeningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(payment_fraud_entity_1.PaymentFraudFlagEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        audit_service_1.AuditService,
        typeorm_2.Repository])
], FraudHardeningService);
//# sourceMappingURL=fraud-hardening.service.js.map