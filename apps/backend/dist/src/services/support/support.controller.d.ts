import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
export declare class SupportController {
    private supportService;
    private routingService;
    constructor(supportService: CustomerSupportService, routingService: TicketRoutingService);
    raiseDispute(body: {
        orderId: string;
        customerId: string;
        type: string;
        description: string;
    }): Promise<import("../../db/entities/dispute.entity").DisputeEntity>;
    getDisputes(query: any): Promise<import("../../db/entities/dispute.entity").DisputeEntity[]>;
    reviewDispute(id: string, body: any): Promise<import("../../db/entities/dispute.entity").DisputeEntity>;
    requestRefund(body: {
        orderId: string;
        requestedBy: string;
        type: string;
        amount: number;
        reason: string;
    }): Promise<import("../../db/entities/refund.entity").RefundEntity>;
    processRefund(id: string, body: {
        processedBy: string;
        paymentReference?: string;
    }): Promise<import("../../db/entities/refund.entity").RefundEntity>;
    getQueueStats(): Promise<any>;
    routeTicket(id: string): Promise<import("../../db/entities/support-ticket.entity").SupportTicketEntity>;
    escalateTicket(id: string, body: {
        level?: number;
    }): Promise<import("../../db/entities/support-ticket.entity").SupportTicketEntity>;
}
