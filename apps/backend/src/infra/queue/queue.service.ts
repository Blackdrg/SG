import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus } from '../../shared/domain/order.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {}

  async enqueue(queueName: string, data: any) {
    // In-memory simulation of queue processing for now
    console.log(`[QueueService] Processing job for ${queueName}:`, data);
    
    if (queueName === 'ORDER_LIFECYCLE') {
      const { orderId, status } = data;
      await this.orderRepo.update(orderId, { status });
      console.log(`[QueueService] Order ${orderId} status updated to ${status}`);
    }
  }
}
