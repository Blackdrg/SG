import { RestaurantEntity } from './restaurant.entity';
export declare enum PayoutStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    PAID = "paid",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class PayoutReportEntity {
    id: string;
    restaurantId: string;
    restaurant: RestaurantEntity;
    periodStart: Date;
    periodEnd: Date;
    grossSales: number;
    platformCommission: number;
    gstAmount: number;
    cancellationFees: number;
    incentives: number;
    penalties: number;
    netPayout: number;
    status: PayoutStatus;
    payoutReference: string;
    payoutDate: Date;
    orderBreakdown: {
        totalOrders: number;
        completedOrders: number;
        cancelledOrders: number;
        refundedOrders: number;
    };
    paymentBreakdown: {
        onlinePayments: number;
        codPayments: number;
        walletPayments: number;
    };
    createdAt: Date;
}
