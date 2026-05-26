import { RestaurantService } from './restaurant.service';
export declare class RestaurantController {
    private restaurantService;
    constructor(restaurantService: RestaurantService);
    getNearby(lat: string, lng: string, radius?: string): Promise<import("../../db/entities/restaurant-branch.entity").RestaurantBranchEntity[]>;
    getDetails(slug: string): Promise<import("../../db/entities/restaurant.entity").RestaurantEntity>;
    updateStatus(id: string, body: {
        isOnline: boolean;
    }): Promise<import("typeorm").UpdateResult>;
}
