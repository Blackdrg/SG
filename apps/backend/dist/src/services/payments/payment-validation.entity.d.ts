export declare class PaymentValidationEventEntity {
    id: string;
    userId: string;
    validationType: 'amount_check' | 'daily_limit_check' | 'velocity_check' | 'card_validation' | 'fraud_check';
    amount: number;
    validationData: any;
    passed: boolean;
    failureReason: string;
    createdAt: Date;
}
