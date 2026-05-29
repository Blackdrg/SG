import { TaxReportingService } from './tax-reporting.service';
import { ReconciliationService } from './reconciliation.service';
export declare class FinanceController {
    private taxService;
    private reconciliationService;
    constructor(taxService: TaxReportingService, reconciliationService: ReconciliationService);
    getGSTReport(restaurantId: string, month: string, year: string): Promise<any>;
    reconcilePayments(body: {
        startDate: string;
        endDate: string;
    }): Promise<any>;
    reconcilePayouts(body: {
        restaurantId: string;
        startDate: string;
        endDate: string;
    }): Promise<any>;
    reconcileDriverPayments(body: {
        driverId: string;
        startDate: string;
        endDate: string;
    }): Promise<any>;
    runFullReconciliation(body: {
        startDate: string;
        endDate: string;
    }): Promise<any>;
}
