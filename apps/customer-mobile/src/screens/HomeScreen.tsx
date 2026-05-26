import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userJson = await AsyncStorage.getItem('sg_user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    };
    
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // For demo, using mock data
        setTimeout(() => {
          setRestaurants([
            {
              id: 'rest-001',
              name: 'Burger King',
              description: 'Flame-grilled burgers & fries',
              rating: 4.2,
              deliveryTime: '25-30 min',
              distance: '3.2 km',
              image: 'https://example.com/burger-king.jpg',
            },
            {
              id: 'rest-002',
              name: 'Pizza Hut',
              description: 'Freshly baked pizzas',
              rating: 4.5,
              deliveryTime: '30-35 min',
              distance: '2.1 km',
              image: 'https://example.com/pizza-hut.jpg',
            },
            {
              id: 'rest-003',
              name: 'Subway',
              description: 'Fresh made sandwiches',
              rating: 4.0,
              deliveryTime: '15-20 min',
              distance: '1.8 km',
              image: 'https://example.com/subway.jpg',
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setLoading(false);
      }
    };
    
    loadUser();
    loadRestaurants();
  }, []);

  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('Restaurant', { restaurantId });
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f04e31" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>
            {user ? `Hi, ${user.name?.split(' ')[0] || ''}!` : 'Hi there!'}
          </Text>
          <Text style={styles.headerSubtext}>What are you craving today?</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress} style={styles.headerRight}>
          <Text style={styles.headerIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity onPress={handleSearchPress} style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>Search restaurants, dishes…</Text>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        <TouchableOpacity 
          style={[styles.categoryButton, styles.activeCategory]} 
          onPress={() => {}}>
          <Text style={styles.categoryText}>Burgers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.categoryButton} 
          onPress={() => {}}>
          <Text style={styles.categoryText}>Pizza</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.categoryButton} 
          onPress={() => {}}>
          <Text style={styles.categoryText}>Sandwiches</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.categoryButton} 
          onPress={() => {}}>
          <Text style={styles.categoryText}>Salads</Text>
        </TouchableOpacity>
      </View>

      {/* Restaurants List */}
      <View style={styles.restaurantsContainer}>
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleRestaurantPress(item.id)}
              style={styles.restaurantCard}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <Text style={styles.restaurantDescription}>{item.description}</Text>
                <View style={styles.restaurantDetails}>
                  <Text style={styles.detailText}>⭐ {item.rating}</Text>
                  <Text style={styles.detailText}>⏱ {item.deliveryTime}</Text>
                  <Text style={styles.detailText}>📍 {item.distance}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 80 }} />}
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => {}} style={styles.navItem}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSearchPress} style={styles.navItem}>
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCartPress} style={styles.navItem}>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfilePress} style={styles.navItem}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
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
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: '#999',
    marginRight: 8,
  },
  searchText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  activeCategory: {
    backgroundColor: '#f04e31',
    borderColor: '#f04e31',
  },
  categoryText: {
    fontSize: 14,
    color: '#f04e31',
    fontWeight: '500',
  },
  restaurantsContainer: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  restaurantDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#999',
  },
});

export default HomeScreen;