import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Animated, Easing, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { formatCurrency } from '../utils/currency';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { safeGetItem, getCartSafe, saveCartSafe, clampQuantity } from '../utils/secure-storage';
import { validateCart, validateTotals } from '../utils/validation';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadCart = async () => {
      try {
        const userJson = await safeGetItem(STORAGE_KEYS.USER);
        if (userJson) {
          try {
            setUser(JSON.parse(userJson));
          } catch {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
        const cart = await getCartSafe();
        setCartItems(cart);
      } catch {
        setError(STRINGS.cart.loading);
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    };

    loadCart();
  }, [fadeAnim]);

  const removeFromCart = useCallback((itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) return;
    const newCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(newCart);
    saveCartSafe(newCart).catch(() => undefined);
  }, [cartItems]);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) return;
    const safeQuantity = clampQuantity(newQuantity, 99);
    if (safeQuantity <= 1) {
      removeFromCart(itemId);
      return;
    }
    Haptics.selectionAsync();
    const newCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: safeQuantity } : item
    );
    setCartItems(newCart);
    saveCartSafe(newCart).catch(() => undefined);
  }, [cartItems, removeFromCart]);

  const calculateSubtotal = useMemo(() => {
    const validItems = cartItems.filter(item =>
      Number.isFinite(item.price) && Number.isFinite(item.quantity) && item.quantity > 0
    );
    return validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const calculateTax = useCallback((subtotal: number) => subtotal * 0.05, []);

  const calculateTotal = useCallback((items: CartItem[]): number => {
    const subtotal = validateCart(items as unknown).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    return subtotal + tax;
  }, []);

  const handleCheckout = useCallback(() => {
    const validCart = validateCart(cartItems as unknown);
    if (validCart.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show(STRINGS.cart.empty, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
      return;
    }

    const totals = validateTotals(cartItems as unknown);
    if (!totals) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show(STRINGS.cart.checkoutError, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.danger,
        textColor: 'white',
      });
      return;
    }

    if (!user) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show(STRINGS.cart.loginRequired, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        backgroundColor: DESIGN_TOKENS.colors.warning,
        textColor: 'white',
      });
      navigation.navigate('Auth');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Checkout', { cartItems: validCart });
  }, [cartItems, user, navigation]);

  const renderCartItem = useCallback(({ item }: { item: CartItem }) => {
    const validPrice = Math.max(0, item.price || 0);
    const validQty = Math.max(1, item.quantity || 1);

    return (
      <View style={styles.cartItem} accessible={true} accessibilityLabel={STRINGS.accessibility.cartItem(item.name, validQty)}>
        <Image source={{ uri: item.image }} style={styles.cartItemImage} accessibilityLabel={item.name} accessibilityRole="image" />
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{item.name}</Text>
          <Text style={styles.cartItemDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cartItemQuantity}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, validQty - 1)} style={styles.quantityButton} accessibilityLabel={STRINGS.accessibility.decreaseQuantity(item.name)} accessibilityRole="button">
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText} accessibilityLabel={`Quantity: ${validQty}`}>{validQty}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, validQty + 1)} style={styles.quantityButton} accessibilityLabel={STRINGS.accessibility.increaseQuantity(item.name)} accessibilityRole="button">
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cartItemPrice}>{formatCurrency(validPrice * validQty, 'INR')}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton} accessibilityLabel={STRINGS.accessibility.removeFromCart(item.name)} accessibilityRole="button">
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }, [updateQuantity, removeFromCart]);

  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  const totalFormatted = formatCurrency(calculateTotal(cartItems), 'INR');

  if (loading) {
    return (
      <View style={styles.loadingContainer} accessible={true} accessibilityLabel={STRINGS.accessibility.loading} accessibilityRole="progressbar">
        <Animated.View style={{ opacity: fadeAnim }}>
          <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
          <Text style={styles.loadingText}>{STRINGS.cart.loading}</Text>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton} accessibilityLabel={STRINGS.cart.browseRestaurants} accessibilityRole="button">
          <Text style={styles.buttonText}>{STRINGS.cart.browseRestaurants}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel={STRINGS.accessibility.backButton} accessibilityRole="button">
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>{STRINGS.cart.title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyText}>{STRINGS.cart.empty}</Text>
            <Text style={styles.emptySubtext}>{STRINGS.cart.emptySubtext}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.primaryButton} accessibilityLabel={STRINGS.cart.browseRestaurants} accessibilityRole="button">
              <Text style={styles.buttonText}>{STRINGS.cart.browseRestaurants}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={keyExtractor}
              renderItem={renderCartItem}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              ListFooterComponent={
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(calculateSubtotal, 'INR')}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (5%)</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(calculateTax(calculateSubtotal), 'INR')}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>{totalFormatted}</Text>
                  </View>
                </View>
              }
              contentContainerStyle={{ flexGrow: 1 }}
            />
            <View style={styles.cartFooter}>
              <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton} accessibilityLabel={STRINGS.accessibility.checkout} accessibilityRole="button">
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DESIGN_TOKENS.colors.background },
  loadingText: { fontSize: 16, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 16, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: DESIGN_TOKENS.spacing.lg },
  errorIcon: { fontSize: 48, marginBottom: DESIGN_TOKENS.spacing.md },
  errorText: { fontSize: 16, color: DESIGN_TOKENS.colors.danger, textAlign: 'center', marginBottom: 20, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: DESIGN_TOKENS.spacing.md, backgroundColor: DESIGN_TOKENS.colors.surface, borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.border },
  backButton: { padding: DESIGN_TOKENS.spacing.xs },
  backButtonText: { fontSize: 20, color: DESIGN_TOKENS.colors.textPrimary },
  headerText: { fontSize: 20, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  emptyCart: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: DESIGN_TOKENS.spacing.lg },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: DESIGN_TOKENS.colors.elevated, justifyContent: 'center', alignItems: 'center', marginBottom: DESIGN_TOKENS.spacing.lg },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 18, color: DESIGN_TOKENS.colors.textPrimary, marginBottom: 8, fontFamily: DESIGN_TOKENS.typography.fontFamily, fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: 20, fontFamily: DESIGN_TOKENS.typography.fontFamily, textAlign: 'center' },
  primaryButton: { backgroundColor: DESIGN_TOKENS.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: DESIGN_TOKENS.radius.button },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  cartItem: { flexDirection: 'row', backgroundColor: DESIGN_TOKENS.colors.surface, marginHorizontal: DESIGN_TOKENS.spacing.md, marginVertical: DESIGN_TOKENS.spacing.xs, borderRadius: DESIGN_TOKENS.radius.card, overflow: 'hidden', elevation: 2, padding: DESIGN_TOKENS.spacing.sm },
  cartItemImage: { width: 80, height: 80 },
  cartItemInfo: { flex: 1, marginLeft: DESIGN_TOKENS.spacing.sm, justifyContent: 'space-between' },
  cartItemName: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  cartItemDescription: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, marginBottom: 8, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  cartItemQuantity: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { width: 32, height: 32, borderWidth: 1, borderColor: DESIGN_TOKENS.colors.border, justifyContent: 'center', alignItems: 'center', borderRadius: DESIGN_TOKENS.radius.sm },
  quantityButtonText: { fontSize: 18, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary },
  quantityText: { marginHorizontal: DESIGN_TOKENS.spacing.sm, fontSize: 16, fontWeight: '500', minWidth: 24, textAlign: 'center', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  cartItemPrice: { fontSize: 16, fontWeight: 'bold', color: DESIGN_TOKENS.colors.primary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  removeButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: DESIGN_TOKENS.colors.elevated, borderRadius: DESIGN_TOKENS.radius.sm, justifyContent: 'center', alignItems: 'center' },
  removeButtonText: { fontSize: 14, color: DESIGN_TOKENS.colors.dangerDark, fontWeight: '500' },
  cartFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: DESIGN_TOKENS.colors.surface, padding: DESIGN_TOKENS.spacing.md, borderTopWidth: 1, borderTopColor: DESIGN_TOKENS.colors.border },
  checkoutButton: { backgroundColor: DESIGN_TOKENS.colors.primary, paddingVertical: 14, borderRadius: DESIGN_TOKENS.radius.button, alignItems: 'center' },
  checkoutButtonText: { color: 'white', fontSize: 16, fontWeight: '600', fontFamily: DESIGN_TOKENS.typography.fontFamily },
  summarySection: { padding: DESIGN_TOKENS.spacing.md, backgroundColor: DESIGN_TOKENS.colors.surface, marginHorizontal: DESIGN_TOKENS.spacing.md, borderRadius: DESIGN_TOKENS.radius.card, marginTop: DESIGN_TOKENS.spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: DESIGN_TOKENS.colors.textSecondary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  summaryValue: { fontSize: 14, color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  totalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: DESIGN_TOKENS.colors.border },
  totalLabel: { fontSize: 16, fontWeight: '600', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: DESIGN_TOKENS.colors.textPrimary, fontFamily: DESIGN_TOKENS.typography.fontFamily },
});

export default CartScreen;
