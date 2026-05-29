import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

// SCREEN_WIDTH was unused and removed

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  backgroundColor: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to SpiceGarden',
    subtitle: 'Your favourite food from top restaurants, delivered hot & fresh',
    icon: '🍽️',
    backgroundColor: '#1a1e2e',
  },
  {
    id: 'tracking',
    title: 'Live Order Tracking',
    subtitle: 'Track your order in real-time with GPS. Know exactly when your food arrives',
    icon: '📍',
    backgroundColor: '#16213e',
  },
  {
    id: 'safety',
    title: 'Safe & Reliable',
    subtitle: 'Verified restaurants, contactless delivery, and secure payments',
    icon: '🛡️',
    backgroundColor: '#0f3460',
  },
  {
    id: 'delivery',
    title: 'Lightning Fast Delivery',
    subtitle: 'Our drivers race against time to get your food to you ASAP',
    icon: '🚀',
    backgroundColor: '#1e4620',
  },
];

const OnboardingScreen = ({ navigation }: { navigation: NavigationProp<ParamListBase> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = useCallback((toIndex: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: toIndex > currentIndex ? 20 : -20,
          duration: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [currentIndex, fadeAnim, slideAnim]);

  const handleNext = async () => {
    if (currentIndex < onboardingSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      animateTransition(currentIndex + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('sg_onboarding_completed', 'true');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      animateTransition(currentIndex - 1);
    }
  };

  const currentSlide = onboardingSlides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.backgroundColor }]}>
      <View style={styles.progressContainer}>
        {onboardingSlides.map((slide, index) => (
          <View
            key={slide.id}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotCompleted,
            ]}
            accessible={true}
            accessibilityLabel={`Slide ${index + 1} of ${onboardingSlides.length}${index === currentIndex ? ', current' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: index === currentIndex }}
          />
        ))}
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }, { scale: scaleAnim }] 
          }
        ]}
      >
        <Text 
          style={styles.icon}
          accessible={false}
        >
          {currentSlide.icon}
        </Text>
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          {currentSlide.title}
        </Text>
        <Text 
          style={styles.subtitle}
          accessible={true}
        >
          {currentSlide.subtitle}
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.navigationRow}>
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.navButton}
              accessibilityLabel="Previous slide"
              accessibilityRole="button"
            >
              <Text style={styles.navButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton]}
            disabled={isLoading}
            accessibilityLabel={currentIndex === onboardingSlides.length - 1 ? "Get started" : "Next slide"}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={[styles.navButtonText, styles.nextButtonText]}>
              {isLoading 
                ? 'Loading...' 
                : currentIndex === onboardingSlides.length - 1 
                  ? 'Get Started' 
                  : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trustIndicators}>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>10,000+ Happy Customers</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>5-Star Rated Service</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Fast & Reliable Delivery</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: DESIGN_TOKENS.colors.success,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DESIGN_TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  subtitle: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
  },
  nextButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DESIGN_TOKENS.colors.textPrimary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
  nextButtonText: {
    color: 'white',
  },
  trustIndicators: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustIcon: {
    color: DESIGN_TOKENS.colors.success,
    fontSize: 16,
  },
  trustText: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default OnboardingScreen;