import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
import { Request } from 'express';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Log an audit event with enhanced security information
   * @param action The action being performed
   * @param performedBy The user or system performing the action
   * @param entityType The type of entity being acted upon
   * @param entityId The ID of the entity being acted upon
   * @param metadata Additional metadata about the action
   * @param request The Express request object (for IP, user agent, etc.)
   */
  async log(
    action: string,
    performedBy: string | null = null,
    entityType: string | null = null,
    entityId: string | null = null,
    metadata: any = {},
    request: Request | null = null
  ): Promise<AuditLogEntity> {
    try {
      const auditLog = this.auditLogRepo.create({
        action,
        performedBy: performedBy ?? null,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          // Add request information if available
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
      
      // Log to console as well for immediate visibility
      this.logger.log(`Audit Log: ${action} by ${performedBy || 'system'} on ${entityType} ${entityId || ''}`);
      
      return savedLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      // Don't throw - audit logging failures shouldn't break the application
      // Return a minimal log entry for tracking
      return {
        id: 'error-log',
        action,
        performedBy: performedBy ?? null,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        metadata: { error: (error as Error).message },
        timestamp: new Date(),
        ipAddress: request ? (request.ip || request.connection.remoteAddress) : null
      } as AuditLogEntity;
    }
  }



  /**
   * Sanitize headers to remove sensitive information before logging
   */
  private sanitizeHeaders(headers: any): any {
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

  /**
   * Log authentication events (login/logout attempts)
   */
  async logAuthEvent(
    action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'token_refresh',
    userId: string | null = null,
    email: string | null = null,
    success: boolean,
    request: Request | null = null,
    errorMessage: string | null = null
  ): Promise<AuditLogEntity> {
    return this.log(
      action,
      userId ?? null,
      'User',
      userId ?? null,
      {
        email: email ?? null,
        success,
        errorMessage: errorMessage ?? null,
        authEvent: true
      },
      request
    );
  }

  /**
   * Log payment-related events
   */
  async logPaymentEvent(
    action: string,
    userId: string,
    amount: number,
    currency: string,
    paymentProvider: string,
    transactionId: string | null = null,
    success: boolean,
    request: Request | null = null,
    errorMessage: string | null = null
  ): Promise<AuditLogEntity> {
    return this.log(
      action,
      userId,
      'Payment',
      transactionId ?? null,
      {
        amount,
        currency,
        paymentProvider,
        success,
        errorMessage: errorMessage ?? null,
        paymentEvent: true
      },
      request
    );
  }

  /**
   * Log wallet-related events
   */
  async logWalletEvent(
    action: string,
    userId: string,
    walletId: string,
    amount: number,
    currency: string,
    transactionType: 'credit' | 'debit',
    balanceAfter: number,
    request: Request | null = null
  ): Promise<AuditLogEntity> {
    return this.log(
      action,
      userId,
      'Wallet',
      walletId,
      {
        amount,
        currency,
        transactionType,
        balanceAfter,
        walletEvent: true
      },
      request
    );
  }

  /**
   * Get audit logs with filtering options
   */
  async getAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      entityId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<AuditLogEntity[]> {
    const where: any = {};
    
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
      where.timestamp = MoreThan(filters.startDate);
    }
    
    if (filters.endDate) {
      if (where.timestamp) {
        where.timestamp = { ...where.timestamp, LessThan: filters.endDate } as any;
      } else {
        where.timestamp = LessThan(filters.endDate) as any;
      }
    }
    
    return this.auditLogRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: filters.limit ?? 100,
      skip: filters.offset ?? 0
    });
  }

  /**
   * Get audit log statistics for monitoring
   */
  async getAuditStatistics(): Promise<any> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [totalLogs, recentLogs, failedLogins, successfulLogins] = await Promise.all([
      this.auditLogRepo.count(),
      this.auditLogRepo.count({ where: { timestamp: MoreThan(twentyFourHoursAgo) } }),
      this.auditLogRepo.count({ 
        where: { 
          action: 'login_failure',
          timestamp: MoreThan(twentyFourHoursAgo)
        } 
      }),
      this.auditLogRepo.count({ 
        where: { 
          action: 'login_success',
          timestamp: MoreThan(twentyFourHoursAgo)
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
}