import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
export declare class OrderEntity {
    id: string;
    items: any[];
    userId: string;
    restaurantId: string;
    driverId: string;
    orderNumber: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId: string;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    tip: number;
    grandTotal: number;
    couponId: string;
    deliveryAddressId: string;
    createdAt: Date;
    updatedAt: Date;
}
