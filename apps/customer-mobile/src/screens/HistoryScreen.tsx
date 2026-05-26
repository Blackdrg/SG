import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all'); // all, preparing, ready, pickedup, delivered, cancelled
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
        
        // In a real app, this would be an API call to fetch order history
        // For demo, we'll use mock data
        setTimeout(() => {
          const mockOrders = [
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
            {
              id: 'SG12343',
              restaurantName: 'Subway',
              items: [
                { name: 'Chicken Teriyaki', quantity: 1, price: 249 },
                { name: 'Cookie', quantity: 2, price: 39 },
              ],
              total: 327,
              status: 'delivered',
              date: '2026-05-15',
              time: '20:45',
              rating: 5,
            },
            {
              id: 'SG12342',
              restaurantName: "Domino's",
              items: [
                { name: 'Pepperoni Pizza', quantity: 1, price: 349 },
              ],
              total: 349,
              status: 'cancelled',
              date: '2026-05-10',
              time: '14:20',
              rating: 0,
            },
          ];
          
          setOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to load order history:', error);
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetails', { orderId });
  };

  const handleReorder = async (orderId: string) => {
    try {
      // In a real app, this would fetch the order details and add items to cart
      // For demo, we'll simulate finding the order
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        Alert.alert('Error', 'Order not found');
        return;
      }
      
      // Add items to cart (simplified)
      const cartItems = order.items.map((item: any) => ({
        id: `${item.name}-${Date.now()}`, // Simplified ID generation
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        // In a real app, we'd also include images and other details
      }));
      
      // Get existing cart
      const cartJson = await AsyncStorage.getItem('sg_cart');
      let cart = [];
      if (cartJson) {
        cart = JSON.parse(cartJson);
      }
      
      // Add reorder items to cart
      cart.push(...cartItems);
      
      // Save updated cart
      await AsyncStorage.setItem('sg_cart', JSON.stringify(cart));
      
      Alert.alert('Success', 'Items added to cart! You can now proceed to checkout.');
      
      // Navigate to cart
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Failed to reorder:', error);
      Alert.alert('Error', 'Failed to reorder. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading order history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Order History</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {[ 
            { key: 'all', label: 'All' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'ready', label: 'Ready' },
            { key: 'pickedup', label: 'Picked Up' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.tabButton,
                filter === tab.key && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                filter === tab.key ? { color: '#f04e31', fontWeight: '500' } : null
              ]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
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
              <TouchableOpacity 
                onPress={() => handleOrderPress(item.id)}
                style={styles.orderCard}
              >
                <View style={styles.orderInfo}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{item.id}</Text>
                    <Text style={styles.orderStatusBadge}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.orderRestaurant}>{item.restaurantName}</Text>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderItemsText}>
                      {item.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} items
                    </Text>
                    <Text style={styles.orderTimeText}>
                      {item.date} • {item.time}
                    </Text>
                  </View>
                  <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total:</Text>
                    <Text style={styles.orderTotalAmount}>&#8377;{item.total}</Text>
                  </View>
                </View>
                <View style={styles.orderActions}>
                  {item.status === 'delivered' && (
                    <TouchableOpacity 
                      onPress={() => handleReorder(item.id)}
                      style={styles.reorderButton}
                    >
                      <Text style={styles.reorderButtonText}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                  {(item.status === 'preparing' || item.status === 'ready' || item.status === 'pickedup') && (
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('Tracking', { orderId: item.id })}
                      style={styles.trackButton}
                    >
                      <Text style={styles.trackButtonText}>Track</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: 'white',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#f04e31',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  ordersContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  orderInfo: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItemsText: {
    fontSize: 14,
    color: '#666',
  },
  orderTimeText: {
    fontSize: 14,
    color: '#999',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  orderActions: {
    flexDirection: 'row',
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#f04e31',
    paddingVertical: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  reorderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  trackButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    paddingVertical: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default HistoryScreen;