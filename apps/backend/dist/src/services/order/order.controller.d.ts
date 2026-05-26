import { OrderService } from './order.service';
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    placeOrder(req: any, body: any): Promise<import("../../shared/domain/order.interface").Order>;
}
