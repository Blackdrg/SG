import { Module, Global } from '@nestjs/common';
import { QueueService } from './queue.service';
import { OrderProcessor } from './order.processor';

@Global()
@Module({
  providers: [QueueService, OrderProcessor],
  exports: [QueueService, OrderProcessor],
})
export class QueueModule {}
