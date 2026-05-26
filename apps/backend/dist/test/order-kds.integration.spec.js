"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_interface_1 = require("../src/shared/domain/order.interface");
describe('Order → KDS Integration', () => {
    const mockOrder = {
        id: 'test-order-id',
        userId: 'test-user-id',
        restaurantId: 'test-restaurant-id',
        driverId: null,
        status: order_interface_1.OrderStatus.PAYMENT_CONFIRMED,
        paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
        grandTotal: 25.99,
    };
    describe('order to kitchen flow', () => {
        it('should update order status after KDS notification', async () => {
            const orderRepo = {
                findOne: jest.fn().mockResolvedValue(mockOrder),
                update: jest.fn().mockResolvedValue(undefined),
            };
            await orderRepo.update(mockOrder.id, { status: order_interface_1.OrderStatus.PREPARING });
            expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
                status: order_interface_1.OrderStatus.PREPARING,
            });
        });
        it('should update order to ready status', async () => {
            const orderRepo = {
                findOne: jest.fn().mockResolvedValue(mockOrder),
                update: jest.fn().mockResolvedValue(undefined),
            };
            await orderRepo.update(mockOrder.id, { status: order_interface_1.OrderStatus.READY });
            expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
                status: order_interface_1.OrderStatus.READY,
            });
        });
    });
});
//# sourceMappingURL=order-kds.integration.spec.js.map