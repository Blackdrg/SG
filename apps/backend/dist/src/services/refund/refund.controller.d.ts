import { RefundService } from './refund.service';
export declare class RefundController {
    private readonly refundService;
    constructor(refundService: RefundService);
    createRefundRequest(body: any): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity>;
    approveRefundRequest(approvalId: string, body: any): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity>;
    rejectRefundRequest(approvalId: string, body: any): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity>;
    processRefund(approvalId: string, body: any): Promise<{
        refund: import("../../db/entities/refund.entity").RefundEntity;
        approval: import("../../db/entities/refund-approval.entity").RefundApprovalEntity;
    }>;
    getRefundRequest(approvalId: string): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity>;
    getRefundRequestsForOrder(orderId: string): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity[]>;
    getRefundRequestsByStatus(status?: string): Promise<import("../../db/entities/refund-approval.entity").RefundApprovalEntity[]>;
}
