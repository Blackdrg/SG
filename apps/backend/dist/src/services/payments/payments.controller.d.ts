import { Request } from 'express';
import { PaymentService } from './payments.service';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService } from './retry.service';
import { FraudHardeningService } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsController {
    private paymentService;
    private paymentHardening;
    private retryService;
    private fraudHardening;
    private idempotency;
    private configService;
    constructor(paymentService: PaymentService, paymentHardening: PaymentHardeningService, retryService: RetryService, fraudHardening: FraudHardeningService, idempotency: IdempotencyService, configService: ConfigService);
    createPaymentIntent(body: any, req: Request, idempotencyKey?: string): Promise<{
        error: string;
        reasons: string[];
        riskScore: number;
        clientSecret?: undefined;
    } | {
        clientSecret: any;
        error?: undefined;
        reasons?: undefined;
        riskScore?: undefined;
    }>;
    refund(body: any, idempotencyKey?: string): Promise<any>;
}
