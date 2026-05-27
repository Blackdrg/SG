"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const order_interface_1 = require("../../shared/domain/order.interface");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../db/entities/order.entity");
const payments_service_1 = require("../../services/payments/payments.service");
const notification_service_1 = require("../../services/notifications/notification.service");
const retry_service_1 = require("../../services/payments/retry.service");
const idempotency_service_1 = require("../../services/payments/idempotency.service");
const production_notification_service_1 = require("../../services/notifications/production-notification.service");
const crypto = require("crypto");
let OrderService = class OrderService {
    constructor(orderRepo, paymentService, notificationService, retryService, idempotency, productionNotification) {
        this.orderRepo = orderRepo;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
        this.retryService = retryService;
        this.idempotency = idempotency;
        this.productionNotification = productionNotification;
    }
    async placeOrder(orderData, idempotencyKey) {
        if (!orderData.userId || !orderData.restaurantId || !orderData.grandTotal) {
            throw new common_1.BadRequestException('Missing required order data: userId, restaurantId, or grandTotal');
        }
        if (orderData.grandTotal <= 0) {
            throw new common_1.BadRequestException('Order total must be greater than zero');
        }
        if (idempotencyKey) {
            const existing = await this.idempotency.validateOrCreate(idempotencyKey, 'place_order', orderData.userId, { restaurantId: orderData.restaurantId, grandTotal: orderData.grandTotal });
            if (existing.isDuplicate && existing.response) {
                return existing.response;
            }
        }
        const orderId = crypto.randomUUID();
        const now = new Date();
        const order = {
            id: orderId,
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            driverId: orderData.driverId,
            orderNumber: `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${orderId.slice(0, 6).toUpperCase()}`,
            status: order_interface_1.OrderStatus.PLACED,
            paymentStatus: order_interface_1.PaymentStatus.PENDING,
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
            const savedOrder = await this.orderRepo.save(order);
            if (idempotencyKey) {
                await this.idempotency.complete(idempotencyKey, 'place_order', savedOrder);
            }
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Failed to place order:', error);
            if (error?.code === '23505') {
                throw new common_1.ConflictException('Order creation failed due to duplicate');
            }
            throw new common_1.InternalServerErrorException('Order placement failed due to internal processing error');
        }
    }
    async confirmPayment(orderId, paymentId, request) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.paymentStatus === order_interface_1.PaymentStatus.COMPLETED) {
            throw new common_1.ConflictException('Payment already confirmed for this order');
        }
        try {
            const paymentIntent = await this.paymentService.confirmPayment(paymentId, order.userId, request);
            order.paymentStatus = order_interface_1.PaymentStatus.COMPLETED;
            order.status = order_interface_1.OrderStatus.PAYMENT_CONFIRMED;
            order.updatedAt = new Date();
            const savedOrder = await this.orderRepo.save(order);
            await this.notificationService.sendPush(order.userId, 'Payment Confirmed', `Your payment for order #${order.orderNumber} has been confirmed.`, { orderId: order.id });
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Payment confirmation failed:', error);
            order.paymentStatus = order_interface_1.PaymentStatus.FAILED;
            order.updatedAt = new Date();
            await this.orderRepo.save(order);
            throw error;
        }
    }
    async handleWebhookDelayed(orderId, paymentId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.paymentStatus === order_interface_1.PaymentStatus.COMPLETED) {
            return order;
        }
        if (order.paymentStatus === order_interface_1.PaymentStatus.FAILED) {
            return order;
        }
        return this.confirmPayment(orderId, paymentId);
    }
    async refundAfterDispatch(orderId, reason) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        const refundEligibleStatuses = [
            order_interface_1.OrderStatus.ON_THE_WAY,
            order_interface_1.OrderStatus.DELIVERED,
        ];
        if (!refundEligibleStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Refund not allowed for order in ${order.status} status`);
        }
        if (order.paymentStatus === order_interface_1.PaymentStatus.REFUNDED) {
            throw new common_1.ConflictException('Order already refunded');
        }
        try {
            const refund = await this.paymentService.refundPayment(order.id, order.grandTotal, order.userId, reason);
            order.paymentStatus = order_interface_1.PaymentStatus.REFUNDED;
            order.updatedAt = new Date();
            const savedOrder = await this.orderRepo.save(order);
            await this.notificationService.sendPush(order.userId, 'Refund Initiated', `A refund of $${order.grandTotal} has been initiated for order #${order.orderNumber}. Reason: ${reason}`, { orderId: order.id });
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Refund failed:', error);
            throw new common_1.InternalServerErrorException('Refund processing failed');
        }
    }
    async cancelByDriver(orderId, driverId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.driverId !== driverId) {
            throw new common_1.BadRequestException('Driver not assigned to this order');
        }
        const cancellableStatuses = [
            order_interface_1.OrderStatus.DRIVER_ASSIGNED,
            order_interface_1.OrderStatus.PICKED_UP,
            order_interface_1.OrderStatus.ON_THE_WAY,
        ];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Order cannot be cancelled by driver in ${order.status} status`);
        }
        try {
            order.status = order_interface_1.OrderStatus.CANCELLED;
            order.driverId = null;
            order.updatedAt = new Date();
            const savedOrder = await this.orderRepo.save(order);
            await this.notificationService.sendPush(order.userId, 'Order Cancelled by Driver', `Your order #${order.orderNumber} has been cancelled by the driver.`, { orderId: order.id });
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Driver cancellation failed:', error);
            throw new common_1.InternalServerErrorException('Driver cancellation failed');
        }
    }
    async cancelByKitchen(orderId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        const cancellableStatuses = [
            order_interface_1.OrderStatus.RESTAURANT_ACCEPTED,
            order_interface_1.OrderStatus.PREPARING,
        ];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Kitchen cannot cancel order in ${order.status} status`);
        }
        try {
            order.status = order_interface_1.OrderStatus.CANCELLED;
            order.updatedAt = new Date();
            const savedOrder = await this.orderRepo.save(order);
            await this.notificationService.sendPush(order.userId, 'Order Cancelled by Restaurant', `Your order #${order.orderNumber} has been cancelled by the restaurant.`, { orderId: order.id });
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Kitchen cancellation failed:', error);
            throw new common_1.InternalServerErrorException('Kitchen cancellation failed');
        }
    }
    async preventDoubleDispatch(orderId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.driverId && order.status === order_interface_1.OrderStatus.DRIVER_ASSIGNED) {
            throw new common_1.ConflictException('Driver already assigned to this order');
        }
        return order;
    }
    async retryOrder(orderId) {
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        if (order.paymentStatus !== order_interface_1.PaymentStatus.FAILED) {
            throw new common_1.BadRequestException('Order can only be retried for failed payments');
        }
        try {
            order.status = order_interface_1.OrderStatus.PLACED;
            order.paymentStatus = order_interface_1.PaymentStatus.PENDING;
            order.updatedAt = new Date();
            const savedOrder = await this.orderRepo.save(order);
            return savedOrder;
        }
        catch (error) {
            console.error('[OrderService] Order retry failed:', error);
            throw new common_1.InternalServerErrorException('Order retry failed');
        }
    }
    async resolveStuckPreparingState() {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const stuckOrders = await this.orderRepo.find({
            where: {
                status: order_interface_1.OrderStatus.PREPARING,
                updatedAt: (0, typeorm_2.LessThan)(thirtyMinutesAgo),
            },
        });
        const resolvedOrders = [];
        for (const order of stuckOrders) {
            try {
                order.status = order_interface_1.OrderStatus.RESTAURANT_ACCEPTED;
                order.updatedAt = new Date();
                const savedOrder = await this.orderRepo.save(order);
                resolvedOrders.push(savedOrder);
                await this.notificationService.sendPush(order.userId, 'Order Delayed', `Your order #${order.orderNumber} is experiencing delays. We're working on it.`, { orderId: order.id });
            }
            catch (error) {
                console.error('[OrderService] Failed to resolve stuck preparing state for order:', order.id, error);
            }
        }
        return resolvedOrders;
    }
    async getOrderWithLock(orderId) {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            lock: { mode: 'pessimistic_write' }
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        return order;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        payments_service_1.PaymentService,
        notification_service_1.NotificationService,
        retry_service_1.RetryService,
        idempotency_service_1.IdempotencyService,
        production_notification_service_1.ProductionNotificationService])
], OrderService);
//# sourceMappingURL=order.service.js.map