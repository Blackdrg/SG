import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/audit.service';
export declare class PaymentService {
    private configService;
    private auditService;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, auditService: AuditService);
    createPaymentIntent(amount: number, currency?: string, userId?: string, metadata?: any, request?: any): Promise<any>;
    private validatePaymentLimits;
    private checkSuspiciousPatterns;
    constructEvent(payload: Buffer, sig: string, secret: string): Promise<any>;
    confirmPayment(paymentId: string, userId: string, request?: any): Promise<any>;
    refundPayment(paymentId: string, amount: number | null, userId: string, reason?: string, request?: any): Promise<any>;
}
