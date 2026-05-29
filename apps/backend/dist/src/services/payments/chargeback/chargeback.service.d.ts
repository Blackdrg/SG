import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentDisputeEntity } from '../../db/entities/payment-dispute.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { NotificationService } from '../../notifications/notification.service';
import { ProductionNotificationService } from '../../notifications/production-notification.service';
export declare class ChargebackService {
    private configService;
    private readonly disputeRepo;
    private readonly orderRepo;
    private readonly userRepo;
    private readonly notificationService;
    private readonly productionNotification;
    private readonly logger;
    private stripe;
    constructor(configService: ConfigService, disputeRepo: Repository<PaymentDisputeEntity>, orderRepo: Repository<OrderEntity>, userRepo: Repository<UserEntity>, notificationService: NotificationService, productionNotification: ProductionNotificationService);
    handleDisputeCreated(event: any): Promise<PaymentDisputeEntity>;
    handleDisputeClosed(event: any): Promise<PaymentDisputeEntity>;
    getDisputeById(disputeId: string): Promise<PaymentDisputeEntity>;
    getDisputesForOrder(orderId: string): Promise<PaymentDisputeEntity[]>;
    getDisputesByStatus(status: string): Promise<PaymentDisputeEntity[]>;
    private mapStripeDisputeStatus;
    getDisputeStats(startDate?: Date, endDate?: Date): Promise<any>;
}
