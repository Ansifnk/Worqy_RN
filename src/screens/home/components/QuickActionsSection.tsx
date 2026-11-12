import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  UserPlus,
  CheckSquare,
  Receipt,
  CalendarPlus,
  FolderPlus,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface QuickActionsSectionProps {
  onAddClient: () => void;
  onAddTask: () => void;
  onAddInvoice: () => void;
  onAddSchedule: () => void;
  onAddProject?: () => void;
}

interface QuickActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onAddClient,
  onAddTask,
  onAddInvoice,
  onAddSchedule,
  onAddProject,
}) => {
  const actions: QuickActionItem[] = [
    {
      id: 'task',
      label: 'Add Task',
      icon: CheckSquare,
      iconColor: '#6C5CE7',
      bgColor: '#F4F2FE',
      borderColor: '#E8E5FD',
      onPress: onAddTask,
    },
    {
      id: 'schedule',
      label: 'Add Event',
      icon: CalendarPlus,
      iconColor: '#EA580C',
      bgColor: '#FFF4EB',
      borderColor: '#FEE5D4',
      onPress: onAddSchedule,
    },
    {
      id: 'project',
      label: 'Add Project',
      icon: FolderPlus,
      iconColor: '#16A34A',
      bgColor: '#EDFAF2',
      borderColor: '#D8F3E5',
      onPress: onAddProject || onAddTask,
    },
    {
      id: 'client',
      label: 'Add Client',
      icon: UserPlus,
      iconColor: '#0D9488',
      bgColor: '#F0FDFA',
      borderColor: '#CCFBF1',
      onPress: onAddClient,
    },
    {
      id: 'invoice',
      label: 'Add Invoice',
      icon: Receipt,
      iconColor: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FEF3C7',
      onPress: onAddInvoice,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Create</Text>
      </View>

      <View style={styles.actionGrid}>
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View
                style={[
                  styles.iconWrapper,
                  {
                    backgroundColor: action.bgColor,
                    borderColor: action.borderColor,
                  },
                ]}
              >
                <IconComponent
                  size={20}
                  color={action.iconColor}
                  strokeWidth={2.2}
                />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default QuickActionsSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.3,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EFF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkText,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
