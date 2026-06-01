import { CartItem, Order, OrderItem } from '../services/order.service';

export function isValidCartItem(item: any): item is CartItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    !isNaN(item.price) &&
    item.price >= 0 &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.image === 'string' &&
    typeof item.description === 'string'
  );
}

export function validateCart(cartData: any): CartItem[] {
  if (!Array.isArray(cartData)) {
    return [];
  }
  return cartData.filter(isValidCartItem);
}

export function isValidOrder(order: any): order is Order {
  return (
    typeof order === 'object' &&
    order !== null &&
    typeof order.id === 'string' &&
    typeof order.restaurantId === 'string' &&
    typeof order.restaurantName === 'string' &&
    Array.isArray(order.items) &&
    order.items.every((item: any) => isValidOrderItem(item)) &&
    typeof order.total === 'number' &&
    !isNaN(order.total) &&
    order.total >= 0
  );
}

export function isValidOrderItem(item: any): item is OrderItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.price === 'number' &&
    !isNaN(item.price) &&
    item.price >= 0
  );
}

export function sanitizeOrderItems(items: OrderItem[]): OrderItem[] {
  return items
    .map(item => ({
      ...item,
      quantity: Math.max(1, item.quantity),
      price: Math.max(0, item.price),
    }))
    .filter(item => item.quantity > 0 && item.price >= 0);
}

export function isValidOrderId(orderId: any): orderId is string {
  return typeof orderId === 'string' && orderId.length > 0 && /^[a-zA-Z0-9-]+$/.test(orderId);
}

export function validateTotals(items: CartItem[], taxRate: number = 0.05): { subtotal: number; tax: number; total: number } | null {
  const validItems = validateCart(items);
  if (validItems.length === 0) {
    return null;
  }
  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (subtotal <= 0) {
    return null;
  }
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  if (total <= 0 || isNaN(total) || !isFinite(total)) {
    return null;
  }
  return { subtotal, tax, total: Math.round(total * 100) / 100 };
}

export function clampQuantity(quantity: number, max: number = 99): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(quantity, max));
}

export function clampPrice(price: number): number {
  if (!Number.isFinite(price)) return 0;
  return Math.max(0, Math.round(price * 100) / 100);
}
