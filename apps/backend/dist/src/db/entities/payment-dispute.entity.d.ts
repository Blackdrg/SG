import { OrderEntity } from './order.entity';
export declare class PaymentDisputeEntity {
    id: string;
    order: OrderEntity;
    orderId: string;
    disputeId: string;
    disputeType: string;
    disputedAmount: number;
    currency: string;
    reason: string;
    evidence?: any;
    status: 'warning' | 'needs_response' | 'under_review' | 'won' | 'lost';
    chargedBackAmount?: number;
    chargedBackAt?: Date;
    isRefundedToCustomer: boolean;
    refundedAt?: Date;
    refundedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
