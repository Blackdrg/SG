import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { io, Socket } from 'socket.io-client';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface Order {
  id: string;
  customerName: string;
  address: string;
  items: Array<{ name: string; quantity: number }>;
  eta: number;
  status: 'assigned' | 'picked_up' | 'on_way' | 'delivered';
}

const DriverApp = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [route, setRoute] = useState<Location[]>([]);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [eta, setEta] = useState(0);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket'],
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to tracking server');
    });

    socketInstance.on('orderAssigned', (data: Order) => {
      setOrder(data);
      Alert.alert('New Order', `Order #${data.id} assigned. Tap to accept.`);
    });

    socketInstance.on('etaUpdate', (data: { orderId: string; etaMinutes: number }) => {
      if (data.orderId === order?.id) {
        setEta(data.etaMinutes);
      }
    });

    return () => {
      socketInstance.disconnect();
      if (watchId !== null && Platform.OS === 'android') {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (location && order && isOnline) {
      // Send location update every 5 seconds
      const interval = setInterval(() => {
        socket?.emit('updateLocation', {
          driverId: 'driver-' + Date.now(), // In real app, use actual driver ID
          lat: location.latitude,
          lng: location.longitude,
          speed: location.speed,
          heading: location.heading,
          timestamp: Date.now(),
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [location, order, isOnline]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'SpiceGarden needs access to your location for delivery tracking.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startLocationTracking();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      startLocationTracking();
    }
  };

  const startLocationTracking = () => {
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
        });
      },
      (error) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Could not get location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  const goOnline = () => {
    setIsOnline(true);
    setIsAvailable(true);
    socket?.emit('driverOnline', { driverId: 'driver-' + Date.now() });
  };

  const goOffline = () => {
    setIsOnline(false);
    setIsAvailable(false);
    socket?.emit('driverOffline', { driverId: 'driver-' + Date.now() });
  };

  const acceptOrder = () => {
    if (order) {
      setOrder({ ...order, status: 'picked_up' });
      socket?.emit('orderAccepted', { orderId: order.id });
    }
  };

  const updateDeliveryStatus = (status: Order['status']) => {
    if (order) {
      setOrder({ ...order, status });
      socket?.emit('deliveryStatusUpdate', { orderId: order.id, status });
    }
  };

  const calculateDistance = (loc1: Location, loc2: Location) => {
    const R = 6371e3;
    const φ1 = loc1.latitude * Math.PI / 180;
    const φ2 = loc2.latitude * Math.PI / 180;
    const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Driver App</Text>
        <TouchableOpacity
          style={[styles.statusButton, isOnline ? styles.onlineButton : styles.offlineButton]}
          onPress={isOnline ? goOffline : goOnline}
        >
          <Text style={styles.statusButtonText}>
            {isOnline ? 'Online' : 'Go Online'}
          </Text>
        </TouchableOpacity>
      </View>

      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          followsUserLocation
        >
          {order && (
            <>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
              />
              {route.length > 0 && (
                <Polyline
                  coordinates={route}
                  strokeColor="#6366f1"
                  strokeWidth={3}
                />
              )}
              <Circle
                center={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                radius={500}
                strokeColor="#6366f1"
                fillColor="rgba(99, 102, 241, 0.2)"
              />
            </>
          )}
        </MapView>
      )}

      {order && (
        <View style={styles.orderCard}>
          <Text style={styles.orderTitle}>Order #{order.id}</Text>
          <Text style={styles.orderCustomer}>{order.customerName}</Text>
          <Text style={styles.orderAddress}>{order.address}</Text>
          
          <Text style={styles.etaText}>ETA: {eta} minutes</Text>
          
          <View style={styles.orderActions}>
            {order.status === 'assigned' && (
              <TouchableOpacity style={styles.actionButton} onPress={acceptOrder}>
                <Text style={styles.actionButtonText}>Accept Order</Text>
              </TouchableOpacity>
            )}
            {order.status === 'picked_up' && (
              <TouchableOpacity style={styles.actionButton} onPress={() => updateDeliveryStatus('on_way')}>
                <Text style={styles.actionButtonText}>Start Delivery</Text>
              </TouchableOpacity>
            )}
            {order.status === 'on_way' && (
              <TouchableOpacity style={styles.actionButton} onPress={() => updateDeliveryStatus('delivered')}>
                <Text style={styles.actionButtonText}>Mark Delivered</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!location && (
        <View style={styles.locationWarning}>
          <Text style={styles.locationWarningText}>
            Waiting for location permissions...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  onlineButton: {
    backgroundColor: '#22c55e',
  },
  offlineButton: {
    backgroundColor: '#6366f1',
  },
  statusButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  orderCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  etaText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 12,
  },
  orderActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  locationWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationWarningText: {
    fontSize: 16,
    color: '#666',
  },
});

export default DriverApp;