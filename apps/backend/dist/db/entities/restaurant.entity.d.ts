import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class RestaurantEntity {
    id: string;
    name: string;
    slug: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    status: string;
    branches: RestaurantBranchEntity[];
    createdAt: Date;
    updatedAt: Date;
}
