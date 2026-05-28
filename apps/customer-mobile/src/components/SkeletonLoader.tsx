import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = 20, borderRadius = 4, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: DESIGN_TOKENS.colors.elevated,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const RestaurantSkeleton: React.FC = () => {
  return (
    <View style={styles.restaurantSkeleton}>
      <Skeleton width="100%" height={100} borderRadius={DESIGN_TOKENS.radius.card} />
      <View style={styles.restaurantSkeletonContent}>
        <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={16} style={{ marginBottom: 12 }} />
        <View style={styles.restaurantSkeletonDetails}>
          <Skeleton width={60} height={14} />
          <Skeleton width={80} height={14} />
          <Skeleton width={70} height={14} />
        </View>
      </View>
    </View>
  );
};

export const OrderTrackingSkeleton: React.FC = () => {
  return (
    <View style={styles.trackingSkeleton}>
      <View style={styles.trackingHeader}>
        <Skeleton width={120} height={24} />
        <Skeleton width={80} height={20} />
      </View>
      
      <View style={styles.timelineSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.timelineRowSkeleton}>
            <Skeleton width={26} height={26} borderRadius={13} />
            <Skeleton width="100%" height={1} style={{ flex: 1, marginHorizontal: 10 }} />
            <Skeleton width={100} height={16} />
          </View>
        ))}
      </View>

      <Skeleton width="100%" height={150} borderRadius={DESIGN_TOKENS.radius.card} style={{ margin: 16 }} />

      <View style={styles.driverSkeleton}>
        <Skeleton width={50} height={50} borderRadius={25} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Skeleton width="40%" height={18} style={{ marginBottom: 6 }} />
          <Skeleton width="60%" height={14} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#333',
  },
  restaurantSkeleton: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.xs,
    backgroundColor: DESIGN_TOKENS.colors.surface,
    borderRadius: DESIGN_TOKENS.radius.card,
    overflow: 'hidden',
  },
  restaurantSkeletonContent: {
    padding: DESIGN_TOKENS.spacing.sm,
  },
  restaurantSkeletonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackingSkeleton: {
    flex: 1,
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  trackingHeader: {
    padding: DESIGN_TOKENS.spacing.md,
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  timelineSkeleton: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    marginVertical: DESIGN_TOKENS.spacing.lg,
  },
  timelineRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.surface,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.card,
  },
});