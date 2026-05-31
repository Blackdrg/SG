import { PaymentIntent, PaymentResult, RefundResult } from './payment.types';
export declare class CodService {
    createPaymentIntent(amount: number, currency?: string, userId?: string, metadata?: Record<string, unknown>): Promise<PaymentIntent>;
    confirmPayment(paymentId: string, userId: string): Promise<PaymentResult>;
    refundPayment(paymentId: string, amount: number | null, userId: string, reason?: string): Promise<RefundResult>;
}
