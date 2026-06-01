import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Easing, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from './CartScreen';
import { DESIGN_TOKENS } from '@spicegarden/ui';

type CheckoutParams = { cartItems?: CartItem[] };
const CheckoutScreen = () => {
  const route = useRoute<RouteProp<Record<string, CheckoutParams>, string>>();
  const navigation = useNavigation<NavigationProp<Record<string, CheckoutParams>>>();
  const { cartItems = [] } = route.params ?? {};
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cash'>('card');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Home - Sector 17, Chandigarh');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.page,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    AsyncStorage.getItem(STORAGE_KEYS.ADDRESS).then((addressJson) => {
      if (addressJson) {
        try {
          const parsed = JSON.parse(addressJson);
          if (typeof parsed === 'string' && parsed.trim().length > 0) {
            setAddress(parsed);
          }
        } catch {
          AsyncStorage.removeItem(STORAGE_KEYS.ADDRESS).catch(() => undefined);
        }
      }
    }).catch(() => undefined);
  }, [fadeAnim]);

  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const calculateTax = useCallback(() => {
    return calculateSubtotal() * 0.05;
  }, [calculateSubtotal]);

  const calculatePromoDiscount = () => {
    if (!promoCode) return 0;
    const subtotal = calculateSubtotal();

    if (promoCode.toUpperCase() === 'WELCOME50') {
      return Math.min(subtotal * 0.5, 100);
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      return Math.min(subtotal * 0.2, 50);
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const promoDiscount = calculatePromoDiscount();
    const total = Math.max(0, subtotal + tax + tip + 20 - promoDiscount);
    return Math.round(total * 100) / 100;
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
    if (cartItems.length === 0) {
      return;
    }

    setLoading(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await AsyncStorage.removeItem('sg_cart');

      const orderId = 'SG' + Math.floor(Math.random() * 900000 + 100000).toString();
      navigation.navigate('Tracking', { orderId });
    } catch (error) {
      navigation.navigate('Tracking');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Browse Restaurants</Text>
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
          <Text style={styles.headerText}>Checkout</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText}>{address}</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </Text>
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemText}>×{item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              {(['card', 'upi', 'cash'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[styles.paymentOption, paymentMethod === method && styles.selectedPaymentOption]}
                  accessibilityLabel={`Pay with ${method}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: paymentMethod === method }}
                >
                  <Text style={styles.paymentOptionText}>
                    {method === 'card' ? '💳 Card' : method === 'upi' ? '📱 UPI' : '💵 Cash'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tip</Text>
            <View style={styles.tipOptions}>
              {([0, 30, 50, 100] as const).map((tipAmount) => (
                <TouchableOpacity
                  key={tipAmount}
                  onPress={() => setTip(tipAmount)}
                  style={[styles.tipOption, tip === tipAmount && styles.selectedTipOption]}
                  accessibilityLabel={`Add ₹${tipAmount} tip`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: tip === tipAmount }}
                >
                  <Text style={styles.tipOptionText}>
                    {tipAmount === 0 ? 'No tip' : `₹${tipAmount}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promo Code</Text>
            <View style={styles.promoRow}>
              <TextInput
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                style={styles.promoInput}
                accessibilityLabel="Promo code input"
              />
              <TouchableOpacity onPress={applyPromo} style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
            {promoError && <Text style={styles.promoError}>{promoError}</Text>}
            {promoMessage && <Text style={styles.promoSuccess}>{promoMessage}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Total</Text>
              <Text style={styles.summaryAmount}>₹{calculateSubtotal().toFixed(0)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryAmount}>₹20</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryAmount}>₹{calculateTax().toFixed(0)}</Text>
            </View>
            {tip > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tip</Text>
                <Text style={styles.summaryAmount}>₹{tip}</Text>
              </View>
            )}
            {calculatePromoDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promo Discount</Text>
                <Text style={styles.summaryAmount}>-₹{calculatePromoDiscount().toFixed(0)}</Text>
              </View>
            )}
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryAmountTotal}>₹{calculateTotal().toFixed(0)}</Text>
            </View>
          </View>
        </ScrollView>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            style={[styles.placeOrderButton, loading && styles.buttonLoading]}
            accessibilityLabel="Place your order"
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.placeOrderButtonText}>
              {loading ? 'Processing...' : `Place Order • ₹${calculateTotal().toFixed(0)}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
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
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.sm,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
  },
  addressText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    flex: 1,
    marginRight: DESIGN_TOKENS.spacing.md,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemsList: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  paymentOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.md,
  },
  selectedPaymentOption: {
    borderColor: DESIGN_TOKENS.colors.primary,
    backgroundColor: `${DESIGN_TOKENS.colors.primary}10`,
  },
  paymentOptionText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  tipOption: {
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.md,
  },
  selectedTipOption: {
    borderColor: DESIGN_TOKENS.colors.primary,
    backgroundColor: `${DESIGN_TOKENS.colors.primary}10`,
  },
  tipOptionText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoRow: {
    flexDirection: 'row',
    padding: DESIGN_TOKENS.spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.sm,
    paddingHorizontal: 8,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
  },
  promoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoError: {
    color: DESIGN_TOKENS.colors.danger,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  promoSuccess: {
    color: DESIGN_TOKENS.colors.success,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: DESIGN_TOKENS.spacing.sm,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: 8,
  },
  summaryRowTotal: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryAmountTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  placeOrderButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 16,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  buttonLoading: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default CheckoutScreen;