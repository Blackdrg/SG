/** @jest-environment node */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { QueueService } from '../../infra/queue/queue.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { PaymentService } from '../../services/payments/payments.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('OrderService - Production Ready Features', () => {
  let service: OrderService;
  let queueService: QueueService;
  let orderRepo: Repository<OrderEntity>;
  let paymentService: PaymentService;
  let notificationService: NotificationService;

  const mockQueueService = {
    enqueue: jest.fn().mockResolvedValue(true),
  };

  const mockOrderRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockPaymentService = {
    confirmPayment: jest.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' }),
    refundPayment: jest.fn().mockResolvedValue({ id: 're_123', status: 'succeeded' }),
  };

  const mockNotificationService = {
    sendPush: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: QueueService,
          useValue: mockQueueService,
        },
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockOrderRepo,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    queueService = module.get<QueueService>(QueueService);
    orderRepo = module.get<Repository<OrderEntity>>(getRepositoryToken(OrderEntity));
    paymentService = module.get<PaymentService>(PaymentService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  describe('Duplicate Order Prevention', () => {
    it('should prevent duplicate orders within 5 seconds', async () => {
      const orderData = {
        userId: 'user123',
        restaurantId: 'rest456',
        grandTotal: 50.0,
      };

      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: 'existing-order-id',
        userId: 'user123',
        restaurantId: 'rest456',
        createdAt: new Date(Date.now() - 2000),
      } as any);

      await expect(service.placeOrder(orderData)).rejects.toThrow(ConflictException);
    });

    it('should allow order after 5 seconds', async () => {
      const orderData = {
        userId: 'user123',
        restaurantId: 'rest456',
        grandTotal: 50.0,
      };

      mockOrderRepo.findOne.mockResolvedValueOnce(null);
      mockOrderRepo.save.mockResolvedValueOnce({
        id: 'new-order-id',
        ...orderData,
        orderNumber: 'ORD-20260526-ABC123',
        status: OrderStatus.PLACED,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.placeOrder(orderData);
      expect(result).toBeDefined();
      expect(result.id).toBe('new-order-id');
    });
  });

  describe('Payment Confirmation & Webhook Handling', () => {
    it('should prevent double payment confirmation', async () => {
      const orderId = 'order123';
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.COMPLETED,
        status: OrderStatus.PAYMENT_CONFIRMED,
      } as any);

      await expect(service.confirmPayment(orderId, 'pi_123')).rejects.toThrow(ConflictException);
    });

    it('should handle delayed webhook gracefully', async () => {
      const orderId = 'order123';
      const paymentId = 'pi_123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PLACED,
        grandTotal: 50.0,
      } as any);
      
      mockOrderRepo.save.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.COMPLETED,
        status: OrderStatus.PAYMENT_CONFIRMED,
        grandTotal: 50.0,
        updatedAt: new Date(),
      } as any);

      const result = await service.handleWebhookDelayed(orderId, paymentId);
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
      expect(result.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
    });

    it('should return current state if payment already confirmed during webhook delay', async () => {
      const orderId = 'order123';
      const paymentId = 'pi_123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.COMPLETED,
        status: OrderStatus.PAYMENT_CONFIRMED,
        grandTotal: 50.0,
      } as any);

      const result = await service.handleWebhookDelayed(orderId, paymentId);
      expect(result.paymentStatus).toBe(PaymentStatus.COMPLETED);
    });
  });

  describe('Refund After Dispatch', () => {
    it('should allow refund for delivered orders', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.COMPLETED,
        status: OrderStatus.DELIVERED,
        grandTotal: 50.0,
      } as any);
      
      mockPaymentService.refundPayment.mockResolvedValueOnce({
        id: 're_123',
        status: 'succeeded',
        amount: 5000,
      } as any);
      
      mockOrderRepo.save.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.REFUNDED,
        status: OrderStatus.DELIVERED,
        grandTotal: 50.0,
        updatedAt: new Date(),
      } as any);

      const result = await service.refundAfterDispatch(orderId, 'customer_request');
      expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('should prevent refund for orders not eligible for refund', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.COMPLETED,
        status: OrderStatus.PREPARING,
        grandTotal: 50.0,
      } as any);

      await expect(service.refundAfterDispatch(orderId, 'customer_request'))
        .rejects.toThrow(BadRequestException);
    });

    it('should prevent double refund', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.REFUNDED,
        status: OrderStatus.DELIVERED,
        grandTotal: 50.0,
      } as any);

      await expect(service.refundAfterDispatch(orderId, 'customer_request'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('Driver & Kitchen Cancellation', () => {
    it('should allow driver to cancel assigned order', async () => {
      const orderId = 'order123';
      const driverId = 'driver456';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        driverId: driverId,
        status: OrderStatus.DRIVER_ASSIGNED,
      } as any);
      
      mockOrderRepo.save.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        driverId: null,
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      } as any);

      const result = await service.cancelByDriver(orderId, driverId);
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should prevent driver from cancelling unassigned order', async () => {
      const orderId = 'order123';
      const driverId = 'driver456';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        driverId: 'different-driver',
        status: OrderStatus.DRIVER_ASSIGNED,
      } as any);

      await expect(service.cancelByDriver(orderId, driverId))
        .rejects.toThrow(BadRequestException);
    });

    it('should allow kitchen to cancel preparing order', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        status: OrderStatus.PREPARING,
      } as any);
      
      mockOrderRepo.save.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        status: OrderStatus.CANCELLED,
        updatedAt: new Date(),
      } as any);

      const result = await service.cancelByKitchen(orderId);
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should prevent kitchen from cancelling undeliverable order', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        status: OrderStatus.DELIVERED,
      } as any);

      await expect(service.cancelByKitchen(orderId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('Double Dispatch Prevention', () => {
    it('should prevent assigning driver to already assigned order', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        driverId: 'driver456',
        status: OrderStatus.DRIVER_ASSIGNED,
      } as any);

      await expect(service.preventDoubleDispatch(orderId))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('Order Retry Mechanism', () => {
    it('should allow retry for failed payment orders', async () => {
      const orderId = 'order123';
      
      mockOrderRepo.findOne.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.FAILED,
        status: OrderStatus.PLACED,
        grandTotal: 50.0,
      } as any);
      
      mockOrderRepo.save.mockResolvedValueOnce({
        id: orderId,
        userId: 'user123',
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PLACED,
        grandTotal: 50.0,
        updatedAt: new Date(),
      } as any);

      const result = await service.retryOrder(orderId);
      expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    });
  });

  describe('Stuck Order Resolution', () => {
    it('should resolve orders stuck in PREPARING state', async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      mockOrderRepo.find.mockResolvedValueOnce([
        {
          id: 'stuck-order-1',
          userId: 'user123',
          status: OrderStatus.PREPARING,
          updatedAt: thirtyMinutesAgo,
        } as any,
      ]);
      
      mockOrderRepo.save.mockImplementation((order: any) => Promise.resolve({
        ...order,
        updatedAt: new Date(),
      } as any));

      const result = await service.resolveStuckPreparingState();
      expect(result).toHaveLength(1);
    });
  });
});