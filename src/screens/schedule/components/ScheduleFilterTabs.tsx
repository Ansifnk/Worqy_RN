import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  LayoutGrid,
  Video,
  FileText,
  AlertCircle,
  Bell,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ScheduleType } from '../types';

export type ScheduleFilterType = 'all' | ScheduleType;

interface ScheduleFilterTabsProps {
  activeFilter: ScheduleFilterType;
  onSelectFilter: (filter: ScheduleFilterType) => void;
  counts: {
    all: number;
    Meeting: number;
    Task: number;
    Deadline: number;
    Reminder: number;
  };
}

export const ScheduleFilterTabs: React.FC<ScheduleFilterTabsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  const tabs: {
    key: ScheduleFilterType;
    label: string;
    count: number;
    icon: any;
    accentColor: string;
  }[] = [
    {
      key: 'all',
      label: 'All',
      count: counts.all,
      icon: LayoutGrid,
      accentColor: colors.primary,
    },
    {
      key: 'Meeting',
      label: 'Meetings',
      count: counts.Meeting,
      icon: Video,
      accentColor: '#7C3AED',
    },
    {
      key: 'Task',
      label: 'Tasks',
      count: counts.Task,
      icon: FileText,
      accentColor: '#16A34A',
    },
    {
      key: 'Deadline',
      label: 'Deadlines',
      count: counts.Deadline,
      icon: AlertCircle,
      accentColor: '#D97706',
    },
    {
      key: 'Reminder',
      label: 'Reminders',
      count: counts.Reminder,
      icon: Bell,
      accentColor: '#0284C7',
    },
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
          const TabIcon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabPill,
                isActive ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => onSelectFilter(tab.key)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label}, ${tab.count} events`}
            >
              <TabIcon
                size={14}
                color={isActive ? colors.white : tab.accentColor}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive
                    ? styles.countBadgeActive
                    : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive
                      ? styles.countTextActive
                      : styles.countTextInactive,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ScheduleFilterTabs;

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 6,
  },
  container: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tabPillInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  tabLabelInactive: {
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.white,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeInactive: {
    backgroundColor: '#EEF2F1',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countTextInactive: {
    color: colors.textSecondary,
  },
  countTextActive: {
    color: colors.white,
  },
});

