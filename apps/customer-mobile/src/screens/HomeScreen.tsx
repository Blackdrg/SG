import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Animated, Easing, TouchableOpacityProps } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
}

export interface User {
  email: string;
  name?: string;
  phone?: string;
}

const HomeScreen = () => {
   const navigation = useNavigation();
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [user, setUser] = useState<User | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('sg_user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    };
    
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start();
        }, 1000);
      } catch (error) {
        setError('Failed to load restaurants. Pull to refresh.');
        setLoading(false);
        console.error('Failed to load restaurants:', error);
      }
    };
    
    loadUser();
    loadRestaurants();
  }, [fadeAnim, slideAnim]);

const handleRestaurantPress = (restaurantId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Restaurant', { restaurantId });
  };

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Search');
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Profile');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
        <Text style={styles.loadingText}>Finding the best restaurants...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerGreeting}
              accessible={true}
              accessibilityLabel={`Hello${user ? ', ' + (user.name?.split(' ')[0] || '') : ''}`}
            >
              {`Hello${user ? ', ' + (user.name?.split(' ')[0] || '') + '!' : ' there!'}`}
            </Text>
            <Text style={styles.headerSubtext}>What are you craving today?</Text>
          </View>
          <TouchableOpacity 
            onPress={handleProfilePress} 
            style={styles.headerRight}
            accessibilityLabel="View profile"
            accessibilityRole="button"
          >
            <Text style={styles.headerIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleSearchPress} 
          style={styles.searchBar}
          accessibilityLabel="Search restaurants and dishes"
          accessibilityRole="button"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchText}>Search restaurants, dishes…</Text>
        </TouchableOpacity>

         <View style={styles.categories}>
           {['Burgers', 'Pizza', 'Sandwiches', 'Salads'].map((cat) => (
             <TouchableOpacity 
               key={cat}
               style={[styles.categoryButton]}
               accessibilityLabel={`Browse ${cat} category`}
               accessibilityRole="button"
             >
               <Text style={styles.categoryText}>{cat}</Text>
             </TouchableOpacity>
           ))}
         </View>

        <View style={styles.restaurantsContainer}>
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item, index }) => (
              <AnimatedTouchableOpacity 
                onPress={() => handleRestaurantPress(item.id)} 
                style={styles.restaurantCard}
                delay={index * 100}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.restaurantImage}
                  accessibilityLabel={`${item.name} restaurant`}
                  onError={() => console.log('Image load failed')}
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
              </AnimatedTouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No restaurants found</Text>
                <Text style={styles.emptySubtext}>Try a different location or check back later</Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 80 }} />}
          />
        </View>
      </Animated.View>

      <View style={styles.bottomNav}
        accessible={true}
        accessibilityLabel="Main navigation"
        accessibilityRole="tablist"
      >
       {[
         { key: 'home', label: 'Home', icon: '🏠', path: 'Home' },
         { key: 'search', label: 'Search', icon: '🔍', path: 'Search' },
         { key: 'cart', label: 'Cart', icon: '🛒', path: 'Cart' },
         { key: 'profile', label: 'Profile', icon: '👤', path: 'Profile' },
       ].map((tab) => (
         <TouchableOpacity 
           key={tab.key}
           onPress={() => tab.key !== 'home' && navigation.navigate(tab.path)}
           style={styles.navItem}
           accessibilityLabel={tab.label}
           accessibilityRole="tab"
         >
           <Text style={styles.navIcon}>{tab.icon}</Text>
           <Text style={styles.navText}>{tab.label}</Text>
         </TouchableOpacity>
       ))}
      </View>
    </View>
  );
};

const AnimatedTouchableOpacity = ({ children, delay = 0, ...props }: TouchableOpacityProps) => {
  const animValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: DESIGN_TOKENS.motion.standard,
      delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [delay, animValue]);

  return (
    <Animated.View style={{ opacity: animValue, transform: [{ scale: animValue }] }}>
      <TouchableOpacity {...props}>{children}</TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.danger,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  retryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  headerLeft: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  headerSubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
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
    backgroundColor: DESIGN_TOKENS.colors.surface,
    padding: DESIGN_TOKENS.spacing.sm,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.sm,
    borderRadius: DESIGN_TOKENS.radius.md,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginRight: DESIGN_TOKENS.spacing.xs,
  },
  searchText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    flex: 1,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.border,
    borderRadius: DESIGN_TOKENS.radius.full,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  categoryText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '500',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  restaurantsContainer: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
    elevation: 3,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: DESIGN_TOKENS.spacing.sm,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  restaurantDescription: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptyState: {
    padding: DESIGN_TOKENS.spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  emptySubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.border,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default HomeScreen;