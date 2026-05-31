import { Repository, DataSource } from 'typeorm';
import { RestaurantOnboardingEntity, OnboardingStep } from '../../db/entities/restaurant-onboarding.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
export declare class RestaurantOnboardingService {
    private readonly onboardingRepo;
    private readonly restaurantRepo;
    private readonly dataSource;
    private readonly logger;
    constructor(onboardingRepo: Repository<RestaurantOnboardingEntity>, restaurantRepo: Repository<RestaurantEntity>, dataSource: DataSource);
    private getOnboardingByRestaurantId;
    initializeOnboarding(restaurantId: string): Promise<RestaurantOnboardingEntity>;
    updateStep(onboardingId: string, step: OnboardingStep, data?: any): Promise<RestaurantOnboardingEntity>;
    getOnboardingStatus(restaurantId: string): Promise<RestaurantOnboardingEntity>;
    completeOnboarding(onboardingId: string, reviewedBy: string): Promise<RestaurantOnboardingEntity>;
    rejectOnboarding(onboardingId: string, reviewedBy: string, reason: string): Promise<RestaurantOnboardingEntity>;
    submitGSTConfig(restaurantId: string, gstData: any): Promise<RestaurantOnboardingEntity>;
    setupPricing(restaurantId: string, pricing: any): Promise<RestaurantOnboardingEntity>;
    setupPayout(restaurantId: string, payout: any): Promise<RestaurantOnboardingEntity>;
    getOnboardingAnalytics(): Promise<any>;
    private getAverageCompletionTime;
}
