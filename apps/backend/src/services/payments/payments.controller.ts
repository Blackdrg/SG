import { Controller, Post, Body, Headers, Req, BadRequestException, RawBodyRequest } from '@nestjs/common';
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

  @Post('create-intent')
  async createPaymentIntent(@Body() body: any) {
    const intent = await this.paymentService.createPaymentIntent(
      body.amount,
      body.currency || 'usd',
      body.userId,
      { orderId: body.orderId }
    );
    return { clientSecret: intent.client_secret };
  }

  @Post('refund')
  async refund(@Body() body: any) {
    const refund = await this.paymentService.refundPayment(
      body.paymentIntentId,
      body.amount,
      body.userId,
      body.reason
    );
    return refund;
  }
}
