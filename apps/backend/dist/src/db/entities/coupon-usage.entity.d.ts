export declare enum CouponUsageStatus {
    ACTIVE = "active",
    USED = "used",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class CouponUsageEntity {
    id: string;
    couponId: string;
    userId: string;
    status: CouponUsageStatus;
    orderId: string;
    discountApplied: number;
    orderAmount: number;
    usedAt: Date;
}
