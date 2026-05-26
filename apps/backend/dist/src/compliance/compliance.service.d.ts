import { Repository } from 'typeorm';
import { UserEntity } from '../db/entities/user.entity';
import { SessionEntity } from '../db/entities/session.entity';
import { AuditLogEntity } from '../db/entities/audit-log.entity';
export declare class ComplianceService {
    private readonly userRepo;
    private readonly sessionRepo;
    private readonly auditLogRepo;
    private readonly logger;
    constructor(userRepo: Repository<UserEntity>, sessionRepo: Repository<SessionEntity>, auditLogRepo: Repository<AuditLogEntity>);
    applyDataRetentionPolicies(): Promise<void>;
    shouldRetainUserData(userId: string): Promise<boolean>;
    deleteUserData(userId: string): Promise<void>;
    exportUserData(userId: string): Promise<any>;
    getRetentionStatistics(): Promise<any>;
}
