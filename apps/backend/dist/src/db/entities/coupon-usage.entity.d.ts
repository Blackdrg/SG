import { CouponEntity } from './coupon.entity';
import { UserEntity } from './user.entity';
export declare enum CouponUsageStatus {
    ACTIVE = "active",
    USED = "used",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class CouponUsageEntity {
    id: string;
    coupon: CouponEntity;
    couponId: string;
    user: UserEntity;
    userId: string;
    status: CouponUsageStatus;
    orderId: string;
    discountApplied: number;
    orderAmount: number;
    usedAt: Date;
}
