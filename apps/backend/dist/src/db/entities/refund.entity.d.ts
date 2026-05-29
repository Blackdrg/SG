import { OrderEntity } from './order.entity';
import { UserEntity } from './user.entity';
export declare enum RefundType {
    CUSTOMER_REFUND = "customer_refund",
    RESTAURANT_PENALTY = "restaurant_penalty",
    DRIVER_DEDUCTION = "driver_deduction"
}
export declare enum RefundStatus {
    REQUESTED = "requested",
    APPROVED = "approved",
    PROCESSED = "processed",
    FAILED = "failed",
    REJECTED = "rejected"
}
export declare class RefundEntity {
    id: string;
    orderId: string;
    order: OrderEntity;
    requestedBy: string;
    requester: UserEntity;
    type: RefundType;
    amount: number;
    status: RefundStatus;
    reason: string;
    approvalNotes: string;
    approvedBy: string;
    approvedAt: Date;
    processedBy: string;
    processedAt: Date;
    paymentReference: string;
    rejectionReason: string;
    evidence: {
        images?: string[];
        notes?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
