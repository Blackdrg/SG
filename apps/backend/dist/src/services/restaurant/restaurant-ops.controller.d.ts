import { RestaurantOpsService } from './restaurant-ops.service';
import { MenuModerationService } from './menu-moderation.service';
import { PayoutService } from './payout.service';
import { BranchManagementService } from './branch-management.service';
import { CommissionService } from './commission.service';
export declare class RestaurantOpsController {
    private opsService;
    private moderationService;
    private payoutService;
    private branchService;
    private commissionService;
    constructor(opsService: RestaurantOpsService, moderationService: MenuModerationService, payoutService: PayoutService, branchService: BranchManagementService, commissionService: CommissionService);
    startOnboarding(body: any): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    getOnboardingProgress(id: string): Promise<any>;
    updateOnboardingStep(id: string, body: {
        step: string;
        data?: any;
    }): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    completeOnboarding(id: string, req: any): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    submitForModeration(body: any): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity>;
    getPendingModerations(restaurantId?: string): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity[]>;
    reviewModeration(id: string, body: any, req: any): Promise<import("../../db/entities/menu-moderation.entity").MenuModerationEntity>;
    getPayoutHistory(restaurantId: string): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity[]>;
    generatePayout(body: {
        restaurantId: string;
        periodStart: string;
        periodEnd: string;
    }): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity>;
    processPayout(id: string, body: {
        reference: string;
    }): Promise<import("../../db/entities/payout-report.entity").PayoutReportEntity>;
    createBranch(body: any): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    updateBranch(id: string, body: any): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    toggleBranchStatus(id: string, body: {
        isOnline: boolean;
    }): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    getBranch(id: string): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity>;
    createCommissionRule(body: any): Promise<import("../../db/entities/commission-rule.entity").CommissionRuleEntity>;
    getCommissionRules(restaurantId: string): Promise<import("../../db/entities/commission-rule.entity").CommissionRuleEntity[]>;
    calculateCommission(body: {
        restaurantId: string;
        orderAmount: number;
    }): Promise<{
        commissionAmount: number;
    }>;
}
