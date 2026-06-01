import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import { formatCurrency, formatDate, formatTime } from '../utils/currency';
import { Order, OrderStatus } from '../services/order.service';
import { calculateTotalItems, formatOrderStatus, isReorderable, isTrackable } from '../utils/order.utils';

export interface OrderCardProps {
  order: Order;
  onReorder?: (orderId: string) => void;
  onTrack?: (orderId: string) => void;
}

export const OrderCard = memo(function OrderCard({ order, onReorder, onTrack }: OrderCardProps) {
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered': return DESIGN_TOKENS.colors.success;
      case 'cancelled': return DESIGN_TOKENS.colors.danger;
      default: return DESIGN_TOKENS.colors.warning;
    }
  };

  const totalItems = calculateTotalItems(order.items);
  const formattedTotal = formatCurrency(order.total, 'INR');

  return (
    <View 
      style={styles.orderCard}
      accessible={true}
      accessibilityLabel={STRINGS.accessibility.orderCard(order.restaurantName, STRINGS.orderHistory.status[order.status] || order.status)}
      accessibilityRole="button"
      accessibilityHint={STRINGS.accessibility.orderItems(totalItems)}
    >
      <View style={styles.orderInfo}>
        <View style={styles.orderHeader}>
          <Text 
            style={styles.orderId} 
            accessibilityLabel={STRINGS.orderHistory.orderId(order.id)}
          >
            #{order.id}
          </Text>
          <View 
            style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}
            accessible={true}
            accessibilityLabel={`${order.status} status`}
          >
            <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
              {formatOrderStatus(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
        <View style={styles.orderDetails}>
          <Text 
            style={styles.orderItemsText} 
            accessibilityLabel={STRINGS.accessibility.orderItems(totalItems)}
          >
            {totalItems} items
          </Text>
          <Text 
            style={styles.orderTimeText} 
            accessibilityLabel={`Order date and time`}
          >
            {formatDate(order.date)} • {formatTime(order.time)}
          </Text>
        </View>
        <View style={styles.orderTotal}>
          <Text style={styles.orderTotalLabel}>{STRINGS.orderHistory.total}</Text>
          <Text style={styles.orderTotalAmount}>{formattedTotal}</Text>
        </View>
      </View>
      <View style={styles.orderActions}>
        {isReorderable(order.status) && onReorder && (
          <TouchableOpacity 
            onPress={() => onReorder(order.id)}
            style={styles.reorderButton}
            accessibilityLabel={STRINGS.accessibility.reorderButton}
            accessibilityRole="button"
          >
            <Text style={styles.reorderButtonText}>{STRINGS.orderHistory.reorder}</Text>
          </TouchableOpacity>
        )}
        {isTrackable(order.status) && onTrack && (
          <TouchableOpacity 
            onPress={() => onTrack(order.id)}
            style={styles.trackButton}
            accessibilityLabel={STRINGS.accessibility.trackButton}
            accessibilityRole="button"
          >
            <Text style={styles.trackButtonText}>{STRINGS.orderHistory.track}</Text>
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

export const styles = StyleSheet.create({
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

export default OrderCard;