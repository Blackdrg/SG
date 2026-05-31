export declare enum DriverShiftStatus {
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class DriverShiftEntity {
    id: string;
    driverId: string;
    startTime: Date;
    endTime: Date;
    status: DriverShiftStatus;
    totalEarnings: number;
    totalDeliveries: number;
    totalDistance: number;
    totalHours: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
