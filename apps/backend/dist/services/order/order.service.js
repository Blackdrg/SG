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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const order_interface_1 = require("../../shared/domain/order.interface");
const queue_service_1 = require("../../infra/queue/queue.service");
const queues_1 = require("../../shared/contracts/queues");
const crypto = require("crypto");
let OrderService = class OrderService {
    constructor(queueService) {
        this.queueService = queueService;
    }
    async placeOrder(orderData) {
        if (!orderData.userId || !orderData.restaurantId || !orderData.grandTotal) {
            throw new common_1.BadRequestException('Missing required order data: userId, restaurantId, or grandTotal');
        }
        if (orderData.grandTotal <= 0) {
            throw new common_1.BadRequestException('Order total must be greater than zero');
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
            await this.queueService.enqueue(queues_1.QUEUE_NAMES.ORDER_LIFECYCLE, {
                orderId: order.id,
                status: order.status,
                userId: order.userId,
                restaurantId: order.restaurantId,
            });
            return order;
        }
        catch (error) {
            console.error('[OrderService] Failed to enqueue order lifecycle event:', error);
            throw new common_1.BadRequestException('Order placement failed due to internal processing error');
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], OrderService);
//# sourceMappingURL=order.service.js.map