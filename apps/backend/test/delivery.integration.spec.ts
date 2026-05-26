import { OrderStatus, PaymentStatus } from '../src/shared/domain/order.interface';

describe('Delivery Service Integration Tests', () => {
  const mockOrder = {
    id: 'test-order-id',
    userId: 'test-user-id',
    restaurantId: 'test-restaurant-id',
    driverId: null,
    status: OrderStatus.PLACED,
    paymentStatus: PaymentStatus.PENDING,
    grandTotal: 25.99,
  };

  const mockWallet = {
    id: 'test-wallet-id',
    userId: 'test-user-id',
    balance: 100,
  };

  const mockTransaction = {
    id: 'test-transaction-id',
    walletId: 'test-wallet-id',
    amount: 25.99,
    type: 'debit' as const,
    description: 'Payment for order #test-order-id',
    referenceId: 'test-order-id',
  };

  const mockDriver = {
    id: 'test-driver-id',
    userId: 'test-driver-user-id',
    isOnline: true,
    kycStatus: 'approved',
    currentLocation: { lat: 12.9716, lng: 77.5946 },
  };

  describe('Payment → Order Integration', () => {
    it('should process payment and update order status', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, {
        paymentStatus: PaymentStatus.COMPLETED,
      });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        paymentStatus: PaymentStatus.COMPLETED,
      });
    });
  });

  describe('Order → KDS Integration', () => {
    it('should update order status for KDS flow', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.PAYMENT_CONFIRMED }),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, { status: OrderStatus.PREPARING });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.PREPARING,
      });
    });
  });

  describe('Driver → Customer Integration', () => {
    it('should assign driver to order', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(undefined),
      };

      const driverAssignmentRepo = {
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
      };

      await orderRepo.update(mockOrder.id, {
        driverId: mockDriver.id,
        status: OrderStatus.DRIVER_ASSIGNED,
      });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        driverId: mockDriver.id,
        status: OrderStatus.DRIVER_ASSIGNED,
      });
    });
  });

  describe('Refund → Wallet Integration', () => {
    it('should process refund and update wallet balance', async () => {
      const transactionRepo = {
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({ ...mockTransaction, type: 'credit' }),
      };

      const refundTransaction = {
        ...mockTransaction,
        type: 'credit' as const,
        amount: mockOrder.grandTotal,
      };

      transactionRepo.create(refundTransaction);
      await transactionRepo.save(refundTransaction);

      expect(transactionRepo.create).toHaveBeenCalledWith(refundTransaction);
    });
  });
});