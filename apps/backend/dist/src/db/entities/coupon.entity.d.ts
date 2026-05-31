export declare enum CouponType {
    PERCENTAGE = "percentage",
    FIXED_AMOUNT = "fixed_amount",
    FREE_DELIVERY = "free_delivery",
    BOGO = "bogo"
}
export declare enum CouponStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    EXPIRED = "expired",
    DEPLETED = "depleted"
}
export declare enum CouponScope {
    GLOBAL = "global",
    RESTAURANT = "restaurant",
    CATEGORY = "category",
    ITEM = "item"
}
export declare class CouponEntity {
    id: string;
    code: string;
    type: CouponType;
    status: CouponStatus;
    scope: CouponScope;
    restaurantId: string;
    categoryId: string;
    itemId: string;
    discountValue: number;
    minOrderAmount: number;
    maxDiscountAmount: number;
    cashbackPercentage: number;
    maxCashbackAmount: number;
    usageLimit: number;
    usageCount: number;
    usagePerUser: number;
    applicableDays: string;
    applicableSlots: {
        startTime?: string;
        endTime?: string;
    };
    validFrom: Date;
    validUntil: Date;
    applicableForNewUsers: boolean;
    createdAt: Date;
    updatedAt: Date;
}
