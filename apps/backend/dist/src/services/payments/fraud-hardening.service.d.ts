import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PaymentFraudFlagEntity } from './payment-fraud.entity';
import { AuditService } from '../../audit/audit.service';
export interface FraudCheckContext {
    userId: string;
    amount: number;
    paymentIntentId?: string;
    orderId?: string;
    ipAddress?: string;
    userAgent?: string;
    cardInfo?: {
        bin?: string;
        last4?: string;
        brand?: string;
        funding?: string;
    };
}
export interface FraudCheckResult {
    allowed: boolean;
    riskScore: number;
    reasons: string[];
    blockDurationMinutes?: number;
}
export declare class FraudHardeningService {
    private configService;
    private auditService;
    private readonly fraudFlagRepo;
    private readonly logger;
    constructor(configService: ConfigService, auditService: AuditService, fraudFlagRepo: Repository<PaymentFraudFlagEntity>);
    checkPaymentFraud(context: FraudCheckContext): Promise<FraudCheckResult>;
    private checkVelocity;
    private checkSuspiciousPatterns;
    private checkIpReputation;
    private flagFraudulentActivity;
    private determineFlagType;
    isUserBlocked(userId: string): Promise<boolean>;
    getFraudHistory(userId: string, limit?: number): Promise<PaymentFraudFlagEntity[]>;
    getFraudStats(): Promise<any>;
}
