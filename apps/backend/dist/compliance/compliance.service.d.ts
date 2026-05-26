export declare class ComplianceService {
    private readonly logger;
    applyDataRetentionPolicies(): Promise<void>;
    shouldRetainUserData(userId: string): Promise<boolean>;
    getRetentionStatistics(): Promise<any>;
}
