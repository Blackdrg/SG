import { RestaurantBranchEntity } from './restaurant-branch.entity';
import { OrderEntity } from './order.entity';
export declare class SLAAlertEntity {
    id: string;
    branch: RestaurantBranchEntity;
    slaType: 'prep_time' | 'order_wait_time' | 'delivery_time' | 'food_quality' | 'prep_delay';
    targetValue: number;
    actualValue: number;
    isBreached: boolean;
    breachSeverity?: 'low' | 'medium' | 'high';
    relatedOrderId?: string;
    relatedOrder?: OrderEntity;
    isNotified: boolean;
    notifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
