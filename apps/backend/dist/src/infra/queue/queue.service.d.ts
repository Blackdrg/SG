import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
export declare class QueueService {
    private readonly orderRepo;
    constructor(orderRepo: Repository<OrderEntity>);
    enqueue(queueName: string, data: any): Promise<void>;
}
