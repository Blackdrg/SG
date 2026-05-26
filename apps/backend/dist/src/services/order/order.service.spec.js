"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const order_service_1 = require("./order.service");
const queue_service_1 = require("../../infra/queue/queue.service");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const payments_service_1 = require("../../services/payments/payments.service");
const notification_service_1 = require("../../services/notifications/notification.service");
const order_interface_1 = require("../../shared/domain/order.interface");
const common_1 = require("@nestjs/common");
describe('OrderService - Production Ready Features', () => {
    let service;
    let queueService;
    let orderRepo;
    let paymentService;
    let notificationService;
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                order_service_1.OrderService,
                {
                    provide: queue_service_1.QueueService,
                    useValue: mockQueueService,
                },
                {
                    provide: (0, typeorm_1.getRepositoryToken)(order_entity_1.OrderEntity),
                    useValue: mockOrderRepo,
                },
                {
                    provide: payments_service_1.PaymentService,
                    useValue: mockPaymentService,
                },
                {
                    provide: notification_service_1.NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();
        service = module.get(order_service_1.OrderService);
        queueService = module.get(queue_service_1.QueueService);
        orderRepo = module.get((0, typeorm_1.getRepositoryToken)(order_entity_1.OrderEntity));
        paymentService = module.get(payments_service_1.PaymentService);
        notificationService = module.get(notification_service_1.NotificationService);
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
            });
            await expect(service.placeOrder(orderData)).rejects.toThrow(common_1.ConflictException);
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
                status: order_interface_1.OrderStatus.PLACED,
                paymentStatus: order_interface_1.PaymentStatus.PENDING,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
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
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
                status: order_interface_1.OrderStatus.PAYMENT_CONFIRMED,
            });
            await expect(service.confirmPayment(orderId, 'pi_123')).rejects.toThrow(common_1.ConflictException);
        });
        it('should handle delayed webhook gracefully', async () => {
            const orderId = 'order123';
            const paymentId = 'pi_123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.PENDING,
                status: order_interface_1.OrderStatus.PLACED,
                grandTotal: 50.0,
            });
            mockOrderRepo.save.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
                status: order_interface_1.OrderStatus.PAYMENT_CONFIRMED,
                grandTotal: 50.0,
                updatedAt: new Date(),
            });
            const result = await service.handleWebhookDelayed(orderId, paymentId);
            expect(result.paymentStatus).toBe(order_interface_1.PaymentStatus.COMPLETED);
            expect(result.status).toBe(order_interface_1.OrderStatus.PAYMENT_CONFIRMED);
        });
        it('should return current state if payment already confirmed during webhook delay', async () => {
            const orderId = 'order123';
            const paymentId = 'pi_123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
                status: order_interface_1.OrderStatus.PAYMENT_CONFIRMED,
                grandTotal: 50.0,
            });
            const result = await service.handleWebhookDelayed(orderId, paymentId);
            expect(result.paymentStatus).toBe(order_interface_1.PaymentStatus.COMPLETED);
        });
    });
    describe('Refund After Dispatch', () => {
        it('should allow refund for delivered orders', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
                status: order_interface_1.OrderStatus.DELIVERED,
                grandTotal: 50.0,
            });
            mockPaymentService.refundPayment.mockResolvedValueOnce({
                id: 're_123',
                status: 'succeeded',
                amount: 5000,
            });
            mockOrderRepo.save.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.REFUNDED,
                status: order_interface_1.OrderStatus.DELIVERED,
                grandTotal: 50.0,
                updatedAt: new Date(),
            });
            const result = await service.refundAfterDispatch(orderId, 'customer_request');
            expect(result.paymentStatus).toBe(order_interface_1.PaymentStatus.REFUNDED);
            expect(result.status).toBe(order_interface_1.OrderStatus.DELIVERED);
        });
        it('should prevent refund for orders not eligible for refund', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
                status: order_interface_1.OrderStatus.PREPARING,
                grandTotal: 50.0,
            });
            await expect(service.refundAfterDispatch(orderId, 'customer_request'))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('should prevent double refund', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.REFUNDED,
                status: order_interface_1.OrderStatus.DELIVERED,
                grandTotal: 50.0,
            });
            await expect(service.refundAfterDispatch(orderId, 'customer_request'))
                .rejects.toThrow(common_1.ConflictException);
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
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            });
            mockOrderRepo.save.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                driverId: null,
                status: order_interface_1.OrderStatus.CANCELLED,
                updatedAt: new Date(),
            });
            const result = await service.cancelByDriver(orderId, driverId);
            expect(result.status).toBe(order_interface_1.OrderStatus.CANCELLED);
        });
        it('should prevent driver from cancelling unassigned order', async () => {
            const orderId = 'order123';
            const driverId = 'driver456';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                driverId: 'different-driver',
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            });
            await expect(service.cancelByDriver(orderId, driverId))
                .rejects.toThrow(common_1.BadRequestException);
        });
        it('should allow kitchen to cancel preparing order', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                status: order_interface_1.OrderStatus.PREPARING,
            });
            mockOrderRepo.save.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                status: order_interface_1.OrderStatus.CANCELLED,
                updatedAt: new Date(),
            });
            const result = await service.cancelByKitchen(orderId);
            expect(result.status).toBe(order_interface_1.OrderStatus.CANCELLED);
        });
        it('should prevent kitchen from cancelling undeliverable order', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                status: order_interface_1.OrderStatus.DELIVERED,
            });
            await expect(service.cancelByKitchen(orderId))
                .rejects.toThrow(common_1.BadRequestException);
        });
    });
    describe('Double Dispatch Prevention', () => {
        it('should prevent assigning driver to already assigned order', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                driverId: 'driver456',
                status: order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            });
            await expect(service.preventDoubleDispatch(orderId))
                .rejects.toThrow(common_1.ConflictException);
        });
    });
    describe('Order Retry Mechanism', () => {
        it('should allow retry for failed payment orders', async () => {
            const orderId = 'order123';
            mockOrderRepo.findOne.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.FAILED,
                status: order_interface_1.OrderStatus.PLACED,
                grandTotal: 50.0,
            });
            mockOrderRepo.save.mockResolvedValueOnce({
                id: orderId,
                userId: 'user123',
                paymentStatus: order_interface_1.PaymentStatus.PENDING,
                status: order_interface_1.OrderStatus.PLACED,
                grandTotal: 50.0,
                updatedAt: new Date(),
            });
            const result = await service.retryOrder(orderId);
            expect(result.paymentStatus).toBe(order_interface_1.PaymentStatus.PENDING);
        });
    });
    describe('Stuck Order Resolution', () => {
        it('should resolve orders stuck in PREPARING state', async () => {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            mockOrderRepo.find.mockResolvedValueOnce([
                {
                    id: 'stuck-order-1',
                    userId: 'user123',
                    status: order_interface_1.OrderStatus.PREPARING,
                    updatedAt: thirtyMinutesAgo,
                },
            ]);
            mockOrderRepo.save.mockImplementation((order) => Promise.resolve({
                ...order,
                updatedAt: new Date(),
            }));
            const result = await service.resolveStuckPreparingState();
            expect(result).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=order.service.spec.js.map