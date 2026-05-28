import { RestaurantBranchEntity } from './restaurant-branch.entity';
export declare class HolidayScheduleEntity {
    id: string;
    branch: RestaurantBranchEntity;
    holidayName: string;
    startDate: Date;
    endDate: Date;
    scheduleType: 'closed' | 'limited_hours' | 'special_menu' | 'staff_holiday';
    openingTime?: string;
    closingTime?: string;
    isDeliveryAvailable?: boolean;
    isDineInAvailable?: boolean;
    isTakeawayAvailable?: boolean;
    specialInstructions?: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    createdAt: Date;
    updatedAt: Date;
}
