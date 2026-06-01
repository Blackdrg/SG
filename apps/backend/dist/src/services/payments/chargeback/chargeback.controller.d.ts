import { ChargebackService } from './chargeback.service';
export declare class ChargebackController {
    private readonly chargebackService;
    constructor(chargebackService: ChargebackService);
    getDisputeById(disputeId: string): Promise<import("../../../db/entities/payment-dispute.entity").PaymentDisputeEntity>;
    getDisputesForOrder(orderId: string): Promise<import("../../../db/entities/payment-dispute.entity").PaymentDisputeEntity[]>;
    getDisputesByStatus(status?: string, startDate?: string, endDate?: string): Promise<any>;
    getDisputeStatsOverview(startDate?: string, endDate?: string): Promise<any>;
}
