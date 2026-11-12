import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Plus, ArrowLeft } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface TasksHeaderProps {
  onAddTask: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  onAddTask,
  onBackPress,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleGroup}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Tasks</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddTask}
        activeOpacity={0.8}
        accessibilityLabel="Add Task"
      >
        <Plus size={22} color={colors.white} strokeWidth={2.4} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default TasksHeader;
