import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CheckSquare, FolderPlus, UserPlus, Receipt } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface QuickActionsStripProps {
  onAddTask: () => void;
  onAddProject: () => void;
  onAddClient: () => void;
  onAddInvoice: () => void;
}

export const QuickActionsStrip: React.FC<QuickActionsStripProps> = ({
  onAddTask,
  onAddProject,
  onAddClient,
  onAddInvoice,
}) => {
  const actions = [
    {
      id: 'task',
      label: 'Task',
      icon: CheckSquare,
      color: '#6366F1',
      bg: '#EEF2FF',
      onPress: onAddTask,
    },
    {
      id: 'project',
      label: 'Project',
      icon: FolderPlus,
      color: '#059669',
      bg: '#ECFDF5',
      onPress: onAddProject,
    },
    {
      id: 'client',
      label: 'Client',
      icon: UserPlus,
      color: '#D97706',
      bg: '#FFFBEB',
      onPress: onAddClient,
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: Receipt,
      color: '#0284C7',
      bg: '#F0F9FF',
      onPress: onAddInvoice,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((act) => {
        const IconComp = act.icon;
        return (
          <TouchableOpacity
            key={act.id}
            style={styles.actionPill}
            onPress={act.onPress}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={`Create new ${act.label}`}
          >
            <View style={[styles.iconCircle, { backgroundColor: act.bg }]}>
              <IconComp size={15} color={act.color} strokeWidth={2.4} />
            </View>
            <Text style={styles.actionLabel}>+{act.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default QuickActionsStrip;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    gap: 6,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: -0.2,
  },
});

