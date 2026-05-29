import { MenuItemEntity } from './menu-item.entity';
import { RestaurantEntity } from './restaurant.entity';
export declare enum ModerationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CHANGES_REQUESTED = "changes_requested"
}
export declare enum ModerationAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete"
}
export declare class MenuModerationEntity {
    id: string;
    menuItemId: string;
    menuItem: MenuItemEntity;
    restaurantId: string;
    restaurant: RestaurantEntity;
    action: ModerationAction;
    status: ModerationStatus;
    originalData: any;
    updatedData: any;
    rejectionReason: string;
    moderatorId: string;
    moderatorNotes: string;
    reviewedAt: Date;
    flaggedForReview: boolean;
    aiFlags: {
        priceAnomaly?: boolean;
        descriptionIssue?: boolean;
        imageProblem?: boolean;
        duplicateDetected?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
