import { Controller, Post, Headers, Req, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { QueueService } from '../../infra/queue/queue.service';
import { QUEUE_NAMES } from '../../shared/contracts/queues';
import { OrderStatus } from '../../shared/domain/order.interface';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentService: PaymentService,
    private configService: ConfigService,
    private queueService: QueueService
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: any;

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (DEV MODE ONLY)');
      event = req.body; // In dev, we might just pass the body
    } else {
      try {
        event = await this.paymentService.constructEvent(req.rawBody!, sig, webhookSecret);
      } catch (err: any) {
        throw new BadRequestException(`Webhook Error: ${err.message}`);
      }
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await this.processSuccessfulPayment(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        console.log(`Payment failed: ${event.data.object.last_payment_error?.message}`);
        break;
    }

    return { received: true };
  }

  private async processSuccessfulPayment(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId,
        status: OrderStatus.PAYMENT_CONFIRMED,
        transactionId: paymentIntent.id
      });
    }
  }
}
