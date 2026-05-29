import { DriverEntity } from './driver.entity';
export declare enum IncentiveType {
    PEAK_TIME_BONUS = "peak_time_bonus",
    WEEKLY_TARGET = "weekly_target",
    ON_TIME_DELIVERY = "on_time_delivery",
    CUSTOMER_RATING = "customer_rating",
    REFERRAL_BONUS = "referral_bonus"
}
export declare enum IncentiveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    PAID = "paid",
    REJECTED = "rejected"
}
export declare class DriverIncentiveEntity {
    id: string;
    driverId: string;
    driver: DriverEntity;
    type: IncentiveType;
    amount: number;
    status: IncentiveStatus;
    description: string;
    referenceId: string;
    approvedBy: string;
    approvedAt: Date;
    payoutReference: string;
    paidAt: Date;
    createdAt: Date;
}
