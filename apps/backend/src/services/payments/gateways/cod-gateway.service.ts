import { Injectable, Logger } from '@nestjs/common';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class CashOnDeliveryGateway implements PaymentGateway {
  private readonly logger = new Logger(CashOnDeliveryGateway.name);

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string = null,
    metadata: any = {}
  ): Promise<any> {
    const codPaymentId = `cod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: codPaymentId,
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_secret: codPaymentId,
      payment_method: 'cod',
      metadata: {
        ...metadata,
        userId,
        paymentMethod: 'cash_on_delivery',
        instruction: 'Pay cash to driver on delivery',
      },
    };
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<any> {
    if (!paymentId?.startsWith('cod_')) {
      throw new Error('Invalid COD payment ID');
    }

    return {
      id: paymentId,
      amount: 0,
      currency: 'INR',
      status: 'pending',
      payment_method: 'cod',
    };
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<any> {
    this.logger.warn(`COD refund requested - no action taken. Amount: ${amount}, Payment: ${paymentId}`);
    return {
      id: `refund_${Date.now()}`,
      amount: amount || 0,
      status: 'processed',
      note: 'COD refund - requires manual driver reconciliation',
    };
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<any> {
    return JSON.parse(payload.toString());
  }

  getGatewayName(): string {
    return 'cod';
  }

  supportsCOD(): boolean {
    return true;
  }
}