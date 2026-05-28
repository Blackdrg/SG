import { OrderEntity } from './order/order.entity';
export declare class PaymentDisputeEntity {
    id: string;
    order: OrderEntity;
    disputeId: string;
}
