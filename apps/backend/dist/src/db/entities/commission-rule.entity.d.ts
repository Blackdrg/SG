import { RestaurantEntity } from './restaurant.entity';
export declare enum CommissionType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare enum CommissionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class CommissionRuleEntity {
    id: string;
    restaurantId: string;
    restaurant: RestaurantEntity;
    type: CommissionType;
    value: number;
    minOrderValue: number;
    maxOrderValue: number;
    validFrom: Date;
    validTo: Date;
    status: CommissionStatus;
    applicableCategories: string[];
    excludedItems: string[];
    createdAt: Date;
    updatedAt: Date;
}
