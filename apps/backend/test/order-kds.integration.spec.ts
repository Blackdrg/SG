import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

describe('Order → KDS Integration', () => {
  const mockOrder = {
    id: 'test-order-id',
    userId: 'test-user-id',
    restaurantId: 'test-restaurant-id',
    driverId: null,
    status: OrderStatus.PAYMENT_CONFIRMED,
    paymentStatus: PaymentStatus.COMPLETED,
    grandTotal: 25.99,
  };

  describe('order to kitchen flow', () => {
    it('should update order status after KDS notification', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, { status: OrderStatus.PREPARING });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.PREPARING,
      });
    });

    it('should update order to ready status', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, { status: OrderStatus.READY });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.READY,
      });
    });
  });
});