import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../../audit/audit.service';
import { OrderService } from '../../order/order.service';
import { WalletService } from '../../wallet/wallet.service';
import { NotificationService } from '../../notifications/notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { StripeWebhookEntity } from '../../db/entities/stripe-webhook.entity';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    private orderService: OrderService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    @InjectRepository(StripeWebhookEntity)
    private readonly webhookRepo: Repository<StripeWebhookEntity>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  /**
   * Process incoming Stripe webhook with replay protection
   */
  async processWebhook(payload: Buffer, signature: string): Promise<any> {
    let event: Stripe.Event;

    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new InternalServerErrorException('Stripe webhook secret not configured');
      }

      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Check if webhook has already been processed (replay protection)
    const existingWebhook = await this.webhookRepo.findOne({ 
      where: { webhookId: event.id } 
    });

    if (existingWebhook) {
      this.logger.warn(`Duplicate webhook received: ${event.id}. Skipping processing.`);
      // Return success to prevent Stripe from retrying
      return { received: true, duplicate: true };
    }

    try {
      // Process the webhook event
      const result = await this.handleEvent(event);

      // Record webhook as processed
      const webhookRecord = this.webhookRepo.create({
        webhookId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      });
      await this.webhookRepo.save(webhookRecord);

      // Log successful processing
      await this.auditService.logPaymentEvent(
        'webhook_processed',
        event.data.object?.metadata?.userId || 'unknown',
        event.data.object?.amount ? event.data.object.amount / 100 : 0,
        event.data.object?.currency || 'usd',
        'stripe',
        event.id,
        true,
        null
      );

      return { received: true, processed: true };
    } catch (error) {
      this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
      
      // Log failed processing
      await this.auditService.logPaymentEvent(
        'webhook_failed',
        event.data.object?.metadata?.userId || 'unknown',
        event.data.object?.amount ? event.data.object.amount / 100 : 0,
        event.data.object?.currency || 'usd',
        'stripe',
        event.id,
        false,
        null,
        error.message
      );
      
      throw new InternalServerErrorException(`Webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Handle individual Stripe webhook events
   */
  private async handleEvent(event: Stripe.Event): Promise<any> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await this.handlePaymentIntentSucceeded(event);
      case 'payment_intent.payment_failed':
        return await this.handlePaymentIntentFailed(event);
      case 'charge.refunded':
        return await this.handleChargeRefunded(event);
      case 'charge.refund.updated':
        return await this.handleChargeRefundUpdated(event);
      case 'charge.dispute.created':
        return await this.handleDisputeCreated(event);
      case 'charge.dispute.closed':
        return await this.handleDisputeClosed(event);
      default:
        // Unexpected event type
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
        return { received: true, unhandled: true };
    }
  }

  /**
   * Handle successful payment intent
   */
  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata?.userId;
    const orderId = paymentIntent.metadata?.orderId;

    if (!userId || !orderId) {
      this.logger.warn(`PaymentIntent ${paymentIntent.id} missing metadata (userId or orderId)`);
      return { received: true, missingMetadata: true };
    }

    try {
      // Confirm the payment in our system
      await this.orderService.confirmPayment(orderId, paymentIntent.id);
      
      // Send notification to user
      await this.notificationService.sendPush(
        userId,
        'Payment Successful',
        `Your payment of $${paymentIntent.amount / 100} was successful.`,
        { orderId }
      );

      return { received: true, paymentConfirmed: true };
    } catch (error) {
      this.logger.error(`Failed to confirm payment for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Handle failed payment intent
   */
  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const userId = paymentIntent.metadata?.userId;
    const orderId = paymentIntent.metadata?.orderId;

    if (!userId || !orderId) {
      this.logger.warn(`PaymentIntent ${paymentIntent.id} missing metadata (userId or orderId)`);
      return { received: true, missingMetadata: true };
    }

    try {
      // Update order payment status to failed
      const order = await this.orderService.getOrderWithLock(orderId);
      if (order.paymentIntentId !== paymentIntent.id) {
        this.logger.warn(`PaymentIntent mismatch for order ${orderId}`);
        return { received: true, mismatch: true };
      }

      order.paymentStatus = 'failed';
      order.updatedAt = new Date();
      // Assuming we have an order repository method - would need to implement
      // For now, just log the event
      
      // Send notification to user
      await this.notificationService.sendPush(
        userId,
        'Payment Failed',
        `Your payment of $${paymentIntent.amount / 100} failed. Please try again.`,
        { orderId }
      );

      return { received: true, paymentFailed: true };
    } catch (error) {
      this.logger.error(`Failed to handle payment failure for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Handle charge refunded
   */
  private async handleChargeRefunded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    const userId = charge.metadata?.userId;
    const orderId = charge.metadata?.orderId;
    const refundId = event.data.object?.refund?.id;

    if (!userId || !orderId) {
      this.logger.warn(`Charge ${charge.id} missing metadata (userId or orderId)`);
      return { received: true, missingMetadata: true };
    }

    try {
      // Handle refund in our system
      // This would typically involve updating order payment status and wallet
      // For now, we'll log the event and send notification
      
      await this.notificationService.sendPush(
        userId,
        'Refund Processed',
        `A refund of $${charge.amount_refunded / 100} has been processed for order #${orderId}.`,
        { orderId }
      );

      return { received: true, refundProcessed: true };
    } catch (error) {
      this.logger.error(`Failed to handle refund for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Handle charge refund updated
   */
  private async handleChargeRefundUpdated(event: Stripe.Event): Promise<any> {
    // This is less critical but we should still process it
    const charge = event.data.object as Stripe.Charge;
    this.logger.info(`Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
    return { received: true, refundUpdated: true };
  }

  /**
   * Handle dispute created
   */
  private async handleDisputeCreated(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    const userId = charge.metadata?.userId;
    const orderId = charge.metadata?.orderId;

    if (!userId || !orderId) {
      this.logger.warn(`Dispute charge ${charge.id} missing metadata`);
      return { received: true, missingMetadata: true };
    }

    try {
      // Notify user about dispute
      await this.notificationService.sendPush(
        userId,
        'Payment Disputed',
        `A dispute has been filed on your payment for order #${orderId}. We are reviewing it.`,
        { orderId }
      );

      // Log for administrative review
      await this.auditService.logPaymentEvent(
        'dispute_created',
        userId,
        charge.amount / 100,
        charge.currency,
        'stripe',
        charge.id,
        false,
        null,
        `Dispute created: ${event.data.object.reason}`
      );

      return { received: true, disputeCreated: true };
    } catch (error) {
      this.logger.error(`Failed to handle dispute for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Handle dispute closed
   */
  private async handleDisputeClosed(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    const userId = charge.metadata?.userId;
    const orderId = charge.metadata?.orderId;

    if (!userId || !orderId) {
      this.logger.warn(`Dispute charge ${charge.id} missing metadata`);
      return { received: true, missingMetadata: true };
    }

    try {
      const dispute = event.data.object as Stripe.Dispute;
      let message = '';
      
      if (dispute.status === 'won') {
        message = `Your dispute for order #${orderId} was resolved in your favor.`;
      } else if (dispute.status === 'lost') {
        message = `Your dispute for order #${orderId} was resolved against you.`;
      } else {
        message = `Your dispute for order #${orderId} has been closed.`;
      }

      await this.notificationService.sendPush(
        userId,
        'Dispute Resolved',
        message,
        { orderId }
      );

      return { received: true, disputeClosed: true };
    } catch (error) {
      this.logger.error(`Failed to handle dispute closure for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get webhook processing statistics
   */
  async getWebhookStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [total, processed, failed, duplicates] = await Promise.all([
      this.webhookRepo.count(),
      this.webhookRepo.count({ where: { processedAt: MoreThan(twentyFourHoursAgo) } }),
      // For failed webhooks, we'd need to track them separately - placeholder
      this.webhookRepo.count({ where: { processedAt: MoreThan(twentyFourHoursAgo) } }), // Placeholder
      0 // Placeholder for duplicates
    ]);

    return {
      totalWebhooksReceived: total,
      webhooksLast24h: processed,
      failedLast24h: failed, // Would need separate tracking
      duplicateWebhooksLast24h: duplicates,
    };
  }
}