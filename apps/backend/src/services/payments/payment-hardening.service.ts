import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { IdempotencyEntity } from './idempotency.entity';
import { PaymentValidationEventEntity } from './payment-validation.entity';
import Stripe from 'stripe';
import { AuditService } from '../../audit/audit.service';
import { Request } from 'express';

export interface PaymentValidationOptions {
  enableFraudCheck?: boolean;
  enableIdempotency?: boolean;
  enableCardValidation?: boolean;
}

export interface FraudRiskResult {
  riskScore: number;
  isBlocked: boolean;
  reasons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

@Injectable()
export class PaymentHardeningService {
  private readonly logger = new Logger(PaymentHardeningService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    @InjectRepository(IdempotencyEntity)
    private readonly idempotencyRepo: Repository<IdempotencyEntity>,
    @InjectRepository(PaymentValidationEventEntity)
    private readonly validationRepo: Repository<PaymentValidationEventEntity>,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_placeholder',
      {
        apiVersion: '2024-04-10' as any,
      }
    );
  }

  async validatePayment(
    amount: number,
    userId: string,
    request?: Request
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const amountValidation = await this.validateAmount(amount, userId);
    if (!amountValidation.valid) {
      errors.push(...amountValidation.errors);
    }

    const limitValidation = await this.validateLimits(amount, userId);
    if (!limitValidation.valid) {
      errors.push(...limitValidation.errors);
    }

    const velocityValidation = await this.validateVelocity(userId, request);
    if (!velocityValidation.valid) {
      errors.push(...velocityValidation.errors);
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  private async validateAmount(amount: number, userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const maxSingleAmount = this.configService.get<number>('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
    if (amount > maxSingleAmount) {
      errors.push(`Payment amount exceeds maximum allowed: $${maxSingleAmount}`);
    }

    if (amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }

    const minAmount = this.configService.get<number>('PAYMENT_MIN_AMOUNT', 1);
    if (amount < minAmount) {
      errors.push(`Payment amount must be at least $${minAmount}`);
    }

    await this.validationRepo.save({
      userId,
      validationType: 'amount_check',
      amount,
      passed: errors.length === 0,
      failureReason: errors.join(', ') || null,
    });

    return { valid: errors.length === 0, errors };
  }

  private async validateLimits(amount: number, userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const dailyLimit = this.configService.get<number>('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const idem = await this.idempotencyRepo
      .createQueryBuilder('id')
      .select('SUM((id."requestPayload"->>\'amount\')::numeric)', 'total')
      .where('id."userId" = :userId', { userId })
      .andWhere('id."operation" = :op', { op: 'create_payment_intent' })
      .andWhere('id."createdAt" >= :since', { since: todayStart })
      .getRawOne();

    const dailyTotal = (idem?.total || 0) + amount;
    if (dailyTotal > dailyLimit) {
      errors.push(`Daily payment limit exceeded (attempted: $${dailyTotal}, limit: $${dailyLimit})`);
    }

    await this.validationRepo.save({
      userId,
      validationType: 'daily_limit_check',
      amount,
      validationData: { dailyTotal, dailyLimit },
      passed: errors.length === 0,
      failureReason: errors.join(', ') || null,
    });

    return { valid: errors.length === 0, errors };
  }

  private async validateVelocity(userId: string, request?: Request): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const maxPerHour = this.configService.get<number>('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);

    const hourlyCount = await this.idempotencyRepo.count({
      where: {
        userId,
        operation: 'create_payment_intent',
        createdAt: MoreThanOrEqual(oneHourAgo) as any
      }
    });

    if (hourlyCount >= maxPerHour) {
      errors.push(`Too many payment attempts (${hourlyCount} in last hour, max: ${maxPerHour})`);
    }

    if (request) {
      const ip = request.ip || request.connection.remoteAddress;
      const ipAttempts = await this.idempotencyRepo
        .createQueryBuilder('id')
        .where('id."metadata"->>\'ip\' = :ip', { ip })
        .andWhere('id."createdAt" >= :since', { since: oneHourAgo })
        .getCount();

      const maxPerIp = this.configService.get<number>('PAYMENT_MAX_TRANSACTIONS_PER_IP', 5);
      if (ipAttempts >= maxPerIp) {
        errors.push(`Too many attempts from this IP (${ipAttempts} in last hour)`);
      }
    }

    await this.validationRepo.save({
      userId,
      validationType: 'velocity_check',
      validationData: { hourlyCount, maxPerHour },
      passed: errors.length === 0,
      failureReason: errors.join(', ') || null,
    });

    return { valid: errors.length === 0, errors };
  }

  async validateIdempotency(
    idempotencyKey: string,
    operation: string,
    userId: string,
    requestPayload: any
  ): Promise<{ isDuplicate: boolean; existingResponse?: any }> {
    if (!idempotencyKey) {
      return { isDuplicate: false };
    }

    const existing = await this.idempotencyRepo.findOne({
      where: { key: idempotencyKey, operation }
    });

    if (existing?.isCompleted) {
      this.logger.warn(`Duplicate request detected: ${operation} with key ${idempotencyKey}`);
      return { isDuplicate: true, existingResponse: existing.responsePayload };
    }

    if (existing && !existing.isCompleted) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (existing.createdAt < fiveMinutesAgo) {
        await this.idempotencyRepo.remove(existing);
        return { isDuplicate: false };
      }
      return { isDuplicate: true, existingResponse: existing.responsePayload };
    }

    const newKey = this.idempotencyRepo.create({
      key: idempotencyKey,
      operation,
      userId,
      requestPayload,
      isCompleted: false,
    });
    await this.idempotencyRepo.save(newKey);

    return { isDuplicate: false };
  }

  async completeIdempotency(
    idempotencyKey: string,
    operation: string,
    responsePayload: any,
    statusCode: number = 200
  ): Promise<void> {
    await this.idempotencyRepo.update(
      { key: idempotencyKey, operation },
      {
        responsePayload,
        statusCode,
        isCompleted: true,
        completedAt: new Date(),
      }
    );
  }

  async checkFraudRisk(
    userId: string,
    amount: number,
    paymentMethodId?: string,
    request?: Request
  ): Promise<FraudRiskResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    const maxSingleAmount = this.configService.get<number>('PAYMENT_MAX_SINGLE_AMOUNT', 10000);
    if (amount > maxSingleAmount) {
      riskScore += 80;
      reasons.push(`Amount exceeds maximum allowed ($${maxSingleAmount})`);
    }

    if (amount <= 0) {
      riskScore += 100;
      reasons.push('Invalid payment amount');
    }

    const dailyLimit = this.configService.get<number>('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
    const dailyTransactions = await this.idempotencyRepo.count({
      where: {
        userId,
        operation: 'create_payment_intent',
        createdAt: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)) as any
      }
    });

    if (dailyTransactions > 10) {
      riskScore += 30;
      reasons.push('High transaction velocity (more than 10 payments in 24h)');
    }

    if (request) {
      const ip = request.ip || request.connection.remoteAddress;
      const ipRequests = await this.idempotencyRepo
        .createQueryBuilder('id')
        .where('id."metadata"->>\'ip\' = :ip', { ip })
        .andWhere('id."createdAt" >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
        .getCount();

      if (ipRequests > 5) {
        riskScore += 25;
        reasons.push('Multiple requests from same IP in 1 hour');
      }
    }

    if (paymentMethodId && paymentMethodId.startsWith('pm_fake')) {
      riskScore += 40;
      reasons.push('Test payment method detected');
    }

    const isBlocked = riskScore >= 70;
    const riskLevel: 'low' | 'medium' | 'high' = riskScore >= 70 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

    return { riskScore, isBlocked, reasons, riskLevel };
  }

  async validateCard(
    paymentMethodId: string,
    currency: string = 'usd'
  ): Promise<{ valid: boolean; paymentMethod?: Stripe.PaymentMethod; error?: string }> {
    try {
      if (!paymentMethodId) {
        return { valid: false, error: 'Payment method ID is required' };
      }

      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);

      if (paymentMethod.type !== 'card') {
        return { valid: false, error: 'Invalid payment method type' };
      }

      const card = paymentMethod.card;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (card) {
        if (card.exp_year < currentYear || 
            (card.exp_year === currentYear && card.exp_month < currentMonth)) {
          return { valid: false, error: 'Card is expired' };
        }

        if (!card.checks?.cvc_check || card.checks.cvc_check === 'fail') {
          return { valid: false, error: 'CVC verification failed' };
        }

        if (card.funding === 'prepaid') {
          await this.auditService.log(
            'suspicious_payment_method',
            null,
            'Payment',
            paymentMethodId,
            { cardFunding: card.funding, reason: 'Prepaid card funding type' }
          );
        }
      }

      return { valid: true, paymentMethod };
    } catch (error) {
      this.logger.error(`Card validation failed: ${(error as Error).message}`);
      return { valid: false, error: 'Failed to validate payment method' };
    }
  }

  async validateWebhookSignature(payload: Buffer, signature: string): Promise<boolean> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.error('Stripe webhook secret not configured');
      return false;
    }

    try {
      this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return true;
    } catch (error) {
      return false;
    }
  }
}