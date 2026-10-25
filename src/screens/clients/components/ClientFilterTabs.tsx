import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export type FilterStatus = 'all' | 'active' | 'completed';

export interface FilterTabItem {
  id: FilterStatus;
  label: string;
  count: number;
}

interface ClientFilterTabsProps {
  selectedTab: FilterStatus;
  onSelectTab: (tab: FilterStatus) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const ClientFilterTabs: React.FC<ClientFilterTabsProps> = ({
  selectedTab,
  onSelectTab,
  counts,
}) => {
  const tabs: FilterTabItem[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                isSelected ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected ? styles.tabTextActive : styles.tabTextInactive,
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

export default ClientFilterTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#1C1917',
  },
  tabTextInactive: {
    fontWeight: '500',
    color: '#7C7670',
  },
});
