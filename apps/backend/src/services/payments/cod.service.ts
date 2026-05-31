import { Injectable } from '@nestjs/common';
import { PaymentIntent, PaymentResult, RefundResult } from './payment.types';

/**
 * Simple mock implementation for Cash on Delivery (COD) payments.
 * This service pretends to create a payment intent that will be captured
 * offline when the courier collects cash from the customer.
 */
@Injectable()
export class CodService {
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    userId: string = null,
    metadata: Record<string, unknown> = {},
  ): Promise<PaymentIntent> {
    // Generate a deterministic ID for tracing
    const intentId = `cod_${Date.now()}`;
    return {
      id: intentId,
      amount,
      currency,
      status: 'requires_capture',
      payment_method: 'cod',
      metadata,
    } as any;
  }

  async confirmPayment(
    paymentId: string,
    userId: string,
  ): Promise<PaymentResult> {
    // COD is confirmed when cash is actually collected; we simply return success
    return {
      id: paymentId,
      amount: 0,
      currency: 'usd',
      status: 'succeeded',
    } as any;
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer',
  ): Promise<RefundResult> {
    // In COD flow refunds are handled manually; we return a placeholder result
    return {
      id: `cod_refund_${Date.now()}`,
      amount: amount ?? 0,
      currency: 'usd',
      status: 'succeeded',
      metadata: { reason },
    } as any;
  }
}
