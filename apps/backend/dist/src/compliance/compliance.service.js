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
var ComplianceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../db/entities/user.entity");
const session_entity_1 = require("../db/entities/session.entity");
const audit_log_entity_1 = require("../db/entities/audit-log.entity");
let ComplianceService = ComplianceService_1 = class ComplianceService {
    constructor(userRepo, sessionRepo, auditLogRepo) {
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
        this.auditLogRepo = auditLogRepo;
        this.logger = new common_1.Logger(ComplianceService_1.name);
    }
    async applyDataRetentionPolicies() {
        try {
            this.logger.log('Starting GDPR data retention policy application');
            const now = new Date();
            const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const deletedSessions = await this.sessionRepo.delete({
                expiresAt: (0, typeorm_2.LessThan)(sessionCutoff),
            });
            this.logger.log(`Deleted ${deletedSessions.affected || 0} expired sessions`);
            const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
            const oldAuditCount = await this.auditLogRepo.count({
                where: { timestamp: (0, typeorm_2.LessThan)(auditCutoff) },
            });
            this.logger.log(`Found ${oldAuditCount} audit logs for archival`);
            this.logger.log('GDPR data retention policy application completed');
        }
        catch (error) {
            this.logger.error('Error applying data retention policies', error);
            throw error;
        }
    }
    async shouldRetainUserData(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['deletedAt'],
        });
        if (!user || !user.deletedAt) {
            return true;
        }
        const retentionPeriodMs = 7 * 365 * 24 * 60 * 60 * 1000;
        const cutoffDate = new Date(user.deletedAt.getTime() + retentionPeriodMs);
        return new Date() < cutoffDate;
    }
    async deleteUserData(userId) {
        await this.userRepo.softDelete(userId);
        await this.sessionRepo.update({ userId }, { isActive: false });
        this.logger.log(`Deleted user data for user ${userId}`);
    }
    async exportUserData(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const orders = [];
        const sessions = await this.sessionRepo.find({
            where: { userId },
        });
        const auditLogs = await this.auditLogRepo.find({
            where: { performedBy: userId },
            take: 1000,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                createdAt: user.createdAt,
            },
            orders,
            sessions: sessions.map(s => ({
                deviceName: s.deviceName,
                deviceType: s.deviceType,
                createdAt: s.createdAt,
            })),
            auditLogs: auditLogs.map(l => ({
                action: l.action,
                timestamp: l.timestamp,
            })),
        };
    }
    async getRetentionStatistics() {
        const now = new Date();
        const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
        const [totalUsers, totalSessions, expiredSessions, oldAuditLogs] = await Promise.all([
            this.userRepo.count(),
            this.sessionRepo.count(),
            this.sessionRepo.count({ where: { expiresAt: (0, typeorm_2.LessThan)(sessionCutoff) } }),
            this.auditLogRepo.count({ where: { timestamp: (0, typeorm_2.LessThan)(auditCutoff) } }),
        ]);
        return {
            retentionPolicies: {
                sessionRetentionDays: 90,
                auditLogRetentionYears: 3,
                userDataRetentionYears: 7,
                orderRetentionYears: 10,
            },
            statistics: {
                totalUsers,
                totalSessions,
                expiredSessions,
                oldAuditLogs,
            },
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = ComplianceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.SessionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map