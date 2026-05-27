export declare class PaymentFraudFlagEntity {
    id: string;
    userId: string;
    paymentIntentId: string;
    orderId: string;
    flagType: 'velocity_abuse' | 'card_testing' | 'high_risk_card' | 'suspicious_pattern' | 'refund_abuse' | 'chargeback_risk' | 'other';
    amount: number;
    riskScore: number;
    evidence: {
        ipAddress?: string;
        userAgent?: string;
        cardBin?: string;
        transactionCount?: number;
        timeWindow?: string;
        [key: string]: any;
    };
    isBlocked: boolean;
    blockedAt: Date;
    createdAt: Date;
}
