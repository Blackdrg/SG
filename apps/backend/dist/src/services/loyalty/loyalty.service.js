"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LoyaltyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../db/entities/user.entity");
const order_entity_1 = require("../../db/entities/order.entity");
const coupon_entity_1 = require("../../db/entities/coupon.entity");
const coupon_usage_entity_1 = require("../../db/entities/coupon-usage.entity");
const referral_entity_1 = require("../../db/entities/referral.entity");
const subscription_entity_1 = require("../../db/entities/subscription.entity");
let LoyaltyService = LoyaltyService_1 = class LoyaltyService {
    constructor(couponRepo, couponUsageRepo, referralRepo, subscriptionRepo, userRepo, orderRepo, dataSource) {
        this.couponRepo = couponRepo;
        this.couponUsageRepo = couponUsageRepo;
        this.referralRepo = referralRepo;
        this.subscriptionRepo = subscriptionRepo;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(LoyaltyService_1.name);
    }
    async createCoupon(data) {
        const coupon = this.couponRepo.create(data);
        return this.couponRepo.save(coupon);
    }
    async applyCoupon(code, userId, orderAmount, orderId) {
        const coupon = await this.couponRepo.findOne({ where: { code: code.toUpperCase() } });
        if (!coupon)
            throw new common_1.BadRequestException('Invalid coupon code');
        if (coupon.status !== 'active')
            throw new common_1.BadRequestException('Coupon is not active');
        if (new Date() > coupon.validUntil)
            throw new common_1.BadRequestException('Coupon has expired');
        if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit)
            throw new common_1.BadRequestException('Coupon usage limit reached');
        const userUsage = await this.couponUsageRepo.count({
            where: { couponId: coupon.id, userId, status: 'used' }
        });
        if (userUsage >= coupon.usagePerUser)
            throw new common_1.BadRequestException('You have already used this coupon');
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            throw new common_1.BadRequestException(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
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
        if (coupon.usageCount >= coupon.usageLimit)
            coupon.status = 'depleted';
        await this.couponRepo.save(coupon);
        return { discount, finalAmount: orderAmount - discount, couponId: coupon.id };
    }
    async generateReferralCode(userId) {
        const existing = await this.referralRepo.findOne({ where: { referrerId: userId } });
        if (existing)
            return existing;
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
    async processReferral(code, refereeId, firstOrderId) {
        const referral = await this.referralRepo.findOne({ where: { code: code.toUpperCase() } });
        if (!referral)
            throw new common_1.BadRequestException('Invalid referral code');
        if (referral.referrerId === refereeId)
            throw new common_1.BadRequestException('Cannot refer yourself');
        if (new Date() > referral.expiresAt)
            throw new common_1.BadRequestException('Referral code has expired');
        if (referral.status === 'completed')
            throw new common_1.BadRequestException('Referral already completed');
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
    async processCashback(userId, orderId, orderAmount) {
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
        }
        else {
            cashbackAmount = (orderAmount * 2) / 100;
            if (cashbackAmount > 20)
                cashbackAmount = 20;
        }
        return { cashbackAmount, applied: cashbackAmount > 0 };
    }
    async getWalletCashback(userId) {
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
    async getReferralHistory(userId) {
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
    async getAllCoupons(filters) {
        const query = this.couponRepo.createQueryBuilder('coupon');
        if (filters?.status)
            query.andWhere('coupon.status = :status', { status: filters.status });
        if (filters?.scope)
            query.andWhere('coupon.scope = :scope', { scope: filters.scope });
        return query.orderBy('coupon.createdAt', 'DESC').getMany();
    }
    async getCouponAnalytics(couponId) {
        const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
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
    async deactivateCoupon(couponId) {
        const coupon = await this.couponRepo.findOne({ where: { id: couponId } });
        if (!coupon)
            throw new common_1.NotFoundException('Coupon not found');
        coupon.status = 'inactive';
        return this.couponRepo.save(coupon);
    }
};
exports.LoyaltyService = LoyaltyService;
exports.LoyaltyService = LoyaltyService = LoyaltyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.CouponEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_usage_entity_1.CouponUsageEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(referral_entity_1.ReferralEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_entity_1.SubscriptionEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], LoyaltyService);
//# sourceMappingURL=loyalty.service.js.map