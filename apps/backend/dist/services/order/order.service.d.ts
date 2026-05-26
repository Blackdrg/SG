import { Order } from '../../shared/domain/order.interface';
import { QueueService } from '../../infra/queue/queue.service';
export declare class OrderService {
    private readonly queueService;
    constructor(queueService: QueueService);
    placeOrder(orderData: any): Promise<Order>;
}
