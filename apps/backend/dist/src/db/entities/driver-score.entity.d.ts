import { DriverEntity } from './driver.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class DriverScoreEntity {
    id: string;
    driver: DriverEntity;
    branch: RestaurantBranchEntity;
    overallScore: number;
    onTimeDeliveryRate: number;
    acceptanceRate: number;
    cancellationRate: number;
    customerRating: number;
    totalDeliveries: number;
    totalDistance: number;
    averageSpeed: number;
    lastCalculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
