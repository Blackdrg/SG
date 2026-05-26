import { Order } from '../../shared/domain/order.interface';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentService } from '../../services/payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
export declare class OrderService {
    private readonly orderRepo;
    private readonly paymentService;
    private readonly notificationService;
    constructor(orderRepo: Repository<OrderEntity>, paymentService: PaymentService, notificationService: NotificationService);
    placeOrder(orderData: any): Promise<Order>;
    confirmPayment(orderId: string, paymentId: string, request?: any): Promise<Order>;
    handleWebhookDelayed(orderId: string, paymentId: string): Promise<Order>;
    refundAfterDispatch(orderId: string, reason: string): Promise<Order>;
    cancelByDriver(orderId: string, driverId: string): Promise<Order>;
    cancelByKitchen(orderId: string): Promise<Order>;
    preventDoubleDispatch(orderId: string): Promise<Order>;
    retryOrder(orderId: string): Promise<Order>;
    resolveStuckPreparingState(): Promise<Order[]>;
    getOrderWithLock(orderId: string): Promise<Order>;
}
