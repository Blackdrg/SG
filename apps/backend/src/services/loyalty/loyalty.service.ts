import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { CouponEntity } from '../../db/entities/coupon.entity';
import { CouponUsageEntity } from '../../db/entities/coupon-usage.entity';
import { ReferralEntity } from '../../db/entities/referral.entity';
import { SubscriptionEntity } from '../../db/entities/subscription.entity';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @InjectRepository(CouponEntity) private couponRepo: Repository<CouponEntity>,
    @InjectRepository(CouponUsageEntity) private couponUsageRepo: Repository<CouponUsageEntity>,
    @InjectRepository(ReferralEntity) private referralRepo: Repository<ReferralEntity>,
    @InjectRepository(SubscriptionEntity) private subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(OrderEntity) private orderRepo: Repository<OrderEntity>,
    private dataSource: DataSource,
  ) {}

  async createCoupon(data: any): Promise<CouponEntity> {
    const coupon = this.couponRepo.create(data);
    return this.couponRepo.save(coupon);
  }

  async applyCoupon(code: string, userId: string, orderAmount: number, orderId?: string): Promise<any> {
    const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new BadRequestException('Invalid coupon code');

    if (coupon.status !== 'active') throw new BadRequestException('Coupon is not active');
    if (new Date() > coupon.validUntil) throw new BadRequestException('Coupon has expired');
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');

    const userUsage = await this.couponUsageRepo.count({
      where: { couponId: coupon.id, userId, status: 'used' }
    });
    if (userUsage >= coupon.usagePerUser) throw new BadRequestException('You have already used this coupon');

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
    }

    let discount = 0;
    switch (coupon.type) {
      case 'percentage':
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
        break;
      case 'fixed_amount':
        discount = coupon.discountValue;
        break;
      case 'free_delivery':
        discount = 40;
        break;
    }

    const usage = this.couponUsageRepo.create({
      couponId: coupon.id,
      userId,
      orderId,
      discountApplied: discount,
      orderAmount,
      status: 'used',
    });
    await this.couponUsageRepo.save(usage);

    coupon.usageCount++;
    if (coupon.usageCount >= coupon.usageLimit) coupon.status = 'depleted';
    await this.couponRepo.save(coupon);

    return { discount, finalAmount: orderAmount - discount, couponId: coupon.id };
  }

  async generateReferralCode(userId: string): Promise<ReferralEntity> {
    const existing = await this.referralRepo.findOne({ where: { referrerId: userId } });
    if (existing) return existing;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    const code = `SG${user.email.substring(0, 3).toUpperCase()}${Date.now().toString(36).toUpperCase().slice(-4)}`;

    const referral = this.referralRepo.create({
      code,
      referrerId: userId,
      refereeId: '',
      status: 'pending',
      rewardType: 'wallet_cashback',
      referrerReward: 50,
      refereeReward: 50,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return this.referralRepo.save(referral);
  }

  async processReferral(code: string, refereeId: string, firstOrderId: string): Promise<any> {
    const referral = await this.referralRepo.findOne({ where: { code: code.toUpperCase() } });
    if (!referral) throw new BadRequestException('Invalid referral code');
    if (referral.referrerId === refereeId) throw new BadRequestException('Cannot refer yourself');
    if (new Date() > referral.expiresAt) throw new BadRequestException('Referral code has expired');
    if (referral.status === 'completed') throw new BadRequestException('Referral already completed');

    referral.refereeId = refereeId;
    referral.refereeFirstOrderId = firstOrderId;
    referral.status = 'completed';
    referral.completedAt = new Date();
    referral.rewardGivenAt = new Date();
    await this.referralRepo.save(referral);

    return {
      referrerReward: referral.referrerReward,
      refereeReward: referral.refereeReward,
      message: 'Referral completed. Rewards processed on next payout cycle.',
    };
  }

  async processCashback(userId: string, orderId: string, orderAmount: number): Promise<any> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, status: 'active' }
    });

    let cashbackAmount = 0;
    if (subscription) {
      const benefits = subscription.benefits || {};
      cashbackAmount = (orderAmount * (benefits.cashbackPercentage || 5)) / 100;
      if (benefits.maxCashback && cashbackAmount > benefits.maxCashback) {
        cashbackAmount = benefits.maxCashback;
      }
    } else {
      cashbackAmount = (orderAmount * 2) / 100;
      if (cashbackAmount > 20) cashbackAmount = 20;
    }

    return { cashbackAmount, applied: cashbackAmount > 0 };
  }

  async getWalletCashback(userId: string): Promise<any> {
    const usages = await this.couponUsageRepo.find({
      where: { userId, status: 'used' },
      order: { usedAt: 'DESC' },
      take: 50,
    });

    const totalCashback = usages.reduce((sum, u) => sum + (u.discountApplied || 0), 0);

    return {
      totalCashback,
      transactionCount: usages.length,
      recentTransactions: usages.slice(0, 10),
    };
  }

  async getReferralHistory(userId: string): Promise<any> {
    const sent = await this.referralRepo.find({
      where: { referrerId: userId },
      order: { createdAt: 'DESC' },
    });
    const received = await this.referralRepo.find({
      where: { refereeId: userId },
      order: { createdAt: 'DESC' },
    });

    return {
      totalSent: sent.length,
      totalCompleted: sent.filter(r => r.status === 'completed').length,
      totalEarned: sent
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.referrerReward, 0),
      sentReferrals: sent,
      receivedReferrals: received,
    };
  }

  async getAllCoupons(filters?: any): Promise<CouponEntity[]> {
    const query = this.couponRepo.createQueryBuilder('coupon');
    if (filters?.status) query.andWhere('coupon.status = :status', { status: filters.status });
    if (filters?.scope) query.andWhere('coupon.scope = :scope', { scope: filters.scope });
    return query.orderBy('coupon.createdAt', 'DESC').getMany();
  }

  async getCouponAnalytics(couponId: string): Promise<any> {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const usages = await this.couponUsageRepo.find({
      where: { couponId },
      order: { usedAt: 'DESC' },
    });

    const totalDiscount = usages.reduce((sum, u) => sum + (u.discountApplied || 0), 0);
    const totalOrders = usages.filter(u => u.orderId).length;

    return {
      coupon,
      totalUsages: usages.length,
      totalDiscountGiven: totalDiscount,
      totalOrdersGenerated: totalOrders,
      usageTrend: usages.slice(0, 30),
    };
  }

  async deactivateCoupon(couponId: string): Promise<CouponEntity> {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.status = 'inactive';
    return this.couponRepo.save(coupon);
  }
}
