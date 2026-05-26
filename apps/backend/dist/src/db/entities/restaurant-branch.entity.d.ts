import { RestaurantEntity } from './restaurant.entity';
export declare class RestaurantBranchEntity {
    id: string;
    branchName: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    openingTime: string;
    closingTime: string;
    isOnline: boolean;
    restaurant: RestaurantEntity;
    categories: any[];
    createdAt: Date;
    updatedAt: Date;
}
