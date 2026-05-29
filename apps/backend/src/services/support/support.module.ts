import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSupportService } from './customer-support.service';
import { TicketRoutingService } from './ticket-routing.service';
import { SupportController } from './support.controller';
import { DisputeEntity } from '../../db/entities/dispute.entity';
import { RefundEntity } from '../../db/entities/refund.entity';
import { SupportTicketEntity, TicketMessageEntity } from '../../db/entities/support-ticket.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { WalletModule } from '../wallet/wallet.module';
import { PaymentServiceModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DisputeEntity,
      RefundEntity,
      SupportTicketEntity,
      TicketMessageEntity,
      OrderEntity,
      UserEntity,
    ]),
    WalletModule,
    PaymentServiceModule,
  ],
  providers: [CustomerSupportService, TicketRoutingService],
  controllers: [SupportController],
  exports: [CustomerSupportService, TicketRoutingService],
})
export class SupportModule {}