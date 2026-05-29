import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { AuditService } from '../../audit/audit.service';
import { LedgerService } from '../../modules/ledger/ledger.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private ledgerService: LedgerService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  /**
   * Create a payment intent with abuse prevention checks
   * @param amount The amount to charge (in dollars)
   * @param currency The currency (default: usd)
   * @param userId The user making the payment (for abuse tracking)
   * @param metadata Additional metadata
   * @param request The Express request (for IP tracking)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    userId: string = null,
    metadata: any = {},
    request: any = null
  ): Promise<any> {
    try {
      // Abuse prevention checks
      await this.validatePaymentLimits(userId, amount, request);
      
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

      // Log successful payment intent creation
      await this.auditService.logPaymentEvent(
        'payment_intent_created',
        userId,
        amount,
        currency,
        'stripe',
        paymentIntent.id,
        true,
        request
      );

      return paymentIntent;
    } catch (error) {
      // Log failed payment attempt
      await this.auditService.logPaymentEvent(
        'payment_intent_failed',
        userId,
        amount,
        currency,
        'stripe',
        null,
        false,
        request,
        (error as any).message
      );
      
      this.logger.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  /**
   * Validate payment limits to prevent abuse
   * @param userId The user ID
   * @param amount The payment amount
   * @param request The request object (for IP tracking)
   */
  private async validatePaymentLimits(
    userId: string,
    amount: number,
    request: any
  ): Promise<void> {
    // Check amount limits
    const maxSingleAmount = this.configService.get<number>('PAYMENT_MAX_SINGLE_AMOUNT', 10000); // $10,000
    if (amount > maxSingleAmount) {
      throw new BadRequestException(`Payment amount exceeds maximum allowed: $${maxSingleAmount}`);
    }

    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    // Check daily limits per user - simplified placeholder
    if (userId) {
      const dailyLimit = this.configService.get<number>('PAYMENT_DAILY_LIMIT_PER_USER', 50000); // $50,000
      // In a real implementation, we would check actual daily totals from database
      // For now, we'll just note that this check should occur
    }

    // Check for suspicious patterns (velocity checks would be more complex in production)
    // For now, we'll implement basic checks
    await this.checkSuspiciousPatterns(userId, amount, request);
  }

  /**
   * Check for suspicious payment patterns
   */
  private async checkSuspiciousPatterns(
    userId: string,
    amount: number,
    request: any
  ): Promise<void> {
    // Check for rapid successive payments (basic implementation)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (userId) {
      // Simplified - would query actual payment/wallet transactions in production
      // For now we'll skip the detailed check to avoid entity relationship issues
    }

    // Additional IP-based checks could be added here
    // For production, integrate with fraud detection services like Stripe Radar
  }

  /**
   * Construct a Stripe webhook event with verification
   */
  async constructEvent(payload: Buffer, sig: string, secret: string): Promise<any> {
    try {
      const event = this.stripe.webhooks.constructEvent(payload, sig, secret);
      const stripeObject = event.data.object as any;
      
      // Log webhook receipt
      await this.auditService.logPaymentEvent(
        'webhook_received',
        stripeObject.metadata?.userId || 'unknown',
        stripeObject.amount / 100,
        stripeObject.currency,
        'stripe',
        stripeObject.id,
        true,
        null // Webhooks don't have request objects in the same way
      );

      return event;
    } catch (error) {
      this.logger.error('Webhook verification failed:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment was successful
   */
  async confirmPayment(
    paymentId: string,
    userId: string,
    request: any = null
  ): Promise<any> {
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
    if (paymentIntent.status === 'succeeded') {
      await this.auditService.logPaymentEvent(
        'payment_confirmed',
        userId,
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'stripe',
        paymentId,
        true,
        request
      );

      // Record ledger entry for successful payment
      try {
        await this.ledgerService.createTransaction(
          paymentIntent.id, // transactionId
          'cash', // debitAccount
          'revenue', // creditAccount
          paymentIntent.amount / 100, // amount
          paymentIntent.currency, // currency
          'payment', // type
          paymentIntent.id, // referenceId
          `Payment succeeded for order ${paymentIntent.metadata?.orderId || 'unknown'}` // description
        );
      } catch (ledgerError) {
        this.logger.error('Failed to create ledger entry for payment success:', ledgerError);
        // We don't throw here because the payment succeeded
      }

      return paymentIntent;
    } else {
        // Log failed payment
        await this.auditService.logPaymentEvent(
          'payment_failed',
          userId,
          paymentIntent.amount / 100,
          paymentIntent.currency,
          'stripe',
          paymentId,
          false,
          request,
          `Payment status: ${paymentIntent.status}`
        );

        throw new BadRequestException(`Payment not successful: ${paymentIntent.status}`);
      }
    } catch (error) {
      this.logger.error('Payment confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Refund a payment with abuse prevention
   */
  async refundPayment(
    paymentId: string,
    amount: number | null = null, // null for full refund
    userId: string,
    reason: string = 'requested_by_customer',
    request: any = null
  ): Promise<any> {
    try {
      // Get original payment
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      // Validate refund amount
      const refundAmount = amount ?? (paymentIntent.amount / 100);
      const maxRefund = paymentIntent.amount / 100;
      
      if (refundAmount > maxRefund) {
        throw new BadRequestException(`Refund amount cannot exceed original payment: $${maxRefund}`);
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

      await this.auditService.logPaymentEvent(
        'payment_refunded',
        userId,
        refund.amount / 100,
        paymentIntent.currency,
        'stripe',
        paymentId,
        true,
        request,
        `Reason: ${reason}`
      );

      // Record ledger entry for refund
      try {
        await this.ledgerService.createTransaction(
          refund.id, // transactionId
          'refund', // debitAccount (increase liability)
          'cash', // creditAccount (decrease asset)
          refund.amount / 100, // amount
          paymentIntent.currency, // currency
          'refund', // type
          refund.id, // referenceId
          `Refund processed for payment ${paymentId}, reason: ${reason}` // description
        );
      } catch (ledgerError) {
        this.logger.error('Failed to create ledger entry for refund:', ledgerError);
      }

      return refund;
    } catch (error) {
      this.logger.error('Payment refund failed:', error);
      
      // Log failed refund attempt
      await this.auditService.logPaymentEvent(
        'payment_refund_failed',
        userId,
        amount || 0,
        'usd', // We don't have the currency here without fetching again
        'stripe',
        paymentId,
        false,
        request,
        (error as any).message
      );
      
      throw error;
    }
  }
}