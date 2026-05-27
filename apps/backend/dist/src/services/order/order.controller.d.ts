import { OrderService } from './order.service';
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    placeOrder(body: any, idempotencyKey?: string): Promise<import("../../shared/domain/order.interface").Order>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
