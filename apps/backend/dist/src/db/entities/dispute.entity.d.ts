import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';
export declare enum DisputeType {
    QUALITY = "quality",
    LATE_DELIVERY = "late_delivery",
    WRONG_ITEM = "wrong_item",
    DAMAGED_ITEM = "damaged_item",
    MISSING_ITEM = "missing_item",
    OVERCHARGED = "overcharged"
}
export declare enum DisputeStatus {
    RAISED = "raised",
    UNDER_REVIEW = "under_review",
    RESOLVED_CREDIT = "resolved_credit",
    RESOLVED_REFUND = "resolved_refund",
    RESOLVED_REPLACE = "resolved_replace",
    REJECTED = "rejected",
    CLOSED = "closed"
}
export declare class DisputeEntity {
    id: string;
    orderId: string;
    order: OrderEntity;
    customerId: string;
    customer: UserEntity;
    restaurantId: string;
    driverId: string;
    type: DisputeType;
    status: DisputeStatus;
    description: string;
    resolutionNotes: string;
    creditAmount: number;
    resolvedBy: string;
    resolvedAt: Date;
    evidence: {
        images?: string[];
        videos?: string[];
        notes?: string;
    };
    escalated: boolean;
    escalatedAt: Date;
    escalatedTo: string;
    createdAt: Date;
    updatedAt: Date;
}
