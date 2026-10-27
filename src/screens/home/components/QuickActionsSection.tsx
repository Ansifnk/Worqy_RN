import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { UserPlus, CheckSquare, Receipt, CalendarPlus } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface QuickActionsSectionProps {
  onAddClient: () => void;
  onAddTask: () => void;
  onAddInvoice: () => void;
  onAddSchedule: () => void;
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
}) => {
  const actions: QuickActionItem[] = [
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
      id: 'task',
      label: 'Add Task',
      icon: CheckSquare,
      iconColor: '#6366F1',
      bgColor: '#EEF2FF',
      borderColor: '#E0E7FF',
      onPress: onAddTask,
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
    {
      id: 'schedule',
      label: 'Add Schedule',
      icon: CalendarPlus,
      iconColor: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#E0F2FE',
      onPress: onAddSchedule,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>

      <View style={styles.actionGrid}>
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.7}
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
                  size={22}
                  color={action.iconColor}
                  strokeWidth={2.2}
                />
              </View>
              <Text style={styles.actionLabel} numberOfLines={2}>
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
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
    lineHeight: 15,
  },
});
