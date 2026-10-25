import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { InvoiceFilterStatus } from '../types';
import { colors } from '../../../utils/colors';

interface FilterCounts {
  all: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
}

interface InvoiceFilterTabsProps {
  activeFilter: InvoiceFilterStatus;
  counts: FilterCounts;
  onSelectFilter: (filter: InvoiceFilterStatus) => void;
}

export const InvoiceFilterTabs: React.FC<InvoiceFilterTabsProps> = ({
  activeFilter,
  counts,
  onSelectFilter,
}) => {
  const tabs: { key: InvoiceFilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'Draft', label: 'Draft', count: counts.draft },
    { key: 'Sent', label: 'Sent', count: counts.sent },
    { key: 'Paid', label: 'Paid', count: counts.paid },
    { key: 'Overdue', label: 'Overdue', count: counts.overdue },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isSelected = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isSelected ? styles.tabItemSelected : styles.tabItemUnselected,
              ]}
              onPress={() => onSelectFilter(tab.key)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected ? styles.tabLabelSelected : styles.tabLabelUnselected,
                ]}
              >
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemSelected: {
    backgroundColor: colors.primary,
  },
  tabItemUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tabLabelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  tabLabelUnselected: {
    color: colors.textSecondary,
  },
});

export default InvoiceFilterTabs;
