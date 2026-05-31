import { DriverEntity } from './driver.entity';
export declare enum DriverPenaltyType {
    LATE_PICKUP = "late_pickup",
    LATE_DELIVERY = "late_delivery",
    CUSTOMER_CANCELLATION = "customer_cancellation",
    RESTAURANT_CANCELLATION = "restaurant_cancellation",
    ROUTE_DEVIATION = "route_deviation",
    FAKE_DELIVERY = "fake_delivery",
    UNAUTHORIZED_ACTION = "unauthorized_action",
    DAMAGE_COMPLAINT = "damage_complaint"
}
export declare enum DriverPenaltyStatus {
    ISSUED = "issued",
    PENDING = "pending",
    PAID = "paid",
    WAIVED = "waived",
    DISPUTED = "disputed"
}
export declare class DriverPenaltyEntity {
    id: string;
    driverId: string;
    driver: DriverEntity;
    type: DriverPenaltyType;
    amount: number;
    orderId: string;
    description: string;
    status: DriverPenaltyStatus;
    issuedBy: string;
    paidAt: Date;
    waivedAt: Date;
    waivedBy: string;
    waiverReason: string;
    disputeReason: string;
    createdAt: Date;
    updatedAt: Date;
}
