import { OrderEntity } from './order.entity';
export declare class RefundApprovalEntity {
    id: string;
    order: OrderEntity;
    refundId: string;
    refundAmount: number;
    currency: string;
    reason: string;
    requestedBy: string;
    requestType: 'customer_request' | 'agent_initiated' | 'policy_exception' | 'dispute_resolution';
    approvalStatus: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed';
    approverId?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    approvalNotes?: string;
    processedAt?: Date;
    processedBy?: string;
    requiresManagerApproval: boolean;
    managerApproverId?: string;
    managerApprovedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
