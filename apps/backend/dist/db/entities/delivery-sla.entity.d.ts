import { DriverEntity } from './driver.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class DeliverySLAEntity {
    id: string;
    driver: DriverEntity;
    branch: RestaurantBranchEntity;
    metricName: string;
    value: number;
    unit: string;
    targetValue: number;
    targetUnit: string;
    measurementPeriod: string;
    measuredAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
