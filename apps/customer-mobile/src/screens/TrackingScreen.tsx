import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, ScrollView } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';

const TrackingScreen = () => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTrackingData();
    return () => { if (retryTimeout) clearTimeout(retryTimeout); };
  }, [orderId, retryCount, fadeAnim, slideAnim]);

  const loadTrackingData = useCallback(async () => {
    let retryTimeout: NodeJS.Timeout;
    
    try {
      setError(null);
      
      // Removed fake API delay - directly set tracking data
      
      const statuses: TrackingData['status'][] = ['preparing', 'ready', 'pickedUp', 'delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setTrackingData({
        orderId: orderId || 'SG' + Date.now().toString().slice(-5),
        status: randomStatus,
        location: {
          lat: 30.7333 + (Math.random() - 0.5) * 0.1,
          lng: 76.7794 + (Math.random() - 0.5) * 0.1,
        },
        estimatedTime: Math.max(0, 15 - Math.floor(Math.random() * 10)),
        restaurantName: 'Burger King',
        driverName: 'Raj Kumar',
        driverPhone: '+91 98765 43210',
      });
      
      setLoading(false);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: DESIGN_TOKENS.motion.page,
          easing: Easing.out(Easing.back(0.3)),
          useNativeDriver: true,
        }),
      ]).start();
    } catch (e) {
      setError('Failed to load tracking data. Please check your connection.');
      setLoading(false);
      
      if (retryCount < 3) {
        retryTimeout = setTimeout(() => {
          setRetryCount(c => c + 1);
        }, 3000);
      }
    }
  }, [orderId, retryCount]);

  // Rest of the component remains the same...
};