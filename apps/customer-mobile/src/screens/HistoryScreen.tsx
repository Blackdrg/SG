import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS, MOTION_EASING } from '@spicegarden/ui';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled';
  date: string;
  time: string;
  rating: number;
}

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'preparing' | 'ready' | 'pickedup' | 'delivered' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockOrders: Order[] = [
          {
            id: 'SG12345',
            restaurantName: 'Burger King',
            items: [
              { name: 'Whopper', quantity: 2, price: 149 },
              { name: 'Large Coke', quantity: 1, price: 79 },
            ],
            total: 377,
            status: 'delivered',
            date: '2026-05-20',
            time: '19:30',
            rating: 5,
          },
          {
            id: 'SG12344',
            restaurantName: 'Pizza Hut',
            items: [
              { name: 'Margherita Pizza', quantity: 1, price: 299 },
            ],
            total: 299,
            status: 'delivered',
            date: '2026-05-18',
            time: '12:15',
            rating: 4,
          },
        ];
        
        setOrders(mockOrders);
        setLoading(false);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError('Failed to load order history');
        setLoading(false);
        console.error('Failed to load order history:', error);
      }
    };

    loadHistory();
  }, [fadeAnim]);

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  const handleOrderPress = useCallback((orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  }, [navigation]);

  const handleReorder = useCallback(async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        Alert.alert('Error', 'Order not found');
        return;
      }
      
      const cartItems = order.items.map(item => ({
        id: `${item.name}-${Date.now()}`,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: '',
        description: '',
      }));
      
      const cartJson = await AsyncStorage.getItem('sg_cart');
      let cart = [];
      if (cartJson) {
        cart = JSON.parse(cartJson);
      }
      
      cart.push(...cartItems);
      await AsyncStorage.setItem('sg_cart', JSON.stringify(cart));
      
      Alert.alert('Success', 'Items added to cart!');
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Failed to reorder:', error);
      Alert.alert('Error', 'Failed to reorder. Please try again.');
    }
  }, [orders, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading order history"
        accessibilityRole="progressbar"
      >
        <View style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading order history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
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
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Order History</Text>
        </View>

        <View style={styles.tabsContainer}>
          <View style={styles.tabs}>
            {(['all', 'preparing', 'ready', 'pickedup', 'delivered', 'cancelled'] as const).map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => setFilter(key)}
                style={[styles.tabButton, filter === key && styles.activeTab]}
                accessibilityLabel={`Filter by ${key} orders`}
                accessibilityRole="tab"
              >
                <Text style={styles.tabText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderInfo}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderId}>#{item.id}</Text>
                      <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.orderStatusText, { color: getStatusColor(item.status) }]}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderRestaurant}>{item.restaurantName}</Text>
                    <View style={styles.orderDetails}>
                      <Text style={styles.orderItemsText}>
                        {item.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </Text>
                      <Text style={styles.orderTimeText}>{item.date} • {item.time}</Text>
                    </View>
                    <View style={styles.orderTotal}>
                      <Text style={styles.orderTotalLabel}>Total:</Text>
                      <Text style={styles.orderTotalAmount}>₹{item.total}</Text>
                    </View>
                  </View>
                  <View style={styles.orderActions}>
                    {item.status === 'delivered' && (
                      <TouchableOpacity 
                        onPress={() => handleReorder(item.id)}
                        style={styles.reorderButton}
                        accessibilityLabel="Reorder this order"
                        accessibilityRole="button"
                      >
                        <Text style={styles.reorderButtonText}>Reorder</Text>
                      </TouchableOpacity>
                    )}
                    {['preparing', 'ready', 'pickedup'].includes(item.status) && (
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('Tracking', { orderId: item.id })}
                        style={styles.trackButton}
                        accessibilityLabel="Track this order"
                        accessibilityRole="button"
                      >
                        <Text style={styles.trackButtonText}>Track</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'delivered': return DESIGN_TOKENS.colors.success;
    case 'cancelled': return DESIGN_TOKENS.colors.danger;
    default: return DESIGN_TOKENS.colors.warning;
  }
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
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: DESIGN_TOKENS.colors.primary,
    borderTopColor: 'transparent',
  },
  loadingText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
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
  },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
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
  tabText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  ordersContainer: {
    flex: 1,
  },
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
  emptyState: {
    padding: DESIGN_TOKENS.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default HistoryScreen;