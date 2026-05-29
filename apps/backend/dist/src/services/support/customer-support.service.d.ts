import { Repository, DataSource } from 'typeorm';
import { DisputeEntity, DisputeType, DisputeStatus } from '../../db/entities/dispute.entity';
import { RefundEntity, RefundStatus, RefundType } from '../../db/entities/refund.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { WalletService } from '../wallet/wallet.service';
import { PaymentService } from '../payments/payments.service';
export declare class CustomerSupportService {
    private disputeRepo;
    private refundRepo;
    private orderRepo;
    private walletService;
    private paymentService;
    private dataSource;
    private readonly logger;
    constructor(disputeRepo: Repository<DisputeEntity>, refundRepo: Repository<RefundEntity>, orderRepo: Repository<OrderEntity>, walletService: WalletService, paymentService: PaymentService, dataSource: DataSource);
    raiseDispute(orderId: string, customerId: string, type: DisputeType, description: string, evidence?: any): Promise<DisputeEntity>;
    getDisputes(filter?: {
        status?: DisputeStatus;
        customerId?: string;
        restaurantId?: string;
        driverId?: string;
    }): Promise<DisputeEntity[]>;
    reviewDispute(disputeId: string, reviewerId: string, status: DisputeStatus, notes?: string, creditAmount?: number): Promise<DisputeEntity>;
    private initiateRefund;
    requestRefund(orderId: string, requestedBy: string, type: RefundType, amount: number, reason: string, evidence?: any): Promise<RefundEntity>;
    processRefund(refundId: string, processedBy: string, paymentReference?: string): Promise<RefundEntity>;
    getRefunds(filter?: {
        status?: RefundStatus;
        orderId?: string;
    }): Promise<RefundEntity[]>;
    getDisputeStats(startDate?: Date, endDate?: Date): Promise<any>;
    private getAverageResolutionTime;
}
