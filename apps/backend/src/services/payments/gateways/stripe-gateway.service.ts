
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PaymentGateway } from './payment-gateway.interface';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    userId: string = null,
    metadata: any = {}
  ): Promise<any> {
    try {
      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency,
        metadata: {
          ...metadata,
          userId,
          timestamp: new Date().toISOString()
        }
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error('Stripe payment intent creation failed:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentId: string,
    userId: string
  ): Promise<any> {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      if (paymentIntent.status === 'succeeded') {
        return paymentIntent;
      } else {
        throw new BadRequestException(Payment not successful: );
      }
    } catch (error) {
      this.logger.error('Stripe payment confirmation failed:', error);
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
      // Get original payment
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      // Validate refund amount
      const refundAmount = amount ?? (paymentIntent.amount / 100);
      const maxRefund = paymentIntent.amount / 100;
      
      if (refundAmount > maxRefund) {
        throw new BadRequestException(Refund amount cannot exceed original payment: {maxRefund});
      }
      
      if (refundAmount <= 0) {
        throw new BadRequestException('Refund amount must be greater than zero');
      }

      // Create refund
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: Math.round(refundAmount * 100),
        reason: reason as any
      });

      return refund;
    } catch (error) {
      this.logger.error('Stripe payment refund failed:', error);
      throw error;
    }
  }

  async constructEvent(
    payload: Buffer,
    signature: string,
    secret: string
  ): Promise<any> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      this.logger.error('Stripe webhook verification failed:', error);
      throw error;
    }
  }

  getGatewayName(): string {
    return 'stripe';
  }
}
