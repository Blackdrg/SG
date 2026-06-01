import { Repository } from 'typeorm';
import { RefundEntity } from '../../db/entities/refund.entity';
import { RefundApprovalEntity } from '../../db/entities/refund-approval.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { PaymentService } from '../payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { LedgerService } from '../../modules/ledger/ledger.service';
import { ProductionNotificationService } from '../../services/notifications/production-notification.service';
import { ConfigService } from '@nestjs/config';
export declare enum RefundRequestType {
    CUSTOMER_REQUEST = "customer_request",
    AGENT_INITIATED = "agent_initiated",
    POLICY_EXCEPTION = "policy_exception",
    DISPUTE_RESOLUTION = "dispute_resolution"
}
export declare class RefundService {
    private readonly refundRepo;
    private readonly refundApprovalRepo;
    private readonly orderRepo;
    private readonly userRepo;
    private readonly paymentService;
    private readonly notificationService;
    private readonly ledgerService;
    private readonly productionNotification;
    private readonly configService;
    private readonly logger;
    constructor(refundRepo: Repository<RefundEntity>, refundApprovalRepo: Repository<RefundApprovalEntity>, orderRepo: Repository<OrderEntity>, userRepo: Repository<UserEntity>, paymentService: PaymentService, notificationService: NotificationService, ledgerService: LedgerService, productionNotification: ProductionNotificationService, configService: ConfigService);
    createRefundRequest(orderId: string, requestedBy: string, amount: number, reason: string, requestType?: RefundRequestType): Promise<RefundApprovalEntity>;
    approveRefundRequest(approvalId: string, approverId: string, notes?: string): Promise<RefundApprovalEntity>;
    rejectRefundRequest(approvalId: string, approverId: string, reason: string): Promise<RefundApprovalEntity>;
    processRefund(approvalId: string, processedBy: string, gatewayName?: string): Promise<{
        refund: RefundEntity;
        approval: RefundApprovalEntity;
    }>;
    getRefundRequest(approvalId: string): Promise<RefundApprovalEntity>;
    getRefundRequestsForOrder(orderId: string): Promise<RefundApprovalEntity[]>;
    getRefundRequestsByStatus(status: 'pending' | 'approved' | 'rejected' | 'processed' | 'failed'): Promise<RefundApprovalEntity[]>;
    private isRefundEligible;
    private mapRequestTypeToRefundType;
    private notifyRefundRequest;
    private notifyRefundApproval;
    private notifyRefundRejection;
    private notifyRefundProcessed;
}
