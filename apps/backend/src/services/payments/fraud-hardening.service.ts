import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { PaymentFraudFlagEntity } from './payment-fraud.entity';
import { AuditService } from '../../audit/audit.service';

export interface FraudCheckContext {
  userId: string;
  amount: number;
  paymentIntentId?: string;
  orderId?: string;
  ipAddress?: string;
  userAgent?: string;
  cardInfo?: { bin?: string; last4?: string; brand?: string; funding?: string };
}

export interface FraudCheckResult {
  allowed: boolean;
  riskScore: number;
  reasons: string[];
  blockDurationMinutes?: number;
}

@Injectable()
export class FraudHardeningService {
  private readonly logger = new Logger(FraudHardeningService.name);

  constructor(
    private configService: ConfigService,
    private auditService: AuditService,
    @InjectRepository(PaymentFraudFlagEntity)
    private readonly fraudFlagRepo: Repository<PaymentFraudFlagEntity>,
  ) {}

  async checkPaymentFraud(context: FraudCheckContext): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    const velocityCheck = await this.checkVelocity(context.userId, context.amount);
    if (!velocityCheck.allowed) {
      riskScore += velocityCheck.riskScore;
      reasons.push(...velocityCheck.reasons);
    }

    const patternCheck = await this.checkSuspiciousPatterns(context);
    if (!patternCheck.allowed) {
      riskScore += patternCheck.riskScore;
      reasons.push(...patternCheck.reasons);
    }

    const blockThreshold = this.configService.get<number>('PAYMENT_FRAUD_BLOCK_THRESHOLD', 70);
    const allowed = riskScore < blockThreshold;

    if (!allowed) {
      await this.flagFraudulentActivity({
        ...context,
        riskScore,
        reasons,
      });
    }

    return { allowed, riskScore, reasons };
  }

  private async checkVelocity(userId: string, amount: number): Promise<{ allowed: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    const hourlyTransactions = await this.fraudFlagRepo.count({
      where: {
        userId,
        createdAt: MoreThanOrEqual(new Date(Date.now() - 60 * 60 * 1000)) as any
      }
    });

    const dailyLimit = this.configService.get<number>('PAYMENT_DAILY_LIMIT_PER_USER', 50000);
    const maxTransactionsPerHour = this.configService.get<number>('PAYMENT_MAX_TRANSACTIONS_PER_HOUR', 10);

    if (hourlyTransactions > maxTransactionsPerHour) {
      riskScore += 20;
      reasons.push(`High transaction velocity (${hourlyTransactions} transactions in last hour)`);
    }

    const recentAmount = await this.fraudFlagRepo
      .createQueryBuilder('f')
      .select('SUM(f.amount)', 'total')
      .where('f.userId = :userId', { userId })
      .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      .getRawOne();

    const dailyTotal = Number(recentAmount?.total || 0) + amount;
    if (dailyTotal > dailyLimit) {
      riskScore += 40;
      reasons.push(`Daily limit exceeded ($${dailyTotal} > $${dailyLimit})`);
    }

    return { allowed: riskScore < 70, riskScore, reasons };
  }

  private async checkSuspiciousPatterns(context: FraudCheckContext): Promise<{ allowed: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    const ipCheck = await this.checkIpReputation(context.ipAddress);
    if (ipCheck) {
      riskScore += 15;
      reasons.push('Suspicious IP address detected');
    }

    if (context.cardInfo?.funding === 'prepaid') {
      riskScore += 10;
      reasons.push('Prepaid card detected');
    }

    if (context.amount && context.amount <= this.configService.get<number>('PAYMENT_MIN_AMOUNT', 5)) {
      const smallAmountCount = await this.fraudFlagRepo
        .createQueryBuilder('f')
        .where('f.userId = :userId', { userId: context.userId })
        .andWhere('f.amount = :amount', { amount: context.amount })
        .andWhere('f.createdAt >= :since', { since: new Date(Date.now() - 60 * 60 * 1000) })
        .getCount();
      if (smallAmountCount > 5) {
        riskScore += 30;
        reasons.push('Potential card testing with small amounts');
      }
    }

    return { allowed: riskScore < 70, riskScore, reasons };
  }

  private async checkIpReputation(ipAddress: string): Promise<boolean> {
    if (!ipAddress) return false;

    const suspiciousPatterns = [
      '10.', 
      '192.168.',
      '172.16.', 
    ];

    return suspiciousPatterns.some(pattern => ipAddress.startsWith(pattern));
  }

  private async flagFraudulentActivity(data: {
    userId: string;
    amount: number;
    paymentIntentId?: string;
    orderId?: string;
    ipAddress?: string;
    userAgent?: string;
    cardInfo?: any;
    riskScore: number;
    reasons: string[];
  }): Promise<PaymentFraudFlagEntity> {
    const flag = this.fraudFlagRepo.create({
      userId: data.userId,
      paymentIntentId: data.paymentIntentId,
      orderId: data.orderId,
      flagType: this.determineFlagType(data.riskScore, data.reasons),
      amount: data.amount,
      riskScore: data.riskScore,
      evidence: {
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        ...data.cardInfo,
      },
      isBlocked: data.riskScore >= 70,
      blockedAt: data.riskScore >= 70 ? new Date() : undefined,
    });

    const saved = await this.fraudFlagRepo.save(flag);

    if (data.riskScore >= 50) {
      await this.auditService.log(
        'fraud_flag_raised',
        data.userId,
        'Payment',
        data.paymentIntentId,
        {
          riskScore: data.riskScore,
          reasons: data.reasons,
          flagType: flag.flagType,
        }
      );
    }

    return saved;
  }

  private determineFlagType(riskScore: number, reasons: string[]): PaymentFraudFlagEntity['flagType'] {
    const reasonsStr = reasons.join(' ').toLowerCase();
    
    if (reasonsStr.includes('velocity') || reasonsStr.includes('transactions')) {
      return 'velocity_abuse';
    }
    if (reasonsStr.includes('testing') || reasonsStr.includes('small amount')) {
      return 'card_testing';
    }
    if (reasonsStr.includes('prepaid')) {
      return 'high_risk_card';
    }
    if (reasonsStr.includes('ip')) {
      return 'suspicious_pattern';
    }
    
    return 'other';
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    const recentBlock = await this.fraudFlagRepo.findOne({
      where: {
        userId,
        isBlocked: true,
        blockedAt: MoreThanOrEqual(new Date(Date.now() - 60 * 60 * 1000)) as any
      }
    });

    return !!recentBlock;
  }

  async getFraudHistory(userId: string, limit: number = 50): Promise<PaymentFraudFlagEntity[]> {
    return this.fraudFlagRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getFraudStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalFlags, blockedUsers, recentFlags, weeklyFlags] = await Promise.all([
      this.fraudFlagRepo.count(),
      this.fraudFlagRepo
        .createQueryBuilder('f')
        .select('COUNT(DISTINCT f.userId)', 'count')
        .where('f.isBlocked = :blocked', { blocked: true })
        .andWhere('f.blockedAt >= :since', { since: twentyFourHoursAgo })
        .getRawOne()
        .then(r => Number(r?.count || 0)),
      this.fraudFlagRepo.count({
        where: { createdAt: MoreThanOrEqual(twentyFourHoursAgo) as any }
      }),
      this.fraudFlagRepo.count({
        where: { createdAt: MoreThanOrEqual(sevenDaysAgo) as any }
      }),
    ]);

    return {
      totalFraudFlags: totalFlags,
      blockedUsersLast24h: blockedUsers,
      fraudFlagsLast24h: recentFlags,
      fraudFlagsLast7d: weeklyFlags,
    };
  }
}