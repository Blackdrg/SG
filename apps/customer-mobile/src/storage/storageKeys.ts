export const STORAGE_KEYS = {
  ORDERS_CACHE: 'sg_orders_cache',
  CART: 'sg_cart',
  USER_TOKEN: 'sg_user_token',
  USER_PROFILE: 'sg_user_profile'
} as const;

export type StorageKeyType = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];