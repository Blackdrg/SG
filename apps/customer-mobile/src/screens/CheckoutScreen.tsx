import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Switch } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './CartScreen';

const CheckoutScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { cartItems }: { cartItems: CartItem[] } = route.params;
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Home - Sector 17, Chandigarh');

  useEffect(() => {
    // Load default address from storage or use default
    AsyncStorage.getItem('sg_address').then((addressJson: string | null) => {
      if (addressJson) {
        setAddress(JSON.parse(addressJson));
      }
    }).catch((error: any) => {
      console.error('Failed to load address:', error);
    });
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05;
  };

  const calculatePromoDiscount = () => {
    if (!promoCode) return 0;
    const subtotal = calculateSubtotal();
    
    // Simple promo validation
    if (promoCode.toUpperCase() === 'WELCOME50') {
      return Math.min(subtotal * 0.5, 100); // 50% off up to ₹100
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      return Math.min(subtotal * 0.2, 50); // 20% off up to ₹50
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const promoDiscount = calculatePromoDiscount();
    return subtotal + tax + tip - promoDiscount;
  };

  const applyPromo = () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      setPromoMessage('');
      return;
    }

    const discount = calculatePromoDiscount();
    if (discount > 0) {
      setPromoMessage(`Applied! You saved ₹${discount.toFixed(0)}`);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code');
      setPromoMessage('');
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to create the order
      // For demo, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart after successful order
      await AsyncStorage.removeItem('sg_cart');
      
      // Generate a fake order ID for tracking
      const orderId = 'SG' + Math.floor(Math.random() * 900000 + 100000).toString();
      
      navigation.navigate('Tracking', { orderId });
    } catch (error) {
      console.error('Failed to place order:', error);
      // Even on error, proceed to tracking for demo purposes
      navigation.navigate('Tracking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Checkout</Text>
      </View>

      <View style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>{address}</Text>
            <TouchableOpacity onPress={() => {/* TODO: Implement address selection */}} style={styles.editButton}>
              <Text style={styles.editButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)})</Text>
          <View style={styles.itemsList}>
            {cartItems.map((item: CartItem) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemText}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>&#8377;{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity 
              onPress={() => setPaymentMethod('card')}
              style={[
                styles.paymentOption,
                paymentMethod === 'card' && styles.selectedPaymentOption
              ]}
            >
              <Text style={styles.paymentOptionText}>&#x1F4B3; Card</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setPaymentMethod('upi')}
              style={[
                styles.paymentOption,
                paymentMethod === 'upi' && styles.selectedPaymentOption
              ]}
            >
              <Text style={styles.paymentOptionText}>&#x1F4B0; UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setPaymentMethod('cash')}
              style={[
                styles.paymentOption,
                paymentMethod === 'cash' && styles.selectedPaymentOption
              ]}
            >
              <Text style={styles.paymentOptionText}>&#x1F4B5; Cash</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tip</Text>
          <View style={styles.tipOptions}>
            <TouchableOpacity 
              onPress={() => setTip(0)}
              style={[
                styles.tipOption,
                tip === 0 && styles.selectedTipOption
              ]}
            >
              <Text style={styles.tipOptionText}>No tip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTip(30)}
              style={[
                styles.tipOption,
                tip === 30 && styles.selectedTipOption
              ]}
            >
              <Text style={styles.tipOptionText}>&#x20B9;30</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTip(50)}
              style={[
                styles.tipOption,
                tip === 50 && styles.selectedTipOption
              ]}
            >
              <Text style={styles.tipOptionText}>&#x20B9;50</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTip(100)}
              style={[
                styles.tipOption,
                tip === 100 && styles.selectedTipOption
              ]}
            >
              <Text style={styles.tipOptionText}>&#x20B9;100</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              style={styles.promoInput}
            />
            <TouchableOpacity onPress={applyPromo} style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoError && (
            <Text style={styles.promoError}>{promoError}</Text>
          )}
          {promoMessage && (
            <Text style={styles.promoSuccess}>{promoMessage}</Text>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Total</Text>
            <Text style={styles.summaryAmount}>&#8377;{calculateSubtotal().toFixed(0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryAmount}>&#8377;20</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes</Text>
            <Text style={styles.summaryAmount}>&#8377;{calculateTax().toFixed(0)}</Text>
          </View>
          {tip > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip</Text>
              <Text style={styles.summaryAmount}>&#8377;{tip}</Text>
            </View>
          )}
          {calculatePromoDiscount() > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo Discount</Text>
              <Text style={styles.summaryAmount}>-&#8377;{calculatePromoDiscount().toFixed(0)}</Text>
            </View>
          )}
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryLabelTotal}>Total</Text>
            <Text style={styles.summaryAmountTotal}>&#8377;{calculateTotal().toFixed(0)}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity 
          onPress={handlePlaceOrder}
          style={[
            styles.placeOrderButton,
            loading && styles.buttonLoading
          ]}
        >
          <Text style={styles.placeOrderButtonText}>
            {loading ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
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
  },
  section: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    maxWidth: '70%',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: '#f04e31',
    fontWeight: '500',
  },
  itemsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemText: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  paymentOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedPaymentOption: {
    borderColor: '#f04e31',
    backgroundColor: '#fff0f0',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#666',
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  tipOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  selectedTipOption: {
    borderColor: '#f04e31',
    backgroundColor: '#fff0f0',
  },
  tipOptionText: {
    fontSize: 14,
    color: '#666',
  },
  promoRow: {
    flexDirection: 'row',
    padding: 12,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  promoButton: {
    backgroundColor: '#f04e31',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  promoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  promoError: {
    color: '#c62828',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 12,
  },
  promoSuccess: {
    color: '#2e7d32',
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 12,
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
  placeOrderButton: {
    backgroundColor: '#f04e31',
    paddingVertical: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonLoading: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
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
});

export default CheckoutScreen;