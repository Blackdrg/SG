import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { StripeWebhookEntity } from '../../../db/entities/stripe-webhook.entity';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
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

    try {
      const result = await this.handleEvent(event);

      const webhookRecord = this.webhookRepo.create({
        webhookId: event.id,
        eventType: event.type,
        processedAt: new Date(),
      });
      await this.webhookRepo.save(webhookRecord);

      return { received: true, processed: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed for event ${event.id}:`, error);
      throw new InternalServerErrorException(`Webhook processing failed: ${error?.message || error}`);
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
      default:
        this.logger.warn(`Unhandled Stripe event type: ${event.type}`);
        return { received: true, unhandled: true };
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
    return { received: true, paymentConfirmed: true };
  }

  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<any> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    this.logger.warn(`PaymentIntent ${paymentIntent.id} failed`);
    return { received: true, paymentFailed: true };
  }

  private async handleChargeRefunded(event: Stripe.Event): Promise<any> {
    const charge = event.data.object as Stripe.Charge;
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
    this.logger.warn(`Dispute created for charge ${charge.id}`);
    return { received: true, disputeCreated: true };
  }

  private async handleDisputeClosed(event: Stripe.Event): Promise<any> {
    const dispute = event.data.object as Stripe.Dispute;
    this.logger.log(`Dispute closed for charge ${dispute.id}, status: ${dispute.status}`);
    return { received: true, disputeClosed: true };
  }

  async getWebhookStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [total, processed] = await Promise.all([
      this.webhookRepo.count(),
      this.webhookRepo.count({ where: { processedAt: MoreThan(twentyFourHoursAgo) } }),
    ]);

    return {
      totalWebhooksReceived: total,
      webhooksLast24h: processed,
      failedLast24h: 0,
      duplicateWebhooksLast24h: 0,
    };
  }
}