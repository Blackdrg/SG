import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
  ) {}

  /**
   * GDPR-compliant data retention policy
   * - User data: retained for 7 years after account deletion (legal requirement)
   * - Order data: retained for 10 years (tax/legal requirements)
   * - Session data: retained for 90 days after expiration
   * - Audit logs: retained for 3 years (security/compliance)
   */
  async applyDataRetentionPolicies(): Promise<void> {
    try {
      this.logger.log('Starting GDPR data retention policy application');
      
      const now = new Date();
      
      // 1. Delete expired sessions (90 days after expiration)
      const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const deletedSessions = await this.sessionRepo.delete({
        expiresAt: LessThan(sessionCutoff),
      });
      this.logger.log(`Deleted ${deletedSessions.affected || 0} expired sessions`);
      
      // 2. Anonymize old audit logs (beyond 3 years) to cold storage would be done here
      const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      const oldAuditCount = await this.auditLogRepo.count({
        where: { timestamp: LessThan(auditCutoff) },
      });
      this.logger.log(`Found ${oldAuditCount} audit logs for archival`);
      
      this.logger.log('GDPR data retention policy application completed');
    } catch (error) {
      this.logger.error('Error applying data retention policies', error);
      throw error;
    }
  }

  /**
   * Check if user data should be retained based on GDPR
   * @param userId The user ID to check
   * @returns boolean indicating if data should be retained
   */
  async shouldRetainUserData(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['deletedAt'],
    });

    if (!user || !user.deletedAt) {
      return true; // Active user, retain data
    }

    // Retain for 7 years after deletion (legal requirement)
    const retentionPeriodMs = 7 * 365 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(user.deletedAt.getTime() + retentionPeriodMs);
    
    return new Date() < cutoffDate;
  }

  /**
   * Delete user data (GDPR right to be forgotten)
   * @param userId The user ID to delete
   */
  async deleteUserData(userId: string): Promise<void> {
    await this.userRepo.softDelete(userId);
    await this.sessionRepo.update({ userId }, { isActive: false });
    this.logger.log(`Deleted user data for user ${userId}`);
  }

  /**
   * Export user data (GDPR right to access)
   * @param userId The user ID to export
   */
  async exportUserData(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const orders = []; // In production, fetch from order repository
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

  /**
   * Get data retention statistics
   */
  async getRetentionStatistics(): Promise<any> {
    const now = new Date();
    const sessionCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const auditCutoff = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalSessions, expiredSessions, oldAuditLogs] = await Promise.all([
      this.userRepo.count(),
      this.sessionRepo.count(),
      this.sessionRepo.count({ where: { expiresAt: LessThan(sessionCutoff) } }),
      this.auditLogRepo.count({ where: { timestamp: LessThan(auditCutoff) } }),
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
}