import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency } from '../utils/currency';
import { STORAGE_KEYS } from '../constants/storage.keys';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  description?: string;
}

export type OrderStatus = 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
  time: string;
  rating: number;
  createdAt: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

interface PaginatedOrders {
  orders: Order[];
  total: number;
  hasMore: boolean;
}

const ORDERS_CACHE_TTL = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

const getBackendUrl = () => process.env.BACKEND_URL || 'http://localhost:3001';

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  const attemptFetch = async (attempt: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }

      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return attemptFetch(attempt + 1);
    }
  };

  return attemptFetch(1);
}

async function getCachedOrders(): Promise<Order[] | null> {
  try {
    const cacheJson = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_CACHE);
    if (!cacheJson) return null;

    const cache = JSON.parse(cacheJson);
    const now = Date.now();

    if (cache.timestamp && now - cache.timestamp < ORDERS_CACHE_TTL) {
      return cache.orders;
    }

    return null;
  } catch {
    return null;
  }
}

async function setCachedOrders(orders: Order[]): Promise<void> {
  try {
    const cache = {
      orders,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS_CACHE, JSON.stringify(cache));
  } catch {
    // Silently fail - cache is optional
  }
}

export const orderService = {
  async fetchOrders(page = 1, limit = 20): Promise<PaginatedOrders> {
    const cachedOrders = await getCachedOrders();

    try {
      const response = await fetchWithRetry(
        `${getBackendUrl()}/api/orders?page=${page}&limit=${limit}`
      );

      const data: { orders: Order[]; total: number } = await response.json();
      const orders = data.orders || [];

      await setCachedOrders(orders);

      return {
        orders,
        total: data.total || 0,
        hasMore: orders.length === limit,
      };
    } catch (error) {
      console.warn('Failed to fetch orders from API, using cache fallback:', error);

      if (cachedOrders) {
        const start = (page - 1) * limit;
        const paginatedOrders = cachedOrders.slice(start, start + limit);
        return {
          orders: paginatedOrders,
          total: cachedOrders.length,
          hasMore: start + limit < cachedOrders.length,
        };
      }

      return { orders: [], total: 0, hasMore: false };
    }
  },

  async fetchOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await fetchWithRetry(
        `${getBackendUrl()}/api/orders/${orderId}`
      );
      return response.json();
    } catch (error) {
      console.warn('Failed to fetch order by ID:', error);
      return null;
    }
  },

  async reorderItems(orderId: string, existingCart: CartItem[]): Promise<CartItem[]> {
    const order = await this.fetchOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const reorderedItems: CartItem[] = order.items.map(item => ({
      id: `${item.id || item.name}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: String(item.name || '').slice(0, 200),
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      image: String(item.image || ''),
      description: String(item.description || '').slice(0, 500),
    }));

    const mergedCart = [...existingCart];

    reorderedItems.forEach(newItem => {
      const existingIndex = mergedCart.findIndex(
        item => item.name.toLowerCase() === newItem.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        mergedCart[existingIndex] = {
          ...mergedCart[existingIndex],
          quantity: mergedCart[existingIndex].quantity + newItem.quantity,
        };
      } else {
        mergedCart.push(newItem);
      }
    });

    return mergedCart;
  },

  async saveCart(cartItems: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  },

  async getCart(): Promise<CartItem[]> {
    try {
      const cartJson = await AsyncStorage.getItem(STORAGE_KEYS.CART);
      return cartJson ? JSON.parse(cartJson) : [];
    } catch {
      return [];
    }
  },

  clearCache(): void {
    AsyncStorage.removeItem(STORAGE_KEYS.ORDERS_CACHE).catch(() => undefined);
  },
};

export { formatOrderTotal, formatOrderDate, formatOrderTime };
