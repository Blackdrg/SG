import { Repository, DataSource } from 'typeorm';
import { MenuModerationEntity, ModerationStatus, ModerationAction } from '../../db/entities/menu-moderation.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class MenuModerationService {
    private moderationRepo;
    private itemRepo;
    private restaurantRepo;
    private dataSource;
    private readonly logger;
    constructor(moderationRepo: Repository<MenuModerationEntity>, itemRepo: Repository<MenuItemEntity>, restaurantRepo: Repository<RestaurantEntity>, dataSource: DataSource);
    submitForModeration(menuItemId: string, restaurantId: string, action: ModerationAction, data: any, originalData?: any): Promise<MenuModerationEntity>;
    private detectAIFlags;
    private shouldFlagForReview;
    getPendingModerations(restaurantId?: string, priorityOnly?: boolean): Promise<MenuModerationEntity[]>;
    reviewModeration(moderationId: string, moderatorId: string, status: ModerationStatus, notes?: string): Promise<MenuModerationEntity>;
    bulkApprove(moderationIds: string[], moderatorId: string): Promise<void>;
    getModerationStats(restaurantId?: string): Promise<any>;
    private getAverageReviewTime;
}
