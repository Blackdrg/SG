import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
        
        // In a real app, this would be an API call to fetch order details
        // For demo, we'll use mock data based on orderId
        setTimeout(() => {
          // Find mock order from our predefined list
          const mockOrders = [
            {
              id: 'SG12345',
              restaurantName: 'Burger King',
              restaurantImage: 'https://example.com/burger-king.jpg',
              items: [
                { 
                  id: 'item-001', 
                  name: 'Whopper', 
                  description: 'Flame-grilled beef patty', 
                  price: 149, 
                  quantity: 2,
                  image: 'https://example.com/whopper.jpg'
                },
                { 
                  id: 'item-002', 
                  name: 'Large Coke', 
                  description: '1.25L Bottle', 
                  price: 79, 
                  quantity: 1,
                  image: 'https://example.com/coke.jpg'
                },
              ],
              status: 'delivered',
              subtotal: 377,
              deliveryFee: 20,
              tax: 19,
              tip: 50,
              total: 466,
              createdAt: '2026-05-20T19:30:00Z',
              updatedAt: '2026-05-20T20:00:00Z',
              deliveryAddress: {
                street: 'Home - Sector 17',
                city: 'Chandigarh',
                state: 'Chandigarh',
                pincode: '160017',
              },
              paymentMethod: 'card',
            },
            {
              id: 'SG12344',
              restaurantName: 'Pizza Hut',
              restaurantImage: 'https://example.com/pizza-hut.jpg',
              items: [
                { 
                  id: 'item-003', 
                  name: 'Margherita Pizza', 
                  description: 'Fresh mozzarella & tomatoes', 
                  price: 299, 
                  quantity: 1,
                  image: 'https://example.com/margherita.jpg'
                },
              ],
              status: 'delivered',
              subtotal: 299,
              deliveryFee: 20,
              tax: 15,
              tip: 30,
              total: 364,
              createdAt: '2026-05-18T12:15:00Z',
              updatedAt: '2026-05-18T12:45:00Z',
              deliveryAddress: {
                street: 'Home - Sector 17',
                city: 'Chandigarh',
                state: 'Chandigarh',
                pincode: '160017',
              },
              paymentMethod: 'upi',
            },
          ];
          
          const foundOrder = mockOrders.find(order => order.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          } else {
            // Generate a generic order if not found
            setOrder({
              id: orderId,
              restaurantName: 'Restaurant Name',
              restaurantImage: 'https://example.com/restaurant.jpg',
              items: [
                { 
                  id: 'item-001', 
                  name: 'Sample Item', 
                  description: 'Description of item', 
                  price: 199, 
                  quantity: 1,
                  image: 'https://example.com/item.jpg'
                },
              ],
              status: 'preparing',
              subtotal: 199,
              deliveryFee: 20,
              tax: 10,
              tip: 0,
              total: 229,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deliveryAddress: {
                street: 'Home - Sector 17',
                city: 'Chandigarh',
                state: 'Chandigarh',
                pincode: '160017',
              },
              paymentMethod: 'card',
            });
          }
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to load order details:', error);
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusLabels = {
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    pickedup: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusColors = {
    preparing: '#ff9800',
    ready: '#ff9800',
    pickedup: '#ff9800',
    delivered: '#4caf50',
    cancelled: '#f44336',
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Order Details</Text>
      </View>

      <View style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantSection}>
          <View style={styles.restaurantRow}>
            <Image 
              source={{ uri: order.restaurantImage }} 
              style={styles.restaurantImage}
            />
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{order.restaurantName}</Text>
              <Text style={styles.restaurantDetail}>Restaurant Partner</Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.itemsList}>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <View style={styles.itemQuantity}>
                  <Text style={styles.quantityText}>×{item.quantity}</Text>
                </View>
                <View style={styles.itemPrice}>
                  <Text style={styles.priceText}>&#8377;{item.price * item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Total</Text>
            <Text style={styles.summaryAmount}>&#8377;{order.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryAmount}>&#8377;{order.deliveryFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryAmount}>&#8377;{order.tax}</Text>
          </View>
          {order.tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip</Text>
              <Text style={styles.summaryAmount}>&#8377;{order.tip}</Text>
            </View>
          )}
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryAmountTotal}>&#8377;{order.total}</Text>
          </View>
        </View>

        {/* Order Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[
              styles.infoValue,
              { backgroundColor: statusColors[order.status as keyof typeof statusColors] + '20' },
              { color: statusColors[order.status as keyof typeof statusColors] }
            ]}>
              {statusLabels[order.status as keyof typeof statusLabels] || order.status}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>
              {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>{order.deliveryAddress.street}</Text>
          </View>
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentText}>
              {order.paymentMethod?.toUpperCase() || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === 'delivered' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              onPress={() => {/* TODO: Implement reorder */}}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Reorder</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity 
              onPress={() => {}}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Leave Review</Text>
            </TouchableOpacity> */}
          </View>
        )}
        
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Track Order</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  restaurantSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  restaurantInfo: {
    marginLeft: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  restaurantDetail: {
    fontSize: 14,
    color: '#666',
  },
  itemsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemRow: {
    borderBottomWidth: 0,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  itemQuantity: {
    marginLeft: 12,
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    marginLeft: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryRowTotal: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryAmountTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  addressSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  addressRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  paymentSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  paymentRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#f04e31',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default OrderDetailsScreen;