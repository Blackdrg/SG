import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTopDishes(restaurantId?: string, period?: string): Promise<any>;
    getChurnAnalysis(restaurantId?: string, period?: string): Promise<any>;
    getRepeatUsers(restaurantId?: string, period?: string): Promise<any>;
    getConversion(restaurantId?: string, period?: string): Promise<any>;
    getHeatmap(restaurantId?: string, period?: string): Promise<any>;
    getPeakHours(restaurantId?: string, period?: string): Promise<any>;
    getRestaurantAnalytics(id: string): Promise<any>;
    getPlatformAnalytics(): Promise<any>;
}
