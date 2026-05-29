import { RestaurantOnboardingService } from './onboarding.service';
export declare class RestaurantOnboardingController {
    private readonly onboardingService;
    constructor(onboardingService: RestaurantOnboardingService);
    initializeOnboarding(restaurantId: string): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    updateStep(onboardingId: string, body: any): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    getOnboardingStatus(restaurantId: string): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    completeOnboarding(onboardingId: string, body: any): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    rejectOnboarding(onboardingId: string, body: any): Promise<import("../../db/entities/restaurant-onboarding.entity").RestaurantOnboardingEntity>;
    getOnboardingAnalytics(): Promise<any>;
}
