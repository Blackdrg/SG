import { SearchService } from './search.service';
export declare class SearchController {
    private searchService;
    constructor(searchService: SearchService);
    search(query: string): Promise<{
        restaurants: import("../../db/entities/restaurant.entity").RestaurantEntity[];
        items: import("../../db/entities/menu-item.entity").MenuItemEntity[];
    }>;
    getTrending(): Promise<import("../../db/entities/menu-item.entity").MenuItemEntity[]>;
    getRecommended(req: any): Promise<import("../../db/entities/menu-item.entity").MenuItemEntity[]>;
}
