import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '@spicegarden/ui';
import { STRINGS } from '../constants/strings';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../constants/order.constants';

interface OrderTabsProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export const OrderTabs = ({ filter, onFilterChange }: OrderTabsProps) => {
  return (
    <View style={styles.tabsContainer}>
      <View style={styles.tabs}>
        {Object.keys(ORDER_STATUS).map((key) => {
          const statusKey = key as keyof typeof ORDER_STATUS;
          const statusValue = ORDER_STATUS[statusKey];
          return (
            <TouchableOpacity
              key={statusValue}
              onPress={() => onFilterChange(statusValue)}
              style={[styles.tabButton, filter === statusValue && styles.activeTab]}
              accessibilityLabel={STRINGS.accessibility.filterTab(ORDER_STATUS_LABELS[statusValue])}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === statusValue }}
            >
              <Text style={[styles.tabText, filter === statusValue && styles.activeTabText]}>
                {ORDER_STATUS_LABELS[statusValue]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  tabsContainer: {
    backgroundColor: DESIGN_TOKENS.colors.surface,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: DESIGN_TOKENS.spacing.xs,
  },
  tabButton: {
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: 8,
    marginRight: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DESIGN_TOKENS.colors.primary,
  },
  activeTabText: {
    color: DESIGN_TOKENS.colors.primary,
    fontWeight: '600',
  },
  tabText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: DESIGN_TOKENS.typography.fontFamily,
  },
});

export default OrderTabs;