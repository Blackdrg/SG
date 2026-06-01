import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentService } from '../../services/payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { RetryService } from '../../services/payments/retry.service';
import { IdempotencyService } from '../../services/payments/idempotency.service';
import { ProductionNotificationService } from '../../services/notifications/production-notification.service';
import { LoggingService } from '../../logging/logging.service';
import { sanitizeForLog } from '../../logging/logging.service';
import * as crypto from 'crypto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly retryService: RetryService,
    private readonly idempotency: IdempotencyService,
    private readonly productionNotification: ProductionNotificationService,
    private readonly loggingService: LoggingService,
  ) {}

  validateOrderItems(items: unknown): void {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }
    for (const item of items) {
      if (!item || typeof item !== 'object') {
        throw new BadRequestException('Invalid order item');
      }
      const anyItem = item as any;
      if (!anyItem.id || typeof anyItem.id !== 'string' || anyItem.id.trim().length === 0) {
        throw new BadRequestException('Invalid order item ID');
      }
      if (!anyItem.name || typeof anyItem.name !== 'string' || anyItem.name.trim().length === 0) {
        throw new BadRequestException('Invalid order item name');
      }
      if (typeof anyItem.price !== 'number' || !Number.isFinite(anyItem.price) || anyItem.price < 0) {
        throw new BadRequestException('Invalid order item price');
      }
      if (!Number.isInteger(anyItem.quantity) || anyItem.quantity < 1) {
        throw new BadRequestException('Invalid order item quantity');
      }
    }
  }

  validateOrderTotals(orderData: any): boolean {
    const subtotal = Number(orderData.subtotal) || 0;
    const tax = Number(orderData.tax) || 0;
    const deliveryFee = Number(orderData.deliveryFee) || 0;
    const grandTotal = Number(orderData.grandTotal);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      throw new BadRequestException('Invalid subtotal');
    }
    if (!Number.isFinite(tax) || tax < 0) {
      throw new BadRequestException('Invalid tax');
    }
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
      throw new BadRequestException('Invalid delivery fee');
    }
    if (!Number.isFinite(grandTotal) || grandTotal <= 0) {
      throw new BadRequestException('Order total must be greater than zero');
    }
    const expectedTotal = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
    if (Math.abs(expectedTotal - grandTotal) > 0.01) {
      throw new BadRequestException('Order total does not match items');
    }
    return true;
  }

  async placeOrder(orderData: any, idempotencyKey?: string): Promise<Order> {
    if (!orderData.userId || !orderData.restaurantId || !orderData.grandTotal) {
      throw new BadRequestException('Missing required order data: userId, restaurantId, or grandTotal');
    }

    if (orderData.items) {
      this.validateOrderItems(orderData.items);
    }

    this.validateOrderTotals(orderData);

    if (idempotencyKey) {
      const existing = await this.idempotency.validateOrCreate(
        idempotencyKey,
        'place_order',
        orderData.userId,
        { restaurantId: orderData.restaurantId, grandTotal: orderData.grandTotal }
      );

      if (existing.isDuplicate && existing.response) {
        return existing.response;
      }
    }

    const orderId = crypto.randomUUID();
    const now = new Date();

    const order: Order = {
      id: orderId,
      userId: orderData.userId,
      restaurantId: orderData.restaurantId,
      driverId: orderData.driverId,
      orderNumber: `ORD-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${orderId.slice(0,6).toUpperCase()}`,
      status: OrderStatus.PLACED,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: Number(orderData.subtotal) || 0,
      tax: Number(orderData.tax) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      discount: Number(orderData.discount) || 0,
      tip: Number(orderData.tip) || 0,
      grandTotal: Number(orderData.grandTotal),
      couponId: orderData.couponId,
      deliveryAddressId: orderData.deliveryAddressId || '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      const savedOrder = await this.orderRepo.save(order);

      if (idempotencyKey) {
        await this.idempotency.complete(idempotencyKey, 'place_order', savedOrder);
      }

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Failed to place order', error, 'OrderService');
      if ((error as any)?.code === '23505') {
        throw new ConflictException('Order creation failed due to duplicate');
      }
      throw new InternalServerErrorException('Order placement failed due to internal processing error');
    }
  }

  async confirmPayment(orderId: string, paymentId: string, request?: any): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new ConflictException('Payment already confirmed for this order');
    }

    try {
      const paymentIntent = await this.paymentService.confirmPayment(paymentId, order.userId, request);

      order.paymentStatus = PaymentStatus.COMPLETED;
      order.status = OrderStatus.PAYMENT_CONFIRMED;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      await this.notificationService.sendPush(
        order.userId,
        'Payment Confirmed',
        `Your payment for order #${order.orderNumber} has been confirmed.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Payment confirmation failed', error, 'OrderService');

      order.paymentStatus = PaymentStatus.FAILED;
      order.updatedAt = new Date();
      await this.orderRepo.save(order);

      throw error;
    }
  }

  async handleWebhookDelayed(orderId: string, paymentId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return order;
    }

    if (order.paymentStatus === PaymentStatus.FAILED) {
      return order;
    }

    return this.confirmPayment(orderId, paymentId);
  }

  async refundAfterDispatch(orderId: string, reason: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const refundEligibleStatuses = [
      OrderStatus.ON_THE_WAY,
      OrderStatus.DELIVERED,
    ];

    if (!refundEligibleStatuses.includes(order.status)) {
      throw new BadRequestException(`Refund not allowed for order in ${order.status} status`);
    }

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      throw new ConflictException('Order already refunded');
    }

    try {
      const refund = await this.paymentService.refundPayment(
        order.id,
        order.grandTotal,
        order.userId,
        reason,
      );

      order.paymentStatus = PaymentStatus.REFUNDED;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      await this.notificationService.sendPush(
        order.userId,
        'Refund Initiated',
        `A refund has been initiated for order #${order.orderNumber}. Reason: ${reason}`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Refund failed', error, 'OrderService');
      throw new InternalServerErrorException('Refund processing failed');
    }
  }

  async cancelByDriver(orderId: string, driverId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.driverId !== driverId) {
      throw new BadRequestException('Driver not assigned to this order');
    }

    const cancellableStatuses = [
      OrderStatus.DRIVER_ASSIGNED,
      OrderStatus.PICKED_UP,
      OrderStatus.ON_THE_WAY,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order cannot be cancelled by driver in ${order.status} status`);
    }

    try {
      order.status = OrderStatus.CANCELLED;
      order.driverId = null;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      await this.notificationService.sendPush(
        order.userId,
        'Order Cancelled by Driver',
        `Your order #${order.orderNumber} has been cancelled by the driver.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Driver cancellation failed', error, 'OrderService');
      throw new InternalServerErrorException('Driver cancellation failed');
    }
  }

  async cancelByKitchen(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    const cancellableStatuses = [
      OrderStatus.RESTAURANT_ACCEPTED,
      OrderStatus.PREPARING,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Kitchen cannot cancel order in ${order.status} status`);
    }

    try {
      order.status = OrderStatus.CANCELLED;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      await this.notificationService.sendPush(
        order.userId,
        'Order Cancelled by Restaurant',
        `Your order #${order.orderNumber} has been cancelled by the restaurant.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Kitchen cancellation failed', error, 'OrderService');
      throw new InternalServerErrorException('Kitchen cancellation failed');
    }
  }

  async preventDoubleDispatch(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.driverId && order.status === OrderStatus.DRIVER_ASSIGNED) {
      throw new ConflictException('Driver already assigned to this order');
    }

    return order;
  }

  async retryOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (order.paymentStatus !== PaymentStatus.FAILED) {
      throw new BadRequestException('Order can only be retried for failed payments');
    }

    try {
      order.status = OrderStatus.PLACED;
      order.paymentStatus = PaymentStatus.PENDING;
      order.updatedAt = new Date();

      const savedOrder = await this.orderRepo.save(order);

      return savedOrder;
    } catch (error) {
      this.loggingService.secureError('[OrderService] Order retry failed', error, 'OrderService');
      throw new InternalServerErrorException('Order retry failed');
    }
  }

  async resolveStuckPreparingState(): Promise<Order[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const stuckOrders = await this.orderRepo.find({
      where: {
        status: OrderStatus.PREPARING,
        updatedAt: LessThan(thirtyMinutesAgo),
      },
    });

    const resolvedOrders = [];

    for (const order of stuckOrders) {
      try {
        order.status = OrderStatus.RESTAURANT_ACCEPTED;
        order.updatedAt = new Date();

        const savedOrder = await this.orderRepo.save(order);
        resolvedOrders.push(savedOrder);

        await this.notificationService.sendPush(
          order.userId,
          'Order Delayed',
          `Your order #${order.orderNumber} is experiencing delays. We're working on it.`,
          { orderId: order.id }
        );
      } catch (error) {
        this.loggingService.secureError('[OrderService] Failed to resolve stuck preparing state for order', {id: order.id, error}, 'OrderService');
      }
    }

    return resolvedOrders;
  }

  async getOrderWithLock(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' }
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }
}
