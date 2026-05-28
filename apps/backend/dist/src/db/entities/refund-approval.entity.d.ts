import { OrderEntity } from './order/order.entity';
export declare class RefundApprovalEntity {
    id: string;
    order: OrderEntity;
    refundId: string;
}
