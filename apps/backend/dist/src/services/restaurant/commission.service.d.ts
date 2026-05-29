import { Repository, DataSource } from 'typeorm';
import { CommissionRuleEntity, CommissionType } from '../../db/entities/commission-rule.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class CommissionService {
    private commissionRepo;
    private restaurantRepo;
    private dataSource;
    private readonly logger;
    constructor(commissionRepo: Repository<CommissionRuleEntity>, restaurantRepo: Repository<RestaurantEntity>, dataSource: DataSource);
    createCommissionRule(restaurantId: string, ruleData: {
        type: CommissionType;
        value: number;
        minOrderValue?: number;
        maxOrderValue?: number;
        validFrom?: Date;
        validTo?: Date;
        applicableCategories?: string[];
    }): Promise<CommissionRuleEntity>;
    getCommissionRules(restaurantId: string, activeOnly?: boolean): Promise<CommissionRuleEntity[]>;
    calculateCommission(restaurantId: string, orderAmount: number, categoryId?: string): Promise<number>;
    updateCommissionRule(ruleId: string, updateData: Partial<CommissionRuleEntity>): Promise<CommissionRuleEntity>;
    deactivateRule(ruleId: string): Promise<CommissionRuleEntity>;
    getCommissionHistory(restaurantId: string, limit?: number): Promise<any[]>;
}
