export declare class PaymentEventEntity {
    id: string;
    userId: string;
    orderId: string;
    event: 'payment_intent_created' | 'payment_succeeded' | 'payment_failed' | 'refund_initiated' | 'refund_completed' | 'chargeback_received' | 'chargeback_closed' | 'refund_failed';
    payload: any;
    isProcessed: boolean;
    createdAt: Date;
}
