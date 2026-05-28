import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Animated, Easing, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS, MOTION_EASING } from '@spicegarden/ui';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

const CartScreen = () => {
  const navigation = useNavigation<any>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadCart = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
        const cartJson = await AsyncStorage.getItem('sg_cart');
        if (cartJson) {
          setCartItems(JSON.parse(cartJson));
        }
      } catch (e) {
        setError('Failed to load cart. Please try again.');
        console.error('Failed to load cart:', e);
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

   const removeFromCart = (itemId: string) => {
     Alert.alert(
       'Remove from cart',
       'Are you sure you want to remove this item?',
       [
         { text: 'Cancel', style: 'cancel', onPress: undefined },
         { 
           text: 'Remove', 
           style: 'destructive',
           onPress: () => {
             setCartItems(prev => {
               const newCart = prev.filter(item => item.id !== itemId);
               AsyncStorage.setItem('sg_cart', JSON.stringify(newCart)).catch(console.error);
               return newCart;
             });
           }
         }
       ],
       { cancelable: true }
     );
   };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => {
      const newCart = prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      AsyncStorage.setItem('sg_cart', JSON.stringify(newCart)).catch(console.error);
      return newCart;
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.05;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateTax(subtotal);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Your cart is empty', 'Add items to your cart before proceeding to checkout.');
      return;
    }
    
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to continue checkout.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigation.navigate('Auth') }
      ]);
      return;
    }
    
    navigation.navigate('Checkout', { cartItems });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading cart"
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading your cart...</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          style={styles.primaryButton}
          accessibilityLabel="Continue shopping"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
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
          <Text style={styles.headerText}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
            </View>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>Add some delicious food to get started</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')} 
              style={styles.primaryButton}
              accessibilityLabel="Browse restaurants"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                   <Image 
                     source={{ uri: item.image }} 
                     style={styles.cartItemImage}
                     accessibilityLabel={item.name}
                   />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <View style={styles.cartItemQuantity}>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Decrease ${item.name} quantity`}
                        accessibilityRole="button"
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                        accessibilityLabel={`Increase ${item.name} quantity`}
                        accessibilityRole="button"
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemPrice}>₹{item.price * item.quantity}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => removeFromCart(item.id)}
                    style={styles.removeButton}
                    accessibilityLabel={`Remove ${item.name} from cart`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListFooterComponent={
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{calculateSubtotal().toFixed(0)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (5%)</Text>
                    <Text style={styles.summaryValue}>₹{calculateTax(calculateSubtotal()).toFixed(0)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(0)}</Text>
                  </View>
                </View>
              }
            />
            <View style={styles.cartFooter}>
              <TouchableOpacity 
                onPress={handleCheckout}
                style={styles.checkoutButton}
                accessibilityLabel="Proceed to checkout"
                accessibilityRole="button"
              >
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
  loadingContent: {
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
  errorIcon: {
    fontSize: 48,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.danger,
    textAlign: 'center',
    marginBottom: 20,
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
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptySubtext: {
    fontSize: 14,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    elevation: 2,
    padding: DESIGN_TOKENS.spacing.sm,
  },
  cartItemImage: {
    width: 80,
    height: 80,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: DESIGN_TOKENS.spacing.sm,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cartItemDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DESIGN_TOKENS.radius.sm,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  quantityText: {
    marginHorizontal: DESIGN_TOKENS.spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    borderRadius: DESIGN_TOKENS.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.dangerDark,
    fontWeight: '500',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
  },
  checkoutButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summarySection: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
    marginTop: DESIGN_TOKENS.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  summaryValue: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default CartScreen;