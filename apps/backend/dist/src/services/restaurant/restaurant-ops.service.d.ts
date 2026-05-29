import { Repository, DataSource } from 'typeorm';
import { RestaurantOnboardingEntity, OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { UserEntity } from '../../db/entities/user.entity';
export declare class RestaurantOpsService {
    private onboardingRepo;
    private restaurantRepo;
    private branchRepo;
    private itemRepo;
    private categoryRepo;
    private userRepo;
    private dataSource;
    private readonly logger;
    constructor(onboardingRepo: Repository<RestaurantOnboardingEntity>, restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, itemRepo: Repository<MenuItemEntity>, categoryRepo: Repository<MenuCategoryEntity>, userRepo: Repository<UserEntity>, dataSource: DataSource);
    startOnboarding(userId: string, restaurantData: {
        name: string;
        slug: string;
        description?: string;
        businessDetails?: any;
    }): Promise<RestaurantOnboardingEntity>;
    updateStep(onboardingId: string, step: OnboardingStep, data?: any): Promise<RestaurantOnboardingEntity>;
    completeOnboarding(onboardingId: string, userId: string): Promise<RestaurantOnboardingEntity>;
    getOnboardingProgress(onboardingId: string): Promise<any>;
}
