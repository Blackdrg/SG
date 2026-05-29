import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class RazorpayGateway implements PaymentGateway {
  private readonly logger = new Logger(RazorpayGateway.name);
  private keyId: string;
  private keySecret: string;

  constructor(private configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || 'test_placeholder';
  }

  private async razorpayRequest(
    method: string,
    endpoint: string,
    data: any = {}
  ): Promise<any> {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

      const response = await fetch(`https://api.razorpay.com/v1/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.description || `Razorpay API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Razorpay API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'inr',
    userId: string = null,
    metadata: any = {}
  ): Promise<any> {
    try {
      const amountInPaise = Math.round(amount * 100);

      const paymentData = {
        amount: amountInPaise,
        currency: currency.toLowerCase(),
        receipt: `receipt_${Date.now()}_${userId || 'guest'}`,
        notes: {
          ...metadata,
          userId,
          timestamp: new Date().toISOString()
        }
      };

      const payment = await this.razorpayRequest('POST', 'orders', paymentData);

      return {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        client_secret: payment.id
      };
    } catch (error) {
      this.logger.error('Razorpay payment intent creation failed:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<any> {
    try {
      const order = await this.razorpayRequest('GET', `orders/${paymentId}`);

      if (order.status === 'paid' || order.status === 'captured') {
        return {
          id: order.id,
          amount: order.amount / 100,
          currency: order.currency,
          status: order.status
        };
      } else {
        throw new BadRequestException(`Payment not successful: ${order.status}`);
      }
    } catch (error) {
      this.logger.error('Razorpay payment confirmation failed:', error);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null,
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<any> {
    try {
      const order = await this.razorpayRequest('GET', `orders/${paymentId}`);
      
      const paymentIdToRefund = order.payments?.items?.[0]?.id || paymentId;
      const refundAmount = amount ?? (order.amount / 100);
      const maxRefund = order.amount / 100;

      if (refundAmount > maxRefund) {
        throw new BadRequestException(`Refund amount cannot exceed original amount: ${maxRefund}`);
      }

      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      const refundData = {
        amount: Math.round(refundAmount * 100),
        notes: {
          reason,
          userId
        }
      };

      const refund = await this.razorpayRequest('POST', `payments/${paymentIdToRefund}/refund`, refundData);

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (error) {
      this.logger.error('Razorpay payment refund failed:', error);
      throw error;
    }
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<any> {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }

      return JSON.parse(payload.toString());
    } catch (error) {
      this.logger.error('Razorpay webhook verification failed:', error);
      throw error;
    }
  }

  getGatewayName(): string {
    return 'razorpay';
  }
}