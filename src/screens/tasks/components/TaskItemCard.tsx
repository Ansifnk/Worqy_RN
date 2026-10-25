import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Check, MoreVertical } from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../../utils/colors';
import { TaskItem, TaskPriority } from '../types';

interface TaskItemCardProps {
  item: TaskItem;
  onPress: () => void;
  onToggleComplete: () => void;
  onMorePress?: () => void;
}

export const formatDueDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const due = dayjs(dateStr);
  const today = dayjs();
  if (due.isSame(today, 'day')) {
    return 'Today';
  }
  if (due.isSame(today.add(1, 'day'), 'day')) {
    return 'Tomorrow';
  }
  return due.format('MMM D');
};

export const getPriorityColors = (priority: TaskPriority) => {
  switch (priority) {
    case 'High':
      return {
        bg: colors.priorityHighBg || '#FDE8E8',
        text: colors.priorityHighText || '#D64545',
      };
    case 'Medium':
      return {
        bg: colors.priorityMediumBg || '#FEF0DC',
        text: colors.priorityMediumText || '#D97706',
      };
    case 'Low':
      return {
        bg: colors.priorityLowBg || '#E6F5EC',
        text: colors.priorityLowText || '#24865B',
      };
    default:
      return {
        bg: '#F3F4F6',
        text: '#4B5563',
      };
  }
};

export const TaskItemCard: React.FC<TaskItemCardProps> = ({
  item,
  onPress,
  onToggleComplete,
  onMorePress,
}) => {
  const isDone = item.status === 'Done';
  const priorityTheme = getPriorityColors(item.priority);
  const formattedDate = formatDueDate(item.dueDate);
  const subtitle = item.clientName || item.project || 'General';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Checkbox button */}
      <TouchableOpacity
        style={[styles.checkbox, isDone && styles.checkboxDone]}
        onPress={onToggleComplete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isDone && <Check size={14} color={colors.white} strokeWidth={3} />}
      </TouchableOpacity>

      {/* Task Info */}
      <View style={styles.content}>
        <Text
          style={[styles.title, isDone && styles.titleDone]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right Column: Due Date & Priority Pill */}
      <View style={styles.metaColumn}>
        {formattedDate ? (
          <Text style={[styles.dueDate, isDone && styles.textMuted]}>
            {formattedDate}
          </Text>
        ) : null}
        <View style={[styles.priorityBadge, { backgroundColor: priorityTheme.bg }]}>
          <Text style={[styles.priorityText, { color: priorityTheme.text }]}>
            {item.priority}
          </Text>
        </View>
      </View>

      {/* More Options */}
      <TouchableOpacity
        style={styles.moreButton}
        onPress={onMorePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MoreVertical size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBE5DC',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#C8BEB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: colors.white,
  },
  checkboxDone: {
    backgroundColor: colors.darkPlum || '#2D1225',
    borderColor: colors.darkPlum || '#2D1225',
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkPlum || '#2D1225',
    marginBottom: 3,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    color: '#7E8B88',
    fontWeight: '400',
  },
  metaColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 6,
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.darkPlum || '#2D1225',
  },
  textMuted: {
    color: '#9CA3AF',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreButton: {
    padding: 4,
    marginLeft: 2,
  },
});

export default TaskItemCard;
