import { ChargebackService } from './chargeback.service';
export declare class ChargebackController {
    private readonly chargebackService;
    constructor(chargebackService: ChargebackService);
    getDisputeById(disputeId: string): Promise<PaymentDisputeEntity>;
    getDisputesForOrder(orderId: string): Promise<PaymentDisputeEntity[]>;
    getDisputesByStatus(status?: string, startDate?: string, endDate?: string): Promise<any>;
    initiateRefundForWonDispute(disputeId: string, body: any): Promise<any>;
    getDisputeStatsOverview(startDate?: string, endDate?: string): Promise<any>;
}
