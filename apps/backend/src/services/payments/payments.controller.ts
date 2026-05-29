import { Controller, Post, Body, Headers, Req, BadRequestException, RawBodyRequest, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payments.service';
import { PaymentHardeningService } from './payment-hardening.service';
import { RetryService, RetryResult } from './retry.service';
import { FraudHardeningService, FraudCheckResult } from './fraud-hardening.service';
import { IdempotencyService } from './idempotency.service';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentService: PaymentService,
    private paymentHardening: PaymentHardeningService,
    private retryService: RetryService,
    private fraudHardening: FraudHardeningService,
    private idempotency: IdempotencyService,
    private configService: ConfigService,
  ) {}

   @Post('create-intent')
   @HttpCode(HttpStatus.OK)
   async createPaymentIntent(
     @Body() body: any,
     @Req() req: Request,
     @Headers('x-idempotency-key') idempotencyKey?: string
   ) {
     const fraudCheck = await this.fraudHardening.checkPaymentFraud({
       userId: body.userId,
       amount: body.amount,
       ipAddress: req.ip || req.connection.remoteAddress || '0.0.0.0',
       userAgent: req.get('User-Agent') || 'Unknown',
     });

    if (!fraudCheck.allowed) {
      return {
        error: 'Payment blocked due to fraud risk',
        reasons: fraudCheck.reasons,
        riskScore: fraudCheck.riskScore,
      };
    }

    const retryResult: RetryResult<any> = await this.retryService.executeWithRetry(
      async () => {
        if (idempotencyKey) {
          const existing = await this.idempotency.validateOrCreate(
            idempotencyKey,
            'create_payment_intent',
            body.userId,
            { amount: body.amount, currency: body.currency }
          );

          if (existing.isDuplicate) {
            return existing.response;
          }
        }

        const intent = await this.paymentService.createPaymentIntent(
          body.amount,
          body.currency || 'usd',
          body.userId,
          { orderId: body.orderId, paymentMethodId: body.paymentMethodId }
        );

        if (idempotencyKey) {
          await this.idempotency.complete(idempotencyKey, 'create_payment_intent', intent);
        }

        return intent;
      },
      'create_payment_intent',
      { userId: body.userId, orderId: body.orderId }
    );

    if (!retryResult.success) {
      throw new BadRequestException(retryResult.error?.message);
    }

    return { clientSecret: retryResult.result?.client_secret };
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  async refund(
    @Body() body: any,
    @Headers('x-idempotency-key') idempotencyKey?: string
  ) {
    const retryResult = await this.retryService.executeWithRetry(
      async () => {
        if (idempotencyKey) {
          const existing = await this.idempotency.validateOrCreate(
            idempotencyKey,
            'refund_payment',
            body.userId,
            { paymentIntentId: body.paymentIntentId, amount: body.amount }
          );

          if (existing.isDuplicate) {
            return existing.response;
          }
        }

        const refund = await this.paymentService.refundPayment(
          body.paymentIntentId,
          body.amount,
          body.userId,
          body.reason
        );

        if (idempotencyKey) {
          await this.idempotency.complete(idempotencyKey, 'refund_payment', refund);
        }

        return refund;
      },
      'refund_payment',
      { userId: body.userId, paymentId: body.paymentIntentId }
    );

    if (!retryResult.success) {
      throw new BadRequestException(retryResult.error?.message);
    }

    return retryResult.result;
  }
}
