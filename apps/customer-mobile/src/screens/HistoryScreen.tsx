import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { OrderCard } from '../components/OrderCard';
import { OrderTabs } from '../components/OrderTabs';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { isValidOrderId } from '../utils/validation';

const HistoryScreen = () => {
  const navigation = useNavigation();
  const {
    orders,
    filteredOrders,
    filter,
    loading,
    refreshing,
    loadingMore,
    error,
    onRefresh,
    loadMore,
    handleRetry,
    handleFilterChange
  } = useOrderHistory();

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

      const { orderService } = await import('../services/order.service');
      
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

  const handleCardPress = useCallback((orderId: string) => {
    Haptics.selectionAsync();
    if (!isValidOrderId(orderId)) return;
    navigation.navigate('OrderDetails', { orderId });
  }, [navigation]);

  if (loading) {
    return <LoadingState showText={true} />;
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

      <OrderTabs filter={filter} onFilterChange={handleFilterChange} />

      <View style={styles.ordersContainer}>
        {filteredOrders.length === 0 ? (
          <EmptyState onNavigateHome={() => navigation.navigate('Home')} />
        ) : (
          <>
            {/** Note: In a real implementation, we'd use FlatList here for performance */}
            {/** For now, we'll map through the orders to demonstrate the component usage */}
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onReorder={order.status === 'delivered' ? handleReorder : undefined}
                onTrack={['preparing', 'ready', 'pickedUp'].includes(order.status) ? handleTrack : undefined}
              />
            ))}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
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
  ordersContainer: {
    flex: 1,
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
});

export default HistoryScreen;