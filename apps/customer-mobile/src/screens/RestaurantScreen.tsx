import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, Animated, Easing, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { getCartSafe, saveCartSafe } from '../utils/secure-storage';
import { STORAGE_KEYS } from '../constants/storage.keys';
import { clampQuantity, clampPrice } from '../utils/validation';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}
// Full cart item definition for offline‑first UX
interface CartItem {
  id: string;
  restaurantId: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  options?: {
    size?: string;
    spiceLevel?: string;
    addOns?: string[];
    customizations?: string[];
  };
  notes?: string;
  isVeg?: boolean;
  category?: string;
  itemTotal: number;
}
interface RestaurantInfo {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  address: string;
}

const RestaurantScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params || {};
  
  const [activeCategory, setActiveCategory] = useState<'all' | string>('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addingItem, setAddingItem] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(new Map<string, Animated.Value>()).current;

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const restaurants: Record<string, RestaurantInfo> = {
          'rest-001': { id: 'rest-001', name: 'Burger King', rating: 4.2, deliveryTime: '25-30 min', address: 'Phase 5, Mohali' },
          'rest-002': { id: 'rest-002', name: 'Pizza Hut', rating: 4.5, deliveryTime: '30-35 min', address: 'Phase 7, Mohali' },
          'rest-003': { id: 'rest-003', name: 'Subway', rating: 4.0, deliveryTime: '15-20 min', address: 'Sector 17, Chandigarh' },
        };
        
        setRestaurant(restaurants[restaurantId] || null);
        
        let items: MenuItem[] = [];
        if (restaurantId === 'rest-001') {
          items = [
            { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty with fresh lettuce', price: 149, category: 'burgers', image: 'https://example.com/whopper.jpg' },
            { id: 'item-002', name: 'Double Whopper', description: 'Two flame-grilled beef patties', price: 199, category: 'burgers', image: 'https://example.com/double-whopper.jpg' },
          ];
        } else if (restaurantId === 'rest-002') {
          items = [
            { id: 'item-007', name: 'Margherita Pizza', description: 'Fresh mozzarella & tomatoes', price: 299, category: 'pizza', image: 'https://example.com/margherita.jpg' },
          ];
        } else {
          items = [
            { id: 'item-013', name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 249, category: 'sandwiches', image: 'https://example.com/chicken-teriyaki.jpg' },
          ];
        }
        
        setMenuItems(items);
        setLoading(false);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError('Failed to load menu');
        setLoading(false);
      }
    };
    
    loadData();
    loadCartCount();
  }, [restaurantId, fadeAnim]);

   const loadCartCount = async () => {
     try {
       const cart = await getCartSafe();
       const count = (cart as any[]).reduce((sum, item) => sum + (Number.isInteger(item?.quantity) ? item.quantity : 0), 0);
       setCartCount(count);
     } catch (error) {
       setCartCount(0);
     }
   };

  const addToCart = useCallback(async (item: MenuItem) => {
    setAddingItem(item.id);

    try {
      const cart = await getCartSafe();
      const safeCart = cart as any[];
      const existingItemIndex = safeCart.findIndex((cartItem) => cartItem.id === item.id);
      if (existingItemIndex >= 0) {
        safeCart[existingItemIndex].quantity = clampQuantity(safeCart[existingItemIndex].quantity + 1);
      } else {
        safeCart.push({
          id: item.id,
          restaurantId: restaurantId,
          name: item.name,
          image: item.image,
          price: clampPrice(item.price),
          quantity: 1,
          category: item.category,
          itemTotal: item.price * 1,
        });
      }

      const saved = await saveCartSafe(safeCart);
      if (saved) {
        setCartCount(safeCart.reduce((sum, cartItem) => sum + cartItem.quantity, 0));
      }

      const scaleAnim = scaleAnims.get(item.id) || new Animated.Value(1);
      scaleAnims.set(item.id, scaleAnim);

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    } finally {
      setTimeout(() => setAddingItem(null), 300);
    }
  }, [scaleAnims, restaurantId]);

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'burgers', label: 'Burgers' },
    { key: 'sides', label: 'Sides' },
    { key: 'drinks', label: 'Drinks' },
    { key: 'dessert', label: 'Dessert' },
    { key: 'pizza', label: 'Pizza' },
    { key: 'sandwiches', label: 'Sandwiches' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading menu"
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </Animated.View>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredItems = activeCategory === 'all' ? menuItems : menuItems.filter(item => item.category === activeCategory);

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
          <Text style={styles.headerText}>Menu</Text>
          <TouchableOpacity 
            onPress={handleCartPress} 
            style={styles.cartButton}
            accessibilityLabel={`Cart with ${cartCount} items`}
            accessibilityRole="button"
          >
            <Text style={styles.cartButtonText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantRating}>⭐ {restaurant.rating} • {restaurant.deliveryTime}</Text>
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabs}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setActiveCategory(category.key)}
                style={[styles.tabButton, activeCategory === category.key && styles.activeTab]}
                accessibilityLabel={`Browse ${category.label} menu items`}
                accessibilityRole="tab"
              >
                <Text style={[styles.tabText, activeCategory === category.key && styles.activeTabText]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.menuContainer}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const scaleAnim = scaleAnims.get(item.id) || new Animated.Value(1);
                return (
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity 
                      onPress={() => addToCart(item)}
                      style={styles.menuItem}
                      accessibilityLabel={`Add ${item.name} to cart`}
                      accessibilityRole="button"
                      accessibilityState={{ busy: addingItem === item.id }}
                    >
                      <Image 
                        source={{ uri: item.image }} 
                        style={styles.menuItemImage}
                      />
                      <View style={styles.menuItemInfo}>
                        <Text style={styles.menuItemName}>{item.name}</Text>
                        <Text style={styles.menuItemDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                        <View style={styles.menuItemFooter}>
                          <Text style={styles.menuItemPrice}>₹{item.price}</Text>
                          <View style={[styles.addButton, addingItem === item.id && styles.addButtonLoading]}>
                            <Text style={styles.addButtonText}>+</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
          )}
        </View>
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
  cartButton: {
    position: 'relative',
    padding: DESIGN_TOKENS.spacing.xs,
  },
  cartButtonText: {
    fontSize: 24,
    color: DESIGN_TOKENS.colors.primary,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: DESIGN_TOKENS.colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  restaurantRating: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  restaurantAddress: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  tabsContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  tabs: {
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
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  activeTabText: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    elevation: 2,
  },
  menuItemImage: {
    width: 80,
    height: 80,
  },
  menuItemInfo: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.sm,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItemDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonLoading: { opacity: 0.5 },
  addButtonText: { fontSize: 20, color: 'white', fontWeight: 'bold' },

  emptyState: { padding: DESIGN_TOKENS.spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: 16, color: DESIGN_TOKENS.colors.textSecondary, fontFamily: DESIGN_TOKENS.typography.fontFamily },

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
});

export default RestaurantScreen;