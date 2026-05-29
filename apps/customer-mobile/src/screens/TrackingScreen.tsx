import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation, NavigationProp, ParamListBase, RouteProp } from '@react-navigation/native';

import { DESIGN_TOKENS } from '@spicegarden/ui';

type TrackingScreenRouteProp = RouteProp<{ Tracking: { orderId: string } }, 'Tracking'>;

interface TrackingData {
  orderId: string;
  status: 'preparing' | 'ready' | 'pickedup' | 'delivered';
  location: { lat: number; lng: number };
  estimatedTime: number;
  restaurantName: string;
  driverName: string;
  driverPhone: string;
}

interface OrderStatus {
  id: string;
  label: string;
  done: boolean;
}

const TrackingScreen = () => {
  const route = useRoute<TrackingScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { orderId } = route.params || {};
  
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    const loadTrackingData = async () => {
      try {
        setError(null);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statuses: TrackingData['status'][] = ['preparing', 'ready', 'pickedup', 'delivered'];
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
    };

    loadTrackingData();
    return () => { if (retryTimeout) clearTimeout(retryTimeout); };
  }, [orderId, retryCount, fadeAnim, slideAnim]);

  useEffect(() => {
    if (trackingData?.status !== 'delivered') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: DESIGN_TOKENS.motion.standard,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: DESIGN_TOKENS.motion.standard,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [trackingData?.status, pulseAnim]);

   const handleCallDriver = useCallback(() => {
     if (!trackingData) return;
     Alert.alert(
       'Call Driver',
       `Call ${trackingData.driverName} at ${trackingData.driverPhone}?`,
       [
         { text: 'Cancel', style: 'cancel' },
         { text: 'Call', onPress: undefined }
       ]
     );
   }, [trackingData]);

  const handleSupport = useCallback(() => {
    Alert.alert(
      'Contact Support',
      'Our support team will help you with your order.',
      [{ text: 'OK' }]
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}
        accessible={true}
        accessibilityLabel="Loading order tracking"
        accessibilityRole="progressbar"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📶</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')} 
          style={styles.primaryButton}
          accessibilityLabel="Go to home"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusLabels: Record<string, string> = {
    preparing: 'Preparing your order',
    ready: 'Ready for pickup',
    pickedup: 'Picked up by driver',
    delivered: 'Delivered',
  };

  const statusColors: Record<string, string> = {
    preparing: DESIGN_TOKENS.colors.warning,
    ready: DESIGN_TOKENS.colors.warning,
    pickedup: DESIGN_TOKENS.colors.warning,
    delivered: DESIGN_TOKENS.colors.success,
  };

  const statusSteps: OrderStatus[] = [
    { id: 'placed', label: 'Order Placed', done: true },
    { id: 'preparing', label: 'Preparing', done: ['preparing', 'ready', 'pickedup', 'delivered'].includes(trackingData?.status || '') },
    { id: 'ready', label: 'Ready for Pickup', done: ['ready', 'pickedup', 'delivered'].includes(trackingData?.status || '') },
    { id: 'pickedup', label: 'Picked Up', done: ['pickedup', 'delivered'].includes(trackingData?.status || '') },
    { id: 'delivered', label: 'Delivered', done: trackingData?.status === 'delivered' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Track Order</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderIdText}>Order #{trackingData?.orderId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[trackingData?.status || 'preparing'] + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[trackingData?.status || 'preparing'] }]}>
              {statusLabels[trackingData?.status || 'preparing']}
            </Text>
          </View>
        </View>

        <View style={styles.timelineContainer}>
          {statusSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineRow}>
              <Animated.View style={[
                styles.timelineDot, 
                step.done && styles.timelineDotDone,
                { transform: [{ scale: step.done ? pulseAnim : 1 }] }
              ]}>
                {step.done ? (
                  <Text style={styles.timelineCheck}>✓</Text>
                ) : (
                  <Text style={styles.timelineNumber}>{index + 1}</Text>
                )}
              </Animated.View>
              {index < statusSteps.length - 1 && (
                <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
              )}
              <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {trackingData?.location && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapHeader}>Live Tracking</Text>
            <Animated.View style={[styles.mapPreview, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.mapText}>🗺️</Text>
              <Text style={styles.mapSubtext}>Tracking driver location...</Text>
            </Animated.View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Driver Location</Text>
              <Text style={styles.locationText}>
                {trackingData.location.lat.toFixed(4)}, {trackingData.location.lng.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        {trackingData && (
          <View style={styles.driverInfo}>
            <Text style={styles.driverInfoTitle}>Your Driver</Text>
            <View style={styles.driverInfoRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverAvatarText}>👨‍💼</Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{trackingData.driverName}</Text>
                <Text style={styles.driverPhone}>📞 {trackingData.driverPhone}</Text>
              </View>
            </View>
          </View>
        )}

        {trackingData && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>Estimated Arrival</Text>
            <Text style={styles.etaTime}>
              {trackingData.estimatedTime > 0 
                ? `${trackingData.estimatedTime} mins` 
                : 'Arriving now!'}
            </Text>
          </View>
        )}

        {trackingData?.status !== 'delivered' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              onPress={handleCallDriver}
              style={styles.callButton}
              accessibilityLabel="Call driver"
              accessibilityRole="button"
            >
              <Text style={styles.callButtonText}>📞 Call Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSupport}
              style={styles.supportButton}
              accessibilityLabel="Contact support"
              accessibilityRole="button"
            >
              <Text style={styles.supportButtonText}>💬 Support</Text>
            </TouchableOpacity>
          </View>
        )}

        {trackingData?.status === 'delivered' && (
          <View style={styles.deliveredContainer}>
            <Text style={styles.deliveredIcon}>🎉</Text>
            <Text style={styles.deliveredText}>Order Delivered!</Text>
            <Text style={styles.deliveredSubtext}>Enjoy your meal!</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
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
  orderInfo: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.md,
    margin: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DESIGN_TOKENS.radius.full,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timelineContainer: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
  },
  timelineDotDone: {
    backgroundColor: DESIGN_TOKENS.colors.success,
    borderColor: DESIGN_TOKENS.colors.success,
  },
  timelineCheck: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineNumber: {
    color: DESIGN_TOKENS.colors.textSecondary,
    fontSize: 12,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: DESIGN_TOKENS.colors.border,
    marginHorizontal: 8,
  },
  timelineLineDone: {
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
  timelineLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  timelineLabelDone: {
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
  },
  mapContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  mapHeader: {
    fontSize: 16,
    fontWeight: '600',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.border,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  mapPreview: {
    height: 150,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 32,
  },
  mapSubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  locationInfo: {
    padding: DESIGN_TOKENS.spacing.md,
  },
  locationLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  driverInfo: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  driverInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: DESIGN_TOKENS.spacing.sm,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    backgroundColor: DESIGN_TOKENS.colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DESIGN_TOKENS.spacing.sm,
  },
  driverAvatarText: {
    fontSize: 20,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  driverPhone: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etaContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    padding: DESIGN_TOKENS.spacing.md,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  etaLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  etaTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.primary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    gap: DESIGN_TOKENS.spacing.sm,
    marginBottom: DESIGN_TOKENS.spacing.xl,
  },
  callButton: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.success,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  callButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  supportButton: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.elevated,
    paddingVertical: 14,
    borderRadius: DESIGN_TOKENS.radius.button,
    alignItems: 'center',
  },
  supportButtonText: {
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
    fontSize: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  deliveredContainer: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xxl,
  },
  deliveredIcon: {
    fontSize: 48,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  deliveredText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.success,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  deliveredSubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default TrackingScreen;