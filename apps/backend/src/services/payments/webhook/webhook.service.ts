import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, MoreThanOrEqual } from 'typeorm';
import { StripeWebhookEntity } from '../../../db/entities/stripe-webhook.entity';
import { PaymentEventEntity } from '../../payments/payment-event.entity';
import { OrderEntity } from '../../../db/entities/order.entity';
import { PaymentFraudFlagEntity } from '../../payments/payment-fraud.entity';
import Stripe from 'stripe';
import { NotificationService } from '../../notifications/notification.service';
import { ProductionNotificationService } from '../../notifications/production-notification.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(StripeWebhookEntity)
    private readonly webhookRepo: Repository<StripeWebhookEntity>,
    @InjectRepository(PaymentEventEntity)
    private readonly paymentEventRepo: Repository<PaymentEventEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(PaymentFraudFlagEntity)
    private readonly fraudFlagRepo: Repository<PaymentFraudFlagEntity>,
    private notificationService: NotificationService,
    private productionNotification: ProductionNotificationService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  async processWebhook(payload: Buffer, signature: string): Promise<any> {
    let event: Stripe.Event;

    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new InternalServerErrorException('Stripe webhook secret not configured');
      }

      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err?.message || err}`);
      throw new BadRequestException(`Webhook Error: ${err?.message || err}`);
    }

    const existingWebhook = await this.webhookRepo.findOne({ 
      where: { webhookId: event.id } 
    });

    if (existingWebhook) {
      this.logger.warn(`Duplicate webhook received: ${event.id}. Skipping processing.`);
      return { received: true, duplicate: true };
    }

    const idempotencyKey = `wh_${event.id}`;
    const existingEvent = await this.paymentEventRepo.findOne({
      where: { orderId: event.data.object?.metadata?.orderId || event.id }
    });

    if (existingEvent?.isProcessed) {
      this.logger.warn(`Already processed event for ${event.id}`);
      return { received: true, alreadyProcessed: true };
    }

    try {
      const result = await this.handleEvent(event);

      await this.paymentEventRepo.save({
        userId: event.data.object?.metadata?.userId || 'unknown',
        orderId: event.data.object?.metadata?.orderId || event.id,
        event: this.mapEventToPaymentEvent(event.type),
        payload: { ...event.data.object, ...result },
        isProcessed: true,
      });

      const webhookRecord = this.webhookRepo.create({
        webhookId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      });
      await this.webhookRepo.save(webhookRecord);

      return { received: true, processed: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
      
      await this.paymentEventRepo.save({
        userId: event.data.object?.metadata?.userId || 'unknown',
        orderId: event.data.object?.metadata?.orderId || event.id,
        event: this.mapEventToPaymentEvent(event.type),
        payload: { error: error.message, ...event.data.object },
        isProcessed: false,
      });

      throw new InternalServerErrorException(`Webhook processing failed: ${error?.message || error}`);
    }
  }

  private mapEventToPaymentEvent(eventType: string): PaymentEventEntity['event'] {
    switch (eventType) {
      case 'payment_intent.succeeded': return 'payment_succeeded';
      case 'payment_intent.payment_failed': return 'payment_failed';
      case 'charge.refunded': return 'refund_completed';
      case 'charge.refund.updated': return 'refund_completed';
      default: return 'payment_succeeded';
    }
  }

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
      case 'payment_intent.amount_capturable_updated':
        return await this.handleAmountCapturableUpdated(event);
      case 'charge.expired':
        return await this.handleChargeExpired(event);
      case 'charge.succeeded':
        return await this.handleChargeSucceeded(event);
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
        return { received: true, unhandled: true };
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: paymentIntent.metadata.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'completed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      paymentIntent.metadata?.userId || 'system',
      paymentIntent.id,
      {
        type: 'payment_success',
        severity: 'low',
        amount: paymentIntent.amount / 100,
        message: `Payment succeeded for ${paymentIntent.amount / 100}`,
      }
    );

    this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
    return { received: true, paymentConfirmed: true };
  }

  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    if (paymentIntent.metadata?.orderId) {
      const order = await this.orderRepo.findOne({
        where: { id: paymentIntent.metadata.orderId }
      });
      
      if (order) {
        order.paymentStatus = 'failed' as any;
        await this.orderRepo.save(order);
      }
    }

    await this.productionNotification.sendPaymentNotification(
      paymentIntent.metadata?.userId || 'system',
      paymentIntent.id,
      {
        type: 'payment_failure',
        severity: 'high',
        amount: paymentIntent.amount / 100,
        message: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
      }
    );

    this.logger.warn(`PaymentIntent ${paymentIntent.id} failed`);
    return { received: true, paymentFailed: true };
  }

  private async handleChargeRefunded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    
    await this.productionNotification.sendPaymentNotification(
      charge.metadata?.userId || 'system',
      charge.payment_intent as string,
      {
        type: 'refund_completed',
        severity: 'medium',
        amount: charge.amount_refunded / 100,
        message: `Refund completed for ${charge.amount_refunded / 100}`,
      }
    );

    this.logger.log(`Charge ${charge.id} refunded for ${charge.amount_refunded}`);
    return { received: true, refundProcessed: true };
  }

  private async handleChargeRefundUpdated(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    this.logger.log(`Refund updated for charge ${charge.id}: ${charge.amount_refunded} refunded`);
    return { received: true, refundUpdated: true };
  }

  private async handleDisputeCreated(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    
    await this.fraudFlagRepo.save({
      userId: charge.metadata?.userId || 'unknown',
      paymentIntentId: charge.payment_intent as string,
      orderId: charge.metadata?.orderId,
      flagType: 'chargeback_risk',
      amount: charge.amount / 100,
      riskScore: 90,
      evidence: {
        disputeId: event.data.object?.id,
        reason: 'dispute_created',
      },
      isBlocked: true,
      blockedAt: new Date(),
    });

    await this.productionNotification.sendFraudAlert(
      charge.metadata?.userId || 'system',
      {
        severity: 'critical',
        message: `Dispute created for charge ${charge.id}`,
        paymentId: charge.payment_intent as string,
        orderId: charge.metadata?.orderId,
      }
    );

    this.logger.warn(`Dispute created for charge ${charge.id}`);
    return { received: true, disputeCreated: true };
  }

  private async handleDisputeClosed(event: Stripe.Event): Promise<any> {
    const dispute = event.data.object as Stripe.Dispute;
    this.logger.log(`Dispute closed for charge ${dispute.id}, status: ${dispute.status}`);
    return { received: true, disputeClosed: true };
  }

  private async handleAmountCapturableUpdated(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`Amount capturable updated for ${paymentIntent.id}`);
    return { received: true, amountCapturableUpdated: true };
  }

  private async handleChargeExpired(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    this.logger.warn(`Charge expired: ${charge.id}`);
    return { received: true, chargeExpired: true };
  }

  private async handleChargeSucceeded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
    this.logger.log(`Charge succeeded: ${charge.id}`);
    return { received: true, chargeSucceeded: true };
  }

  async getWebhookStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [total, processed, failed, duplicates, critical] = await Promise.all([
      this.webhookRepo.count(),
      this.webhookRepo.count({ where: { processedAt: MoreThan(twentyFourHoursAgo) } }),
      this.paymentEventRepo.count({
        where: {
          isProcessed: false,
          createdAt: MoreThanOrEqual(twentyFourHoursAgo)
        }
      }),
      this.webhookRepo
        .createQueryBuilder('w')
        .where('w."createdAt" >= :since', { since: twentyFourHoursAgo })
        .select('COUNT(*)', 'count')
        .getRawOne()
        .then(r => 0),
      this.fraudFlagRepo.count({
        where: {
          isBlocked: true,
          blockedAt: MoreThanOrEqual(twentyFourHoursAgo)
        }
      }),
    ]);

    return {
      totalWebhooksReceived: total,
      webhooksLast24h: processed,
      failedLast24h: failed,
      duplicateWebhooksLast24h: 0,
      fraudFlagsLast24h: critical,
    };
  }
}