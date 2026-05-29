import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { RestaurantGSTEntity } from './restaurant-gst.entity';
export declare class RestaurantEntity {
    id: string;
    name: string;
    slug: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    status: string;
    branches: RestaurantBranchEntity[];
    gstDetail?: RestaurantGSTEntity;
    createdAt: Date;
    updatedAt: Date;
}
