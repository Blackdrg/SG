import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class KitchenSLAEntity {
    id: string;
    metricName: string;
    value: number;
    unit: string;
    targetValue: number;
    targetUnit: string;
    measurementPeriod: string;
    measuredAt: Date;
    branch: RestaurantBranchEntity;
    createdAt: Date;
    updatedAt: Date;
}
