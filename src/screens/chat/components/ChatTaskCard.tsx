import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import dayjs from 'dayjs';
import {
  CheckSquare,
  CheckCircle2,
  Calendar,
  Folder,
  Edit3,
  Trash2,
  ExternalLink,
  Check,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { TaskItem, TaskPriority, TaskStatus } from '../../tasks/types';

interface ChatTaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string, taskTitle: string) => void;
  onOpen: (task: TaskItem) => void;
  onToggleComplete?: (taskId: string) => void;
  isDeleted?: boolean;
}

const getPriorityConfig = (priority?: string) => {
  const norm = (priority || 'Medium').toLowerCase();

  if (norm === 'high') {
    return {
      label: 'High Priority',
      bg: '#FEE2E2',
      text: '#B91C1C',
      borderColor: '#FECACA',
    };
  }
  if (norm === 'low') {
    return {
      label: 'Low Priority',
      bg: '#F1F5F9',
      text: '#475569',
      borderColor: '#E2E8F0',
    };
  }
  return {
    label: 'Medium Priority',
    bg: '#FEF3C7',
    text: '#B45309',
    borderColor: '#FDE68A',
  };
};

const getStatusConfig = (status?: string) => {
  const norm = (status || 'To Do').toLowerCase();

  if (norm === 'done' || norm === 'completed') {
    return {
      label: 'Done',
      bg: '#DCFCE7',
      text: '#15803D',
      borderColor: '#BBF7D0',
      isDone: true,
    };
  }
  if (norm === 'in progress') {
    return {
      label: 'In Progress',
      bg: '#E0F2FE',
      text: '#0369A1',
      borderColor: '#BAE6FD',
      isDone: false,
    };
  }
  return {
    label: 'To Do',
    bg: '#F8FAFC',
    text: '#64748B',
    borderColor: '#E2E8F0',
    isDone: false,
  };
};

export const ChatTaskCard: React.FC<ChatTaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onOpen,
  onToggleComplete,
  isDeleted = false,
}) => {
  const priorityCfg = getPriorityConfig(task.priority);
  const statusCfg = getStatusConfig(task.status);

  const formattedDueDate = task.dueDate
    ? dayjs(task.dueDate).format('MMM D, YYYY')
    : 'No due date';

  const subtitle = task.clientName || task.project;

  if (isDeleted) {
    return (
      <View style={[styles.cardContainer, styles.deletedCard]}>
        <View style={styles.deletedRow}>
          <Trash2 size={16} color={colors.textSecondary} />
          <Text style={styles.deletedText}>
            Task &quot;{task.title || ''}&quot; was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row with Check Icon & Status/Priority Pills */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconWrapper,
              statusCfg.isDone && styles.iconWrapperDone,
            ]}
          >
            {statusCfg.isDone ? (
              <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.4} />
            ) : (
              <CheckSquare size={18} color="#6366F1" strokeWidth={2.2} />
            )}
          </View>
          <View style={styles.tagGroup}>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusCfg.bg, borderColor: statusCfg.borderColor },
              ]}
            >
              <Text style={[styles.badgeText, { color: statusCfg.text }]}>
                {statusCfg.label}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                { backgroundColor: priorityCfg.bg, borderColor: priorityCfg.borderColor },
              ]}
            >
              <Text style={[styles.badgeText, { color: priorityCfg.text }]}>
                {priorityCfg.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Task Title */}
      <Text
        style={[
          styles.title,
          statusCfg.isDone && styles.titleDone,
        ]}
        numberOfLines={2}
      >
        {task.title}
      </Text>

      {/* Metadata (Due Date & Project/Client) */}
      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Calendar size={12} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>Due: {formattedDueDate}</Text>
        </View>

        {Boolean(subtitle) && (
          <View style={styles.metaBadge}>
            <Folder size={12} color={colors.primary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons Divider & Toolbar */}
      <View style={styles.actionsDivider} />

      <View style={styles.actionsContainer}>
        {/* Quick Toggle Complete Button */}
        {onToggleComplete && (
          <TouchableOpacity
            style={[
              styles.actionBtnToggle,
              statusCfg.isDone && styles.actionBtnToggleDone,
            ]}
            onPress={() => onToggleComplete(task.id)}
            activeOpacity={0.7}
            accessibilityLabel={statusCfg.isDone ? 'Mark task pending' : 'Mark task done'}
          >
            <Check
              size={13}
              color={statusCfg.isDone ? '#64748B' : '#16A34A'}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.actionBtnToggleText,
                statusCfg.isDone && styles.actionBtnToggleTextDone,
              ]}
            >
              {statusCfg.isDone ? 'Undo' : 'Done'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => onEdit(task)}
          activeOpacity={0.7}
          accessibilityLabel="Edit task"
        >
          <Edit3 size={13} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.actionBtnEditText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => onDelete(task.id, task.title)}
          activeOpacity={0.7}
          accessibilityLabel="Delete task"
        >
          <Trash2 size={13} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.actionBtnDeleteText}>Delete</Text>
        </TouchableOpacity>

        {/* Open Button */}
        <TouchableOpacity
          style={styles.actionBtnOpen}
          onPress={() => onOpen(task)}
          activeOpacity={0.8}
          accessibilityLabel="Open task details"
        >
          <ExternalLink size={13} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.actionBtnOpenText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatTaskCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    backgroundColor: '#EEF2FF',
    padding: 12,
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deletedCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    paddingVertical: 10,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperDone: {
    backgroundColor: '#DCFCE7',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 6,
    lineHeight: 20,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  actionsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 252, 231, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.25)',
  },
  actionBtnToggleDone: {
    backgroundColor: 'rgba(241, 245, 249, 0.9)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  actionBtnToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  actionBtnToggleTextDone: {
    color: '#64748B',
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.2)',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  actionBtnOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
