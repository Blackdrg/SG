import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { QueueService } from '../../infra/queue/queue.service';
import { QUEUE_NAMES } from '../../shared/contracts/queues';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentService } from '../../services/payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
import * as crypto from 'crypto';

@Injectable()
export class OrderService {
  constructor(
    private readonly queueService: QueueService,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
  ) {}

  async placeOrder(orderData: any): Promise<Order> {
    // Validate required fields
    if (!orderData.userId || !orderData.restaurantId || !orderData.grandTotal) {
      throw new BadRequestException('Missing required order data: userId, restaurantId, or grandTotal');
    }

    if (orderData.grandTotal <= 0) {
      throw new BadRequestException('Order total must be greater than zero');
    }

    // Check for duplicate order (based on userId, restaurantId, and timestamp within 5 seconds)
    const duplicateCheck = await this.orderRepo.findOne({
      where: {
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        createdAt: new Date(Date.now() - 5000), // Last 5 seconds
      },
      order: { createdAt: 'DESC' },
    });

    if (duplicateCheck) {
      throw new ConflictException('Duplicate order detected. Please wait before placing another order.');
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
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      tip: orderData.tip || 0,
      grandTotal: orderData.grandTotal,
      couponId: orderData.couponId,
      deliveryAddressId: orderData.deliveryAddressId || '',
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Save order to database first
      const savedOrder = await this.orderRepo.save(order);
      
      // Enqueue order lifecycle event
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId: savedOrder.id,
        status: savedOrder.status,
        userId: savedOrder.userId,
        restaurantId: savedOrder.restaurantId,
      });

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Failed to place order:', error);
      if ((error as any)?.code === '23505') { // Unique violation
        throw new ConflictException('Order creation failed due to duplicate');
      }
      throw new InternalServerErrorException('Order placement failed due to internal processing error');
    }
  }

  async confirmPayment(orderId: string, paymentId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Prevent double payment confirmation
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      throw new ConflictException('Payment already confirmed for this order');
    }

    try {
      // Confirm payment with Stripe
      const paymentIntent = await this.paymentService.confirmPayment(paymentId, order.userId);
      
      // Update order status
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.status = OrderStatus.PAYMENT_CONFIRMED;
      order.updatedAt = new Date();
      
      const savedOrder = await this.orderRepo.save(order);
      
      // Enqueue next lifecycle step
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId: savedOrder.id,
        status: savedOrder.status,
        userId: savedOrder.userId,
        restaurantId: savedOrder.restaurantId,
      });

      // Send notification
      await this.notificationService.sendPush(
        order.userId,
        'Payment Confirmed',
        `Your payment for order #${order.orderNumber} has been confirmed.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Payment confirmation failed:', error);
      
      // Update payment status to failed
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

    // If payment already confirmed, return current state
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return order;
    }

    // If payment failed, return current state
    if (order.paymentStatus === PaymentStatus.FAILED) {
      return order;
    }

    // Process delayed webhook
    return this.confirmPayment(orderId, paymentId);
  }

  async refundAfterDispatch(orderId: string, reason: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Only allow refund if order is delivered or out for delivery
    const refundEligibleStatuses = [
      OrderStatus.ON_THE_WAY,
      OrderStatus.DELIVERED,
    ];

    if (!refundEligibleStatuses.includes(order.status)) {
      throw new BadRequestException(`Refund not allowed for order in ${order.status} status`);
    }

    // Prevent double refund
    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      throw new ConflictException('Order already refunded');
    }

    try {
      // Process refund through payment service
      const refund = await this.paymentService.refundPayment(
        // Assuming we have payment intent ID stored somewhere - for now using orderId as reference
        order.id, // This would be the actual payment intent ID in production
        order.grandTotal,
        order.userId,
        reason,
      );

      // Update order status
      order.paymentStatus = PaymentStatus.REFUNDED;
      // Keep delivery status but mark as refunded
      order.updatedAt = new Date();
      
      const savedOrder = await this.orderRepo.save(order);
      
      // Send notification
      await this.notificationService.sendPush(
        order.userId,
        'Refund Initiated',
        `A refund of $${order.grandTotal} has been initiated for order #${order.orderNumber}. Reason: ${reason}`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Refund failed:', error);
      throw new InternalServerErrorException('Refund processing failed');
    }
  }

  async cancelByDriver(orderId: string, driverId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Verify driver assignment
    if (order.driverId !== driverId) {
      throw new BadRequestException('Driver not assigned to this order');
    }

    // Only allow cancellation in certain states
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
      order.driverId = null; // Unassign driver
      order.updatedAt = new Date();
      
      const savedOrder = await this.orderRepo.save(order);
      
      // Enqueue cancellation event
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId: savedOrder.id,
        status: savedOrder.status,
        userId: savedOrder.userId,
        restaurantId: savedOrder.restaurantId,
      });

      // Send notifications
      await this.notificationService.sendPush(
        order.userId,
        'Order Cancelled by Driver',
        `Your order #${order.orderNumber} has been cancelled by the driver.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Driver cancellation failed:', error);
      throw new InternalServerErrorException('Driver cancellation failed');
    }
  }

  async cancelByKitchen(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Only allow kitchen cancellation in preparation states
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
      
      // Enqueue cancellation event
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId: savedOrder.id,
        status: savedOrder.status,
        userId: savedOrder.userId,
        restaurantId: savedOrder.restaurantId,
      });

      // Send notifications
      await this.notificationService.sendPush(
        order.userId,
        'Order Cancelled by Restaurant',
        `Your order #${order.orderNumber} has been cancelled by the restaurant.`,
        { orderId: order.id }
      );

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Kitchen cancellation failed:', error);
      throw new InternalServerErrorException('Kitchen cancellation failed');
    }
  }

  async preventDoubleDispatch(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Prevent double dispatch by checking if driver already assigned
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

    // Only allow retry for failed payments
    if (order.paymentStatus !== PaymentStatus.FAILED) {
      throw new BadRequestException('Order can only be retried for failed payments');
    }

    try {
      // Reset order to placed status for retry
      order.status = OrderStatus.PLACED;
      order.paymentStatus = PaymentStatus.PENDING;
      order.updatedAt = new Date();
      
      const savedOrder = await this.orderRepo.save(order);
      
      // Enqueue retry event
      await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
        orderId: savedOrder.id,
        status: savedOrder.status,
        userId: savedOrder.userId,
        restaurantId: savedOrder.restaurantId,
      });

      return savedOrder;
    } catch (error) {
      console.error('[OrderService] Order retry failed:', error);
      throw new InternalServerErrorException('Order retry failed');
    }
  }

  async resolveStuckPreparingState(): Promise<Order[]> {
    // Find orders stuck in PREPARING state for more than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const stuckOrders = await this.orderRepo.find({
      where: {
        status: OrderStatus.PREPARING,
        updatedAt: thirtyMinutesAgo,
      },
    });

    const resolvedOrders = [];

    for (const order of stuckOrders) {
      try {
        // Move stuck orders back to restaurant accepted for retry
        order.status = OrderStatus.RESTAURANT_ACCEPTED;
        order.updatedAt = new Date();
        
        const savedOrder = await this.orderRepo.save(order);
        resolvedOrders.push(savedOrder);
        
        // Enqueue state change event
        await this.queueService.enqueue(QUEUE_NAMES.ORDER_LIFECYCLE, {
          orderId: savedOrder.id,
          status: savedOrder.status,
          userId: savedOrder.userId,
          restaurantId: savedOrder.restaurantId,
        });

        // Send notification
        await this.notificationService.sendPush(
          order.userId,
          'Order Delayed',
          `Your order #${order.orderNumber} is experiencing delays. We're working on it.`,
          { orderId: order.id }
        );
      } catch (error) {
        console.error('[OrderService] Failed to resolve stuck preparing state for order:', order.id, error);
        // Continue processing other orders
      }
    }

    return resolvedOrders;
  }

  async getOrderWithLock(orderId: string): Promise<Order> {
    // For distributed locking in production, we would use Redis or database locks
    // For now, we'll use a simple approach with optimistic locking via updatedAt
    const order = await this.orderRepo.findOne({ 
      where: { id: orderId },
      lock: { mode: 'pessimistic_write' } // This would work with PostgreSQL
    });
    
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    
    return order;
  }
}
