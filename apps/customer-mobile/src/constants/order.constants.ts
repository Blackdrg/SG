export const ORDER_STATUS = {
  ALL: 'all',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'pickedUp',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUSES = [
  ORDER_STATUS.ALL,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.PICKED_UP,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED
];

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.ALL]: 'All',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.PICKED_UP]: 'Picked Up',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const ORDER_FILTER_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000
};