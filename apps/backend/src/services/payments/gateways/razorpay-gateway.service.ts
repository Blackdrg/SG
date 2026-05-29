
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

  // Helper method to make HTTP requests to Razorpay API
  private async razorpayRequest(
    method: string,
    endpoint: string,
    data: any = {}
  ): Promise<any> {
    try {
      const auth = Buffer.from(${this.keyId}:).toString('base64');
      
      const response = await fetch(https://api.razorpay.com/v1/, {
        method,
        headers: {
          'Authorization': Basic ,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.description || 'Razorpay API error');
      }

      return await response.json();
    } catch (error) {
      this.logger.error(Razorpay API request failed:, error);
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
      // Razorpay expects amount in smallest currency unit (paise for INR)
      const amountInPaise = Math.round(amount * 100);
      
      const paymentData = {
        amount: amountInPaise,
        currency: currency.toLowerCase(),
        receipt: eceipt_,
        notes: {
          ...metadata,
          userId,
          timestamp: new Date().toISOString()
        }
      };

      const payment = await this.razorpayRequest('POST', 'orders', paymentData);
      
      // Return in a format similar to Stripe for consistency
      return {
        id: payment.id,
        amount: payment.amount / 100, // Convert back to regular units
        currency: payment.currency,
        status: payment.status,
        client_secret: payment.id // Razorpay uses order_id as client_secret for frontend
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
      // For Razorpay, we fetch the order/payment details
      const payment = await this.razorpayRequest('GET', orders/);
      
      if (payment.status === 'paid') {
        return payment;
      } else {
        throw new BadRequestException(Payment not successful: );
      }
    } catch (error) {
      this.logger.error('Razorpay payment confirmation failed:', error);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    amount: number | null = null, // null for full refund
    userId: string,
    reason: string = 'requested_by_customer'
  ): Promise<any> {
    try {
      // First, we need to get the payment ID associated with the order
      const order = await this.razorpayRequest('GET', orders/);
      
      // For simplicity, we'll assume we're refunding the entire order
      // In a real implementation, we'd need to capture the payment ID from the order
      const paymentIdToRefund = order.payments?.items?.[0]?.id || paymentId;
      
      // Validate refund amount
      const refundAmount = amount ?? (order.amount / 100);
      const maxRefund = order.amount / 100;
      
      if (refundAmount > maxRefund) {
        throw new BadRequestException(Refund amount cannot exceed original amount: ₹);
      }
      
      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      // Create refund
      const refundData = {
        amount: Math.round(refundAmount * 100), // Razorpay expects amount in paise
        notes: {
          reason,
          userId
        }
      };

      const refund = await this.razorpayRequest('POST', payments//refund, refundData);
      
      return refund;
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
    // Razorpay webhook verification
    try {
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('hex');
      
      if (generatedSignature !== signature) {
        throw new Error('Invalid signature');
      }
      
      const event = JSON.parse(payload.toString());
      return event;
    } catch (error) {
      this.logger.error('Razorpay webhook verification failed:', error);
      throw error;
    }
  }

  getGatewayName(): string {
    return 'razorpay';
  }
}
