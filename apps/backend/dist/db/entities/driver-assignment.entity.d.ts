import { DriverEntity } from './driver.entity';
import { OrderEntity } from './order.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class DriverAssignmentEntity {
    id: string;
    driver: DriverEntity;
    order: OrderEntity;
    branch: RestaurantBranchEntity;
    assignmentType: 'single' | 'batch' | 'stacked';
    batchId: string;
    status: 'assigned' | 'accepted' | 'picked_up' | 'delivered' | 'failed' | 'reassigned';
    distance: number;
    estimatedTimeMinutes: number;
    actualTimeMinutes: number;
    routeData: {
        start: {
            lat: number;
            lng: number;
        };
        end: {
            lat: number;
            lng: number;
        };
        waypoints: Array<{
            lat: number;
            lng: number;
            timestamp: Date;
        }>;
    };
    isPriority: boolean;
    reassignedFrom: string;
    retryCount: number;
    createdAt: Date;
    updatedAt: Date;
}
