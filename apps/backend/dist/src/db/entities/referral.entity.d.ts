import { UserEntity } from './user.entity';
export declare enum ReferralStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
export declare enum ReferralRewardType {
    WALLET_CASHBACK = "wallet_cashback",
    SUBSCRIPTION_DISCOUNT = "subscription_discount",
    FREE_DELIVERY = "free_delivery",
    BOTH = "both"
}
export declare class ReferralEntity {
    id: string;
    code: string;
    referrerId: string;
    referrer: UserEntity;
    refereeId: string;
    referee: UserEntity;
    status: ReferralStatus;
    rewardType: ReferralRewardType;
    referrerReward: number;
    refereeReward: number;
    refereeFirstOrderId: string;
    completedAt: Date;
    rewardGivenAt: Date;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
