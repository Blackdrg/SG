import { OrderEntity } from './order.entity';
export declare class GSTDetailEntity {
    id: string;
    order: OrderEntity;
    orderId: string;
    taxableValue: number;
    cgstRate?: number;
    cgstAmount?: number;
    sgstRate?: number;
    sgstAmount?: number;
    igstRate?: number;
    igstAmount?: number;
    totalGstAmount: number;
    totalAmount: number;
    placeOfSupply: string;
    reverseChargeApplicable?: boolean;
    createdAt: Date;
}
