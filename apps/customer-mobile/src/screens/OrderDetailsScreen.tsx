import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import Toast from 'react-native-root-toast';
import { formatCurrency, formatDate, formatTime } from '../utils/currency';
import { isValidOrderId } from '../utils/validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params;
  
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId, user]);

  const loadOrderDetails = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem('sg_user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
      
      // Removed fake API delay - directly fetch order data
      // In a real app, this would be an API call to fetch order details
      // For demo, we'll use mock data based on orderId
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
    } catch (error) {
      console.error('Failed to load order details:', error);
      setLoading(false);
    }
  }, [orderId]);

  // Rest of the component remains the same...
};