import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RestaurantScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load menu items for the restaurant
    // In a real app, this would be an API call
    setTimeout(() => {
      // Mock data based on restaurantId
      let items = [];
      if (restaurantId === 'rest-001') { // Burger King
        items = [
          { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty', price: 149, category: 'burgers', image: 'https://example.com/whopper.jpg' },
          { id: 'item-002', name: 'Double Whopper', description: 'Two flame-grilled beef patties', price: 199, category: 'burgers', image: 'https://example.com/double-whopper.jpg' },
          { id: 'item-003', name: 'Chicken Fries', description: 'Crispy chicken fries', price: 99, category: 'sides', image: 'https://example.com/chicken-fries.jpg' },
          { id: 'item-004', name: 'Onion Rings', description: 'Crispy onion rings', price: 79, category: 'sides', image: 'https://example.com/onion-rings.jpg' },
          { id: 'item-005', name: 'Coke', description: '330ml Can', price: 49, category: 'drinks', image: 'https://example.com/coke.jpg' },
          { id: 'item-006', name: 'Sprite', description: '330ml Can', price: 49, category: 'drinks', image: 'https://example.com/sprite.jpg' },
        ];
      } else if (restaurantId === 'rest-002') { // Pizza Hut
        items = [
          { id: 'item-007', name: 'Margherita Pizza', description: 'Fresh mozzarella & tomatoes', price: 299, category: 'pizza', image: 'https://example.com/margherita.jpg' },
          { id: 'item-008', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni', price: 349, category: 'pizza', image: 'https://example.com/pepperoni.jpg' },
          { id: 'item-009', name: 'Garlic Bread', description: 'Toasted with garlic butter', price: 129, category: 'sides', image: 'https://example.com/garlic-bread.jpg' },
          { id: 'item-010', name: 'Chicken Wings', description: 'Spicy buffalo wings', price: 199, category: 'sides', image: 'https://example.com/chicken-wings.jpg' },
          { id: 'item-011', name: 'Pepsi', description: '500ml Bottle', price: 59, category: 'drinks', image: 'https://example.com/pepsi.jpg' },
          { id: 'item-012', name: 'Chocolate Cake', description: 'Rich chocolate fudge cake', price: 149, category: 'dessert', image: 'https://example.com/chocolate-cake.jpg' },
        ];
      } else { // Subway or default
        items = [
          { id: 'item-013', name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 249, category: 'sandwiches', image: 'https://example.com/chicken-teriyaki.jpg' },
          { id: 'item-014', name: 'Turkey Breast', description: 'Sliced turkey breast sub', price: 229, category: 'sandwiches', image: 'https://example.com/turkey-breast.jpg' },
          { id: 'item-015', name: 'Italian B.M.T.', description: 'Salami, pepperoni & ham', price: 269, category: 'sandwiches', image: 'https://example.com/italian-bmt.jpg' },
          { id: 'item-016', name: 'Chips', description: 'Potato chips', price: 49, category: 'sides', image: 'https://example.com/chips.jpg' },
          { id: 'item-017', name: 'Cookie', description: 'Chocolate chip cookie', price: 39, category: 'dessert', image: 'https://example.com/cookie.jpg' },
          { id: 'item-018', name: 'Dasani Water', description: '500ml Bottled Water', price: 29, category: 'drinks', image: 'https://example.com/water.jpg' },
        ];
      }
      
      setMenuItems(items);
      setLoading(false);
    }, 800);
    
    // Load cart count from storage
    loadCartCount();
  }, [restaurantId]);

  const loadCartCount = async () => {
    try {
      const cartJson = await AsyncStorage.getItem('sg_cart');
      if (cartJson) {
        const cart = JSON.parse(cartJson);
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const addToCart = (item) => {
    // Add item to cart in storage
    AsyncStorage.getItem('sg_cart').then((cartJson) => {
      let cart = [];
      if (cartJson) {
        cart = JSON.parse(cartJson);
      }
      
      // Check if item already in cart
      const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
      if (existingItemIndex >= 0) {
        // Increase quantity
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item
        cart.push({ ...item, quantity: 1 });
      }
      
      // Save updated cart
      AsyncStorage.setItem('sg_cart', JSON.stringify(cart));
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    }).catch(error => {
      console.error('Failed to update cart:', error);
    });
  };

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Loading menu...</Text>
        </View>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Please wait</Text>
        </View>
      </View>
    );
  }

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Menu</Text>
        <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
          <Text style={styles.cartButtonText}>🛒</Text>
          {cartCount > 0 && (
            <Text style={styles.cartBadge}>{cartCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Restaurant Info (would normally come from API) */}
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>Restaurant Name</Text>
        <Text style={styles.restaurantRating}>⭐ 4.2 • 25-30 min</Text>
      </View>

      {/* Category Tabs */}
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
              style={[
                styles.tabButton,
                activeCategory === category.key && styles.activeTab
              ]}
            >
              <Text style={styles.tabText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items in this category</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => addToCart(item)}
                style={styles.menuItem}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.menuItemImage}
                />
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                  <View style={styles.menuItemFooter}>
                    <Text style={styles.menuItemPrice}>&#8377;{item.price}</Text>
                    <Text style={styles.menuItemAdd}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
};

// Import ScrollView since we're using it
import { ScrollView } from 'react-native';

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
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartButtonText: {
    fontSize: 24,
    color: '#f04e31',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f04e31',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    minWidth: 18,
    textAlign: 'center',
  },
  restaurantInfo: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  restaurantRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: 'white',
  },
  tabs: {
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
    fontSize: 16,
    color: activeCategory === category.key ? '#f04e31' : '#666',
    fontWeight: activeCategory === category.key ? '600' : 'normal',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  menuItemImage: {
    width: 80,
    height: 80,
  },
  menuItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  menuItemAdd: {
    fontSize: 24,
    color: '#f04e31',
    fontWeight: 'bold',
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default RestaurantScreen;