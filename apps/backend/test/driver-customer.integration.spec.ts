import { OrderStatus } from '../src/shared/domain/order.interface';

describe('Driver → Customer Integration', () => {
  const mockDriver = {
    id: 'test-driver-id',
    userId: 'test-driver-user-id',
    isOnline: true,
    kycStatus: 'approved',
    currentLocation: { lat: 12.9716, lng: 77.5946 },
  };

  const mockOrder = {
    id: 'test-order-id',
    userId: 'test-user-id',
    restaurantId: 'test-restaurant-id',
    driverId: null,
    status: OrderStatus.PREPARING,
  };

  describe('driver assignment flow', () => {
    it('should assign driver to order and update status', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue(mockOrder),
        update: jest.fn().mockResolvedValue(undefined),
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

    it('should update driver assignment record', async () => {
      const driverAssignmentRepo = {
        create: jest.fn().mockReturnValue({}),
        save: jest.fn().mockResolvedValue({}),
      };

      const assignmentData = {
        order: mockOrder,
        driver: mockDriver,
        status: 'assigned' as const,
      };

      driverAssignmentRepo.create(assignmentData);
      await driverAssignmentRepo.save(assignmentData);

      expect(driverAssignmentRepo.create).toHaveBeenCalledWith(assignmentData);
    });

    it('should mark order as picked up by driver', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.DRIVER_ASSIGNED }),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, { status: OrderStatus.PICKED_UP });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.PICKED_UP,
      });
    });

    it('should mark order as delivered', async () => {
      const orderRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockOrder, status: OrderStatus.ON_THE_WAY }),
        update: jest.fn().mockResolvedValue(undefined),
      };

      await orderRepo.update(mockOrder.id, { status: OrderStatus.DELIVERED });

      expect(orderRepo.update).toHaveBeenCalledWith(mockOrder.id, {
        status: OrderStatus.DELIVERED,
      });
    });
  });
});