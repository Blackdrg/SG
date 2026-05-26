import { Controller, Post, Get, Req, HttpCode, HttpStatus, RawBodyRequest, Headers as HeadersDecorator } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @HeadersDecorator('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    return await this.webhookService.processWebhook(rawBody, signature);
  }

  @Get('stats')
  async getWebhookStats() {
    return await this.webhookService.getWebhookStats();
  }
}