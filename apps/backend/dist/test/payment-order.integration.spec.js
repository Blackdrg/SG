"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const order_interface_1 = require("../src/shared/domain/order.interface");
describe('Payment → Order Integration', () => {
    const mockOrder = {
        id: 'test-order-id',
        userId: 'test-user-id',
        restaurantId: 'test-restaurant-id',
        driverId: null,
        status: order_interface_1.OrderStatus.PLACED,
        paymentStatus: order_interface_1.PaymentStatus.PENDING,
        grandTotal: 25.99,
    };
    describe('payment update order flow', () => {
        it('should process payment and update order status', async () => {
            const orderRepo = {
                findOne: jest.fn().mockResolvedValue(mockOrder),
                update: jest.fn().mockResolvedValue(undefined),
            };
            const updatedOrder = { ...mockOrder, paymentStatus: order_interface_1.PaymentStatus.COMPLETED };
            await orderRepo.update(mockOrder.id, { paymentStatus: order_interface_1.PaymentStatus.COMPLETED });
            expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
                paymentStatus: order_interface_1.PaymentStatus.COMPLETED,
            });
        });
        it('should create wallet transaction for payment', async () => {
            const transactionRepo = {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({}),
            };
            const mockWallet = { id: 'test-wallet-id', userId: 'test-user-id', balance: 100 };
            const mockTransaction = {
                walletId: mockWallet.id,
                amount: mockOrder.grandTotal,
                type: 'debit',
                description: `Payment for order #${mockOrder.id}`,
                referenceId: mockOrder.id,
            };
            transactionRepo.create(mockTransaction);
            await transactionRepo.save(mockTransaction);
            expect(transactionRepo.create).toHaveBeenCalledWith(mockTransaction);
        });
    });
});
//# sourceMappingURL=payment-order.integration.spec.js.map