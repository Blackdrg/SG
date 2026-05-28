import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { OrderItemEntity } from './order-item.entity';
import { GSTDetailEntity } from './gst-detail.entity';
export declare class OrderEntity {
    id: string;
    items: OrderItemEntity[];
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
    gstDetail?: GSTDetailEntity;
    createdAt: Date;
    updatedAt: Date;
}
