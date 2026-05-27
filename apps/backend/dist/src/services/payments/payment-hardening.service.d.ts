import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';
import { PaymentValidationEventEntity } from './payment-validation.entity';
import Stripe from 'stripe';
import { AuditService } from '../../audit/audit.service';
import { Request } from 'express';
export interface PaymentValidationOptions {
    enableFraudCheck?: boolean;
    enableIdempotency?: boolean;
    enableCardValidation?: boolean;
}
export interface FraudRiskResult {
    riskScore: number;
    isBlocked: boolean;
    reasons: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
export declare class PaymentHardeningService {
    private configService;
    private auditService;
    private readonly idempotencyRepo;
    private readonly validationRepo;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, auditService: AuditService, idempotencyRepo: Repository<IdempotencyEntity>, validationRepo: Repository<PaymentValidationEventEntity>);
    validatePayment(amount: number, userId: string, request?: Request): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private validateAmount;
    private validateLimits;
    private validateVelocity;
    validateIdempotency(idempotencyKey: string, operation: string, userId: string, requestPayload: any): Promise<{
        isDuplicate: boolean;
        existingResponse?: any;
    }>;
    completeIdempotency(idempotencyKey: string, operation: string, responsePayload: any, statusCode?: number): Promise<void>;
    checkFraudRisk(userId: string, amount: number, paymentMethodId?: string, request?: Request): Promise<FraudRiskResult>;
    validateCard(paymentMethodId: string, currency?: string): Promise<{
        valid: boolean;
        paymentMethod?: Stripe.PaymentMethod;
        error?: string;
    }>;
    validateWebhookSignature(payload: Buffer, signature: string): Promise<boolean>;
}
