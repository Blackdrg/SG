import { DriverOnboardingService } from './driver-onboarding.service';
import { DriverPayoutService } from './driver-payout.service';
export declare class DriverOpsController {
    private onboardingService;
    private payoutService;
    constructor(onboardingService: DriverOnboardingService, payoutService: DriverPayoutService);
    startOnboarding(body: any): Promise<import("../../db/entities/driver.entity").DriverEntity>;
    uploadDocument(body: {
        driverId: string;
        type: string;
        url: string;
        expiryDate?: string;
    }): Promise<import("../../db/entities/driver-document.entity").DriverDocumentEntity>;
    getDocuments(driverId: string): Promise<import("../../db/entities/driver-document.entity").DriverDocumentEntity[]>;
    verifyDocument(id: string, body: {
        status: string;
        notes?: string;
        verifierId?: string;
    }): Promise<import("../../db/entities/driver-document.entity").DriverDocumentEntity>;
    getOnboardingStatus(id: string): Promise<any>;
    calculateIncentives(body: {
        driverId: string;
        weekStart: string;
    }): Promise<any>;
    generateIncentive(body: {
        driverId: string;
        type: string;
        amount: number;
        description: string;
    }): Promise<import("../../db/entities/driver-incentive.entity").DriverIncentiveEntity>;
    approveIncentive(id: string, body: {
        approverId: string;
    }): Promise<import("../../db/entities/driver-incentive.entity").DriverIncentiveEntity>;
    getPendingIncentives(driverId?: string): Promise<import("../../db/entities/driver-incentive.entity").DriverIncentiveEntity[]>;
}
