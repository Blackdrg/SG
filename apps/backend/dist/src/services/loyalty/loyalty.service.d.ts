import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { CouponEntity } from '../../db/entities/coupon.entity';
import { CouponUsageEntity } from '../../db/entities/coupon-usage.entity';
import { ReferralEntity } from '../../db/entities/referral.entity';
import { SubscriptionEntity } from '../../db/entities/subscription.entity';
export declare class LoyaltyService {
    private couponRepo;
    private couponUsageRepo;
    private referralRepo;
    private subscriptionRepo;
    private userRepo;
    private orderRepo;
    private dataSource;
    private readonly logger;
    constructor(couponRepo: Repository<CouponEntity>, couponUsageRepo: Repository<CouponUsageEntity>, referralRepo: Repository<ReferralEntity>, subscriptionRepo: Repository<SubscriptionEntity>, userRepo: Repository<UserEntity>, orderRepo: Repository<OrderEntity>, dataSource: DataSource);
    createCoupon(data: any): Promise<CouponEntity>;
    applyCoupon(code: string, userId: string, orderAmount: number, orderId?: string): Promise<any>;
    generateReferralCode(userId: string): Promise<ReferralEntity>;
    processReferral(code: string, refereeId: string, firstOrderId: string): Promise<any>;
    processCashback(userId: string, orderId: string, orderAmount: number): Promise<any>;
    getWalletCashback(userId: string): Promise<any>;
    getReferralHistory(userId: string): Promise<any>;
    getAllCoupons(filters?: any): Promise<CouponEntity[]>;
    getCouponAnalytics(couponId: string): Promise<any>;
    deactivateCoupon(couponId: string): Promise<CouponEntity>;
}
