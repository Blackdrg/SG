import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';

interface LoadingStateProps {
  showText?: boolean;
}

export const LoadingState = ({ showText = true }: LoadingStateProps) => {
  return (
    <View style={styles.loadingContainer} accessible={true} accessibilityLabel={STRINGS.accessibility.loading} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={DESIGN_TOKENS.colors.primary} />
      {showText && (
        <Text style={styles.loadingText} accessibilityLabel={STRINGS.orderHistory.loading}>
          {STRINGS.orderHistory.loading}
        </Text>
      )}
    </View>
  );
};

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 16,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default LoadingState;