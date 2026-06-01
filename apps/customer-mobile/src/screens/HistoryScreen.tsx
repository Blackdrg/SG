import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Easing, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { orderService, Order, OrderStatus } from '../services/order.service';
import { OrderCardMemo } from '../components/SkeletonLoader';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { isValidOrderId } from '../utils/validation';

type FilterStatus = 'all' | OrderStatus;

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await orderService.fetchOrders(pageNum, 20);
      
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
      setError(STRINGS.orderHistory.error);
      console.error('Failed to load order history:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, retryCount]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  }, [orders, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(1);
  }, [loadHistory]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadHistory(nextPage, true);
    }
  }, [hasMore, loadingMore, page, loadHistory]);

  const handleReorder = useCallback(async (orderId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (!isValidOrderId(orderId)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show(STRINGS.orderHistory.orderNotFound, {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          backgroundColor: DESIGN_TOKENS.colors.danger,
          textColor: 'white',
        });
        return;
      }

      const existingCart = await orderService.getCart();
      const updatedCart = await orderService.reorderItems(orderId, existingCart);

      await orderService.saveCart(updatedCart);

      Toast.show(STRINGS.orderHistory.reorderSuccess, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.success,
        textColor: 'white',
      });

      navigation.navigate('Cart');
    } catch (err) {
      Toast.show(STRINGS.orderHistory.reorderError, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
    }
  }, [navigation]);

  const handleTrack = useCallback((orderId: string) => {
    Haptics.selectionAsync();
    if (!isValidOrderId(orderId)) return;
    navigation.navigate('Tracking', { orderId });
  }, [navigation]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const handleCardPress = useCallback((orderId: string) => {
    Haptics.selectionAsync();
    if (!isValidOrderId(orderId)) return;
    navigation.navigate('OrderDetails', { orderId });
  }, [navigation]);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, fadeAnim, scaleAnim]);

  const renderOrder = useCallback(({ item }: { item: Order }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => handleCardPress(item.id)}
    >
      <OrderCardMemo 
        order={item} 
        onReorder={item.status === 'delivered' ? handleReorder : undefined}
        onTrack={['preparing', 'ready', 'pickedup'].includes(item.status) ? handleTrack : undefined}
      />
    </TouchableOpacity>
  ), [handleCardPress, handleReorder, handleTrack]);

  const keyExtractor = useCallback((item: Order) => item.id, []);

  if (loading) {
    return (
      <View 
        style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel={STRINGS.accessibility.loading}
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.loadingText} accessibilityLabel={STRINGS.orderHistory.loading}>
            {STRINGS.orderHistory.loading}
          </Text>
        </Animated.View>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={handleRetry} 
          style={styles.primaryButton}
          accessibilityLabel={STRINGS.orderHistory.retry}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{STRINGS.orderHistory.retry}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          style={[styles.primaryButton, styles.secondaryButton]}
          accessibilityLabel={STRINGS.orderHistory.backToHome}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, styles.secondaryButtonText]}>
            {STRINGS.orderHistory.backToHome}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            accessibilityLabel={STRINGS.accessibility.backButton}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>{STRINGS.orderHistory.title}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {(['all', 'preparing', 'ready', 'pickedup', 'delivered', 'cancelled'] as const).map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                style={[styles.tabButton, filter === key && styles.activeTab]}
                accessibilityLabel={STRINGS.accessibility.filterTab(key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === key }}
              >
                <Text style={[styles.tabText, filter === key && styles.activeTabText]}>
                  {STRINGS.orderHistory.status[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>{STRINGS.orderHistory.empty}</Text>
              <Text style={styles.emptySubtext}>Your past orders will appear here</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Home')} 
                style={styles.primaryButton}
                accessibilityLabel={STRINGS.cart.browseRestaurants}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>{STRINGS.cart.browseRestaurants}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={keyExtractor}
              renderItem={renderOrder}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={[DESIGN_TOKENS.colors.primary]}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={DESIGN_TOKENS.colors.primary} />
                  </View>
                ) : null
              }
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              contentContainerStyle={{ flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.danger,
    marginBottom: 20,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  secondaryButtonText: {
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  backButton: {
    padding: DESIGN_TOKENS.spacing.xs,
  },
  backButtonText: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  tabsContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
  },
  tabButton: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DESIGN_TOKENS.colors.primary,
  },
  activeTabText: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
  },
  tabText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ordersContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 20,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
});

export default HistoryScreen;