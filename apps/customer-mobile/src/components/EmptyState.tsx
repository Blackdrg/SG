import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';

interface EmptyStateProps {
  onNavigateHome: () => void;
}

export const EmptyState = ({ onNavigateHome }: EmptyStateProps) => {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>{STRINGS.orderHistory.empty}</Text>
      <Text style={styles.emptySubtext}>{STRINGS.orderHistory.emptySubtext}</Text>
      <TouchableOpacity 
        onPress={onNavigateHome}
        style={styles.primaryButton}
        accessibilityLabel={STRINGS.cart.browseRestaurants}
        accessibilityRole="button"
      >
        <Text style={styles.primaryButtonText}>{STRINGS.cart.browseRestaurants}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: DESIGN_TOKENS.spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textPrimary,
    marginBottom: 8,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginBottom: 20,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: DESIGN_TOKENS.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: DESIGN_TOKENS.radius.button,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default EmptyState;