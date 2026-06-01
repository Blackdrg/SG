import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Easing, Image, ScrollView, Alert } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import { formatCurrency } from '../utils/currency';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCartSafe } from '../utils/storage';

const RestaurantScreen = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingItem, setAddingItem] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(new Map<string, Animated.Value>()).current;

  useEffect(() => {
    const restaurantIdFromRoute = /* get from route params */;
    setRestaurantId(restaurantIdFromRoute);
    loadData();
    loadCartCount();
  }, [restaurantId, fadeAnim]);

  const loadData = useCallback(async () => {
    try {
      // Removed fake API delay - directly set data
      
      const restaurants: Record<string, RestaurantInfo> = {
        'rest-001': { id: 'rest-001', name: 'Burger King', rating: 4.2, deliveryTime: '25-30 min', address: 'Phase 5, Mohali' },
        'rest-002': { id: 'rest-002', name: 'Pizza Hut', rating: 4.5, deliveryTime: '30-35 min', address: 'Phase 7, Mohali' },
        'rest-003': { id: 'rest-003', name: 'Subway', rating: 4.0, deliveryTime: '15-20 min', address: 'Sector 17, Chandigarh' },
      };
      
      setRestaurant(restaurants[restaurantId] || null);
      
      let items: MenuItem[] = [];
      if (restaurantId === 'rest-001') {
        items = [
          { id: 'item-001', name: 'Whopper', description: 'Flame-grilled beef patty with fresh lettude', price: 149, category: 'burgers', image: 'https://example.com/whopper.jpg' },
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
  }, [restaurantId, fadeAnim]);

  // Rest of the component remains the same...
};