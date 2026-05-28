import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class SLAAlertEntity {
    id: string;
    branch: RestaurantBranchEntity;
    slaType: 'prep_time' | 'order_wait_time' | 'delivery_time' | 'food_quality';
}
