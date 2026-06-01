/**
 * Utility functions for order processing
 */

/**
 * Calculate total items in an order
 */
export const calculateTotalItems = (items: { quantity: number }[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * Format order status for display
 */
export const formatOrderStatus = (status: string): string => {
  if (!status) return '';
  return status
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Check if order is reorderable (delivered)
 */
export const isReorderable = (status: string): boolean => {
  return status === 'delivered';
};

/**
 * Check if order is trackable (preparing, ready, pickedUp)
 */
export const isTrackable = (status: string): boolean => {
  return ['preparing', 'ready', 'pickedUp'].includes(status);
};

/**
 * Group orders by status
 */
export const groupOrdersByStatus = (orders: any[]): Record<string, any[]> => {
  return orders.reduce((acc, order) => {
    const status = order.status || 'unknown';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {} as Record<string, any[]>);
};

/**
 * Sort orders by date (newest first)
 */
export const sortOrdersByDate = (orders: any[]): any[] => {
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date).getTime();
    const dateB = new Date(b.createdAt || b.date).getTime();
    return dateB - dateA;
  });
};