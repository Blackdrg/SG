import { Repository } from 'typeorm';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { Request } from 'express';
export declare class AuditService {
    private readonly auditLogRepo;
    private readonly logger;
    constructor(auditLogRepo: Repository<AuditLogEntity>);
    log(action: string, performedBy?: string | null, entityType?: string | null, entityId?: string | null, metadata?: any, request?: Request | null): Promise<AuditLogEntity>;
    private sanitizeHeaders;
    logAuthEvent(action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'token_refresh', userId: string | null, email: string | null, success: boolean, request?: Request | null, errorMessage?: string | null): Promise<AuditLogEntity>;
    logPaymentEvent(action: string, userId: string, amount: number, currency: string, paymentProvider: string, transactionId: string | null, success: boolean, request?: Request | null, errorMessage?: string | null): Promise<AuditLogEntity>;
    logWalletEvent(action: string, userId: string, walletId: string, amount: number, currency: string, transactionType: 'credit' | 'debit', balanceAfter: number, request?: Request | null): Promise<AuditLogEntity>;
    getAuditLogs(filters?: {
        userId?: string;
        action?: string;
        entityType?: string;
        entityId?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<AuditLogEntity[]>;
    getAuditStatistics(): Promise<any>;
}
