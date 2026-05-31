import { LoyaltyService } from './loyalty.service';
export declare class LoyaltyController {
    private readonly loyaltyService;
    constructor(loyaltyService: LoyaltyService);
    createCoupon(data: any): Promise<import("../../db/entities/coupon.entity").CouponEntity>;
    applyCoupon(body: {
        code: string;
        userId: string;
        orderAmount: number;
        orderId?: string;
    }): Promise<any>;
    getCoupons(filters: any): Promise<import("../../db/entities/coupon.entity").CouponEntity[]>;
    getCouponAnalytics(id: string): Promise<any>;
    deactivateCoupon(id: string): Promise<import("../../db/entities/coupon.entity").CouponEntity>;
    generateReferralCode(body: {
        userId: string;
    }): Promise<import("../../db/entities/referral.entity").ReferralEntity>;
    processReferral(body: {
        code: string;
        refereeId: string;
        firstOrderId: string;
    }): Promise<any>;
    getReferralHistory(userId: string): Promise<any>;
    processCashback(body: {
        userId: string;
        orderId: string;
        orderAmount: number;
    }): Promise<any>;
    getWalletCashback(userId: string): Promise<any>;
}
