import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Req } from '@nestjs/common';
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
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    // Convert body back to Buffer for Stripe verification
    const rawBody = JSON.stringify(payload);
    
    return await this.webhookService.processWebhook(Buffer.from(rawBody), signature);
  }

  @Get('stats')
  async getWebhookStats() {
    return await this.webhookService.getWebhookStats();
  }
}