import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '../services/order.service';
import { OrderStatusType, ORDER_FILTER_CONSTANTS } from '../constants/order.constants';

/**
 * Hook for managing order history state and logic
 */
export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatusType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Load orders from API/service
  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Import here to avoid circular dependency
      const { orderService } = await import('../services/order.service');
      
      const response = await orderService.fetchOrders(pageNum, ORDER_FILTER_CONSTANTS.DEFAULT_LIMIT);
      
      if (!response.orders || response.orders.length === 0) {
        if (pageNum === 1) {
          setOrders([]);
        }
        setHasMore(false);
      } else {
        setOrders(prev => append ? [...prev, ...response.orders] : response.orders);
        setHasMore(response.hasMore);
      }
    } catch (err) {
      setError('Failed to load order history');
      console.error('Failed to load order history:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadHistory();
  }, [loadHistory, retryCount]);

  // Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  }, [orders, filter]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(1);
  }, [loadHistory]);

  // Load more data
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage, true);
    }
  }, [hasMore, loadingMore, page, loadHistory]);

  // Retry failed load
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: OrderStatusType | 'all') => {
    setFilter(newFilter);
  }, []);

  return {
    orders,
    filteredOrders,
    filter,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    hasMore,
    loadHistory,
    onRefresh,
    loadMore,
    handleRetry,
    handleFilterChange,
  };
};