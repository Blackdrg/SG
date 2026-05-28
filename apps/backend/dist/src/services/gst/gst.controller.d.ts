import { GSTService } from './gst.service';
export declare class GSTController {
    private readonly gstService;
    constructor(gstService: GSTService);
    calculateGST(orderId: string): Promise<GSTDetailEntity>;
    generateGSTInvoice(orderId: string): Promise<any>;
    getGSTRateSummary(orderId: string): Promise<any>;
    validateGSTIN(gstin: string): {
        valid: boolean;
    };
}
