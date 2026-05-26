export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  driverId?: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  grandTotal: number;
  couponId?: string;
  deliveryAddressId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PLACED = 'placed',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  RESTAURANT_ACCEPTED = 'restaurant_accepted',
  PREPARING = 'preparing',
  READY = 'ready',
  DRIVER_ASSIGNED = 'driver_assigned',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  BATCHED = 'batched' // Order is part of a batch for batch processing
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
