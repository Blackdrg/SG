import { CartItem, Order, OrderItem } from '../services/order.service';

export function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false;
  const anyItem = item as Record<string, unknown>;
  return (
    typeof anyItem.id === 'string' &&
    typeof anyItem.name === 'string' &&
    typeof anyItem.price === 'number' &&
    !isNaN(anyItem.price) &&
    anyItem.price >= 0 &&
    typeof anyItem.quantity === 'number' &&
    Number.isInteger(anyItem.quantity) &&
    anyItem.quantity > 0 &&
    typeof anyItem.image === 'string' &&
    typeof anyItem.description === 'string'
  );
}

export function validateCart(cartData: unknown): CartItem[] {
  if (!Array.isArray(cartData)) {
    return [];
  }
  return (cartData as unknown[]).filter(isValidCartItem);
}

export function isValidOrder(order: unknown): order is Order {
  if (typeof order !== 'object' || order === null) return false;
  const anyOrder = order as Record<string, unknown>;
  return (
    typeof anyOrder.id === 'string' &&
    typeof anyOrder.restaurantId === 'string' &&
    typeof anyOrder.restaurantName === 'string' &&
    Array.isArray(anyOrder.items) &&
    anyOrder.items.length > 0 &&
    (anyOrder.items as unknown[]).every((item) => isValidOrderItem(item)) &&
    typeof anyOrder.total === 'number' &&
    !isNaN(anyOrder.total) &&
    anyOrder.total >= 0
  );
}

export function isValidOrderItem(item: unknown): item is OrderItem {
  if (typeof item !== 'object' || item === null) return false;
  const anyItem = item as Record<string, unknown>;
  return (
    typeof anyItem.id === 'string' &&
    typeof anyItem.name === 'string' &&
    typeof anyItem.quantity === 'number' &&
    Number.isInteger(anyItem.quantity) &&
    anyItem.quantity > 0 &&
    typeof anyItem.price === 'number' &&
    !isNaN(anyItem.price) &&
    anyItem.price >= 0
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

export function isValidOrderId(orderId: unknown): orderId is string {
  return typeof orderId === 'string' && orderId.length > 0 && /^[a-zA-Z0-9-]+$/.test(orderId);
}

export function validateTotals(items: CartItem[], taxRate = 0.05): { subtotal: number; tax: number; total: number } | null {
  const validItems = validateCart(items as unknown);
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

export function clampQuantity(quantity: number, max = 99): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(quantity, max));
}

export function clampPrice(price: number): number {
  if (!Number.isFinite(price)) return 0;
  return Math.max(0, Math.round(price * 100) / 100);
}
