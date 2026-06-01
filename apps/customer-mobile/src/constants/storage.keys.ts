export const STORAGE_KEYS = {
  CART: 'spicegarden_cart',
  USER: 'spicegarden_user',
  ADDRESS: 'spicegarden_address',
  ORDERS_CACHE: 'spicegarden_orders_cache',
  AUTH_TOKEN: 'spicegarden_auth_token',
  REFRESH_TOKEN: 'spicegarden_refresh_token',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
