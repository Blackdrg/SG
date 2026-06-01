import React, { useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, ViewStyle, TouchableOpacity } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { Order, OrderStatus } from '../services/order.service';
import { STRINGS } from '../constants/strings';
import { formatCurrency, formatDate, formatTime } from '../utils/currency';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: DESIGN_TOKENS.colors.elevated,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const RestaurantSkeleton: React.FC = () => {
  return (
    <View style={styles.restaurantSkeleton}>
      <Skeleton width="100%" height={100} borderRadius={DESIGN_TOKENS.radius.card} />
      <View style={styles.restaurantSkeletonContent}>
        <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
        <View style={styles.restaurantSkeletonDetails}>
          <Skeleton width={60} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={70} height={14} />
        </View>
      </View>
    </View>
  );
};

export const OrderTrackingSkeleton: React.FC = () => {
  return (
    <View style={styles.trackingSkeleton}>
      <View style={styles.trackingHeader}>
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={20} />
      </View>
      
      <View style={styles.timelineSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.timelineRowSkeleton}>
            <Skeleton width={26} height={26} borderRadius={13} />
            <Skeleton width="100%" height={1} style={{ flex: 1, marginHorizontal: 10 }} />
            <Skeleton width={100} height={16} />
          </View>
        ))}
      </View>

      <Skeleton width="100%" height={150} borderRadius={DESIGN_TOKENS.radius.card} style={{ margin: 16 }} />

      <View style={styles.driverSkeleton}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="40%" height={18} style={{ marginBottom: 6 }} />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    </View>
  );
};

interface OrderCardProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onTrack?: (orderId: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = memo(function OrderCard({ order, onReorder, onTrack }) {
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered': return DESIGN_TOKENS.colors.success;
      case 'cancelled': return DESIGN_TOKENS.colors.danger;
      default: return DESIGN_TOKENS.colors.warning;
    }
  };

  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const formattedTotal = formatCurrency(order.total, 'INR');

  return (
    <View 
      style={orderCardStyles.orderCard}
      accessible={true}
      accessibilityLabel={STRINGS.accessibility.orderCard(order.restaurantName, STRINGS.orderHistory.status[order.status] || order.status)}
      accessibilityRole="button"
      accessibilityHint={STRINGS.accessibility.orderItems(totalItems)}
    >
      <View style={orderCardStyles.orderInfo}>
        <View style={orderCardStyles.orderHeader}>
          <Text 
            style={orderCardStyles.orderId} 
            accessibilityLabel={STRINGS.orderHistory.orderId(order.id)}
          >
            #{order.id}
          </Text>
          <View 
            style={[orderCardStyles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}
            accessible={true}
            accessibilityLabel={`${order.status} status`}
          >
            <Text style={[orderCardStyles.orderStatusText, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={orderCardStyles.orderRestaurant}>{order.restaurantName}</Text>
        <View style={orderCardStyles.orderDetails}>
          <Text 
            style={orderCardStyles.orderItemsText} 
            accessibilityLabel={STRINGS.accessibility.orderItems(totalItems)}
          >
            {totalItems} items
          </Text>
          <Text 
            style={orderCardStyles.orderTimeText} 
            accessibilityLabel={`Order date and time`}
          >
            {formatDate(order.date)} • {formatTime(order.time)}
          </Text>
        </View>
        <View style={orderCardStyles.orderTotal}>
          <Text style={orderCardStyles.orderTotalLabel}>{STRINGS.orderHistory.total}</Text>
          <Text style={orderCardStyles.orderTotalAmount}>{formattedTotal}</Text>
        </View>
      </View>
      <View style={orderCardStyles.orderActions}>
        {order.status === 'delivered' && onReorder && (
          <TouchableOpacity 
            onPress={() => onReorder(order.id)}
            style={orderCardStyles.reorderButton}
            accessibilityLabel={STRINGS.accessibility.reorderButton}
            accessibilityRole="button"
          >
            <Text style={orderCardStyles.reorderButtonText}>{STRINGS.orderHistory.reorder}</Text>
          </TouchableOpacity>
        )}
        {['preparing', 'ready', 'pickedup'].includes(order.status) && onTrack && (
          <TouchableOpacity 
            onPress={() => onTrack(order.id)}
            style={orderCardStyles.trackButton}
            accessibilityLabel={STRINGS.accessibility.trackButton}
            accessibilityRole="button"
          >
            <Text style={orderCardStyles.trackButtonText}>{STRINGS.orderHistory.track}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}, (prev, next) => {
  return prev.order.id === next.order.id && 
         prev.order.status === next.order.status &&
         prev.order.total === next.order.total;
});

export const OrderCardMemo = OrderCard;

export const orderCardStyles = StyleSheet.create({
  orderCard: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    elevation: 2,
  },
  orderInfo: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DESIGN_TOKENS.spacing.sm,
  },
  orderItemsText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderTimeText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  orderActions: {
    flexDirection: 'row',
  },
  reorderButton: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#333',
  },
  restaurantSkeleton: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
  },
  restaurantSkeletonContent: {
    padding: DESIGN_TOKENS.spacing.sm,
  },
  restaurantSkeletonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackingSkeleton: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  trackingHeader: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  timelineSkeleton: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.lg,
  },
  timelineRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
});