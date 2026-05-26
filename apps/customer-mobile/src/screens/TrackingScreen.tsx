import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrackingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;
  
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState('preparing');

  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
        
        // In a real app, this would connect to a WebSocket or make API calls
        // For demo, we'll simulate tracking data
        setTimeout(() => {
          // Simulate different order statuses
          const statuses = ['preparing', 'ready', 'pickedup', 'delivered'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          setOrderStatus(randomStatus);
          
          // Simulate location data
          const location = {
            lat: 30.7333 + (Math.random() - 0.5) * 0.1, // Around Chandigarh
            lng: 76.7794 + (Math.random() - 0.5) * 0.1,
          };
          
          setTrackingData({
            orderId: orderId || 'SG12345',
            status: randomStatus,
            location: location,
            estimatedTime: Math.max(0, 15 - Math.floor(Math.random() * 10)), // Decreasing ETA
            restaurantName: 'Burger King',
            customerName: user?.name || 'Customer',
            driverName: 'Raj Kumar',
            driverPhone: '+91 98765 43210',
          });
          
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Failed to load tracking data:', error);
        setLoading(false);
      }
    };

    loadTrackingData();
  }, [orderId, user]);

  const statusLabels = {
    preparing: 'Preparing your order',
    ready: 'Ready for pickup',
    pickedup: 'Picked up by driver',
    delivered: 'Delivered',
  };

  const statusColors = {
    preparing: '#ff9800',
    ready: '#ff9800',
    pickedup: '#ff9800',
    delivered: '#4caf50',
  };

  const statusSteps = [
    { id: 'placed', label: 'Order Placed', done: true },
    { id: 'preparing', label: 'Preparing', done: orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'ready', label: 'Ready for Pickup', done: orderStatus === 'ready' || orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'pickedup', label: 'Picked Up', done: orderStatus === 'pickedup' || orderStatus === 'delivered' },
    { id: 'delivered', label: 'Delivered', done: orderStatus === 'delivered' },
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f04e31" />
        <Text style={styles.loadingText}>Loading tracking information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Track Order</Text>
      </View>

      <View style={styles.content}>
        {/* Order Info */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderIdText}>Order #{trackingData?.orderId}</Text>
          <Text style={styles.orderStatusText}>
            <Text style={[styles.statusBadge, { backgroundColor: statusColors[orderStatus as keyof typeof statusColors] + '20' }]}>
              {statusLabels[orderStatus as keyof typeof statusLabels]}
            </Text>
          </Text>
        </View>

        {/* Tracking Steps */}
        <View style={styles.stepsContainer}>
          {statusSteps.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={[
                styles.stepCircle,
                step.done && styles.stepCircleDone
              ]}>
                {step.done ? '✓' : index + 1}
              </View>
              <View style={styles.stepLine} />
              <Text style={styles.stepText}>{step.label}</Text>
            </View>
          ))}
        </View>

        {/* Live Tracking Map (simplified) */}
        {trackingData?.location && (
          <View style={styles.mapContainer}>
            <Text style={styles.mapHeader}>Live Tracking</Text>
            <View style={styles.mapPreview}>
              {/* In a real app, this would be a map component */}
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapText}>🗺️</Text>
                <Text style={styles.mapSubtext}>Tracking driver location...</Text>
              </View>
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Driver Location</Text>
              <Text style={styles.locationText}>
                {trackingData?.location?.lat.toFixed(4)}, {trackingData?.location?.lng.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        {/* Driver Info */}
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

        {/* ETA */}
        {trackingData && (
          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>Estimated Time of Arrival</Text>
            <Text style={styles.etaTime}>
              {trackingData.estimatedTime > 0 
                ? `${trackingData.estimatedTime} mins` 
                : 'Delivered!'}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        {orderStatus !== 'delivered' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              onPress={() => {/* TODO: Implement call driver */}}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Call Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {/* TODO: Implement contact support */}}
              style={[styles.actionButton, styles.secondaryActionButton]}
            >
              <Text style={styles.secondaryActionButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 16,
  },
  orderInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderStatusText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepCircleDone: {
    backgroundColor: '#4caf50',
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: '#eee',
  },
  stepText: {
    fontSize: 14,
    color: '#666',
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapHeader: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapPreview: {
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 24,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  locationInfo: {
    padding: 12,
  },
  locationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  driverInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  driverInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 12,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    backgroundColor: '#f04e31',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 20,
    color: 'white',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: '#666',
  },
  etaContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  etaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  etaTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f04e31',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f04e31',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  secondaryActionButton: {
    backgroundColor: '#ddd',
  },
  secondaryActionButtonText: {
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TrackingScreen;