import { MenuItemEntity } from './menu-item.entity';
import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class MenuItemAvailabilityEntity {
    id: string;
    menuItem: MenuItemEntity;
    branch: RestaurantBranchEntity;
    isAvailable: boolean;
    unavailableReason?: string;
    unavailableSince?: Date;
    isAutoDisabled: boolean;
    autoDisabledAt?: Date;
    autoDisabledReason?: string;
    predictedAvailability?: Date;
    createdAt: Date;
    updatedAt: Date;
}
