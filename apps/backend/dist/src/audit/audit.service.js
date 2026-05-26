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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../db/entities/audit-log.entity");
let AuditService = AuditService_1 = class AuditService {
    constructor(auditLogRepo) {
        this.auditLogRepo = auditLogRepo;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async log(action, performedBy = null, entityType = null, entityId = null, metadata = {}, request = null) {
        try {
            const auditLog = this.auditLogRepo.create({
                action,
                performedBy: performedBy ?? null,
                entityType: entityType ?? null,
                entityId: entityId ?? null,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString(),
                    ...(request ? {
                        ip: request.ip || request.connection.remoteAddress,
                        userAgent: request.get('User-Agent'),
                        method: request.method,
                        path: request.path,
                        query: request.query,
                        headers: this.sanitizeHeaders(request.headers)
                    } : {})
                },
                ipAddress: request ? (request.ip || request.connection.remoteAddress) : null
            });
            const savedLog = await this.auditLogRepo.save(auditLog);
            this.logger.log(`Audit Log: ${action} by ${performedBy || 'system'} on ${entityType} ${entityId || ''}`);
            return savedLog;
        }
        catch (error) {
            this.logger.error('Failed to create audit log', error);
            return {
                id: 'error-log',
                action,
                performedBy: performedBy ?? null,
                entityType: entityType ?? null,
                entityId: entityId ?? null,
                metadata: { error: error.message },
                timestamp: new Date(),
                ipAddress: request ? (request.ip || request.connection.remoteAddress) : null
            };
        }
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token',
            'proxy-authorization'
        ];
        for (const header of sensitiveHeaders) {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    async logAuthEvent(action, userId = null, email = null, success, request = null, errorMessage = null) {
        return this.log(action, userId ?? null, 'User', userId ?? null, {
            email: email ?? null,
            success,
            errorMessage: errorMessage ?? null,
            authEvent: true
        }, request);
    }
    async logPaymentEvent(action, userId, amount, currency, paymentProvider, transactionId = null, success, request = null, errorMessage = null) {
        return this.log(action, userId, 'Payment', transactionId ?? null, {
            amount,
            currency,
            paymentProvider,
            success,
            errorMessage: errorMessage ?? null,
            paymentEvent: true
        }, request);
    }
    async logWalletEvent(action, userId, walletId, amount, currency, transactionType, balanceAfter, request = null) {
        return this.log(action, userId, 'Wallet', walletId, {
            amount,
            currency,
            transactionType,
            balanceAfter,
            walletEvent: true
        }, request);
    }
    async getAuditLogs(filters = {}) {
        const where = {};
        if (filters.userId) {
            where.performedBy = filters.userId;
        }
        if (filters.action) {
            where.action = filters.action;
        }
        if (filters.entityType) {
            where.entityType = filters.entityType;
        }
        if (filters.entityId) {
            where.entityId = filters.entityId;
        }
        if (filters.startDate) {
            where.timestamp = (0, typeorm_2.MoreThan)(filters.startDate);
        }
        if (filters.endDate) {
            if (where.timestamp) {
                where.timestamp = { ...where.timestamp, LessThan: filters.endDate };
            }
            else {
                where.timestamp = (0, typeorm_2.LessThan)(filters.endDate);
            }
        }
        return this.auditLogRepo.find({
            where,
            order: { timestamp: 'DESC' },
            take: filters.limit ?? 100,
            skip: filters.offset ?? 0
        });
    }
    async getAuditStatistics() {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const [totalLogs, recentLogs, failedLogins, successfulLogins] = await Promise.all([
            this.auditLogRepo.count(),
            this.auditLogRepo.count({ where: { timestamp: (0, typeorm_2.MoreThan)(twentyFourHoursAgo) } }),
            this.auditLogRepo.count({
                where: {
                    action: 'login_failure',
                    timestamp: (0, typeorm_2.MoreThan)(twentyFourHoursAgo)
                }
            }),
            this.auditLogRepo.count({
                where: {
                    action: 'login_success',
                    timestamp: (0, typeorm_2.MoreThan)(twentyFourHoursAgo)
                }
            })
        ]);
        return {
            totalAuditLogs: totalLogs,
            auditLogsLast24h: recentLogs,
            failedLoginAttempts24h: failedLogins,
            successfulLogins24h: successfulLogins,
            loginSuccessRate24h: recentLogs > 0
                ? (successfulLogins / recentLogs) * 100
                : 0
        };
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map