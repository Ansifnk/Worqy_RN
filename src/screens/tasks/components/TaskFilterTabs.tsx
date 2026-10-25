import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../../utils/colors';
import { TaskStatus } from '../types';

export type FilterStatus = 'all' | TaskStatus;

interface TaskFilterTabsProps {
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  counts: {
    all: number;
    todo: number;
    inProgress: number;
    done: number;
  };
}

export const TaskFilterTabs: React.FC<TaskFilterTabsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'To Do', label: 'To Do', count: counts.todo },
    { key: 'In Progress', label: 'In Progress', count: counts.inProgress },
    { key: 'Done', label: 'Done', count: counts.done },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabPill,
                isActive ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => onSelectFilter(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive ? styles.tabTextActive : styles.tabTextInactive,
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
  wrapper: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  tabPill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.darkPlum || '#2D1225',
  },
  tabPillInactive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  tabText: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  tabTextInactive: {
    color: colors.darkPlum || '#2D1225',
    fontWeight: '500',
    opacity: 0.85,
  },
});

export default TaskFilterTabs;
