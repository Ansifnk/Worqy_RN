import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import dayjs from 'dayjs';
import {
  Video,
  FileText,
  AlertCircle,
  Bell,
  Calendar,
  Clock,
  User,
  Edit3,
  Trash2,
  ExternalLink,
  Utensils,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ScheduleItem } from '../../schedule/types';

interface ChatScheduleCardProps {
  schedule: ScheduleItem;
  onEdit: (schedule: ScheduleItem) => void;
  onDelete: (scheduleId: string, scheduleTitle: string) => void;
  onOpen: (schedule: ScheduleItem) => void;
  isDeleted?: boolean;
}

interface ThemeConfig {
  cardBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  tagBg: string;
  tagText: string;
}

const getScheduleTheme = (type?: string, title: string = ''): ThemeConfig => {
  const normType = (type || 'Meeting').toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes('lunch') ||
    lowerTitle.includes('coffee') ||
    lowerTitle.includes('break') ||
    normType === 'break'
  ) {
    return {
      cardBg: '#FAF7F2',
      borderColor: '#EFE8DE',
      iconBg: '#EFE8DE',
      iconColor: '#8C6551',
      tagBg: '#EFE8DE',
      tagText: '#6D4C3D',
    };
  }

  if (normType.includes('deadline')) {
    return {
      cardBg: '#FFF9F0',
      borderColor: '#FDE68A',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      tagBg: '#FEF3C7',
      tagText: '#B45309',
    };
  }

  if (normType.includes('reminder')) {
    return {
      cardBg: '#F2FAF5',
      borderColor: '#BBF7D0',
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
      tagBg: '#DCFCE7',
      tagText: '#15803D',
    };
  }

  if (normType.includes('task') || lowerTitle.includes('doc') || lowerTitle.includes('review')) {
    return {
      cardBg: '#F0F7FD',
      borderColor: '#BAE6FD',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      tagBg: '#E0F2FE',
      tagText: '#0369A1',
    };
  }

  // Default: Meeting (elegant violet / primary)
  return {
    cardBg: '#F5F3FF',
    borderColor: '#DDD6FE',
    iconBg: '#EDE9FE',
    iconColor: '#6D28D9',
    tagBg: '#EDE9FE',
    tagText: '#6D28D9',
  };
};

const renderIcon = (type?: string, title: string = '', iconColor: string = colors.primary) => {
  const normType = (type || 'Meeting').toLowerCase();
  const lowerTitle = title.toLowerCase();
  const size = 18;

  if (lowerTitle.includes('lunch') || lowerTitle.includes('break') || normType === 'break') {
    return <Utensils size={size} color={iconColor} strokeWidth={2.2} />;
  }
  if (normType.includes('deadline')) {
    return <AlertCircle size={size} color={iconColor} strokeWidth={2.2} />;
  }
  if (normType.includes('reminder')) {
    return <Bell size={size} color={iconColor} strokeWidth={2.2} />;
  }
  if (normType.includes('task') || lowerTitle.includes('review')) {
    return <FileText size={size} color={iconColor} strokeWidth={2.2} />;
  }
  return <Video size={size} color={iconColor} strokeWidth={2.2} />;
};

export const ChatScheduleCard: React.FC<ChatScheduleCardProps> = ({
  schedule,
  onEdit,
  onDelete,
  onOpen,
  isDeleted = false,
}) => {
  const theme = getScheduleTheme(schedule.type, schedule.title);

  // Formatted date string
  const formattedDate = schedule.date
    ? dayjs(schedule.date).format('ddd, MMM D, YYYY')
    : 'Date not set';

  // Formatted time range
  const timeRange = schedule.startTime
    ? `${schedule.startTime}${schedule.endTime ? ` - ${schedule.endTime}` : ''}`
    : 'All day';

  if (isDeleted) {
    return (
      <View style={[styles.cardContainer, styles.deletedCard]}>
        <View style={styles.deletedRow}>
          <Trash2 size={16} color={colors.textSecondary} />
          <Text style={styles.deletedText}>
            Schedule &quot;{schedule.title}&quot; was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, { backgroundColor: theme.cardBg, borderColor: theme.borderColor }]}>
      {/* Top Header Row with Type Badge & Icon */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIconWrapper, { backgroundColor: theme.iconBg }]}>
            {renderIcon(schedule.type, schedule.title, theme.iconColor)}
          </View>
          <View>
            <View style={[styles.typeTag, { backgroundColor: theme.tagBg }]}>
              <Text style={[styles.typeTagText, { color: theme.tagText }]}>
                {schedule.type || 'Event'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {schedule.title}
      </Text>

      {/* Date & Time Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaBadge}>
          <Calendar size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>

        <View style={styles.metaBadge}>
          <Clock size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>{timeRange}</Text>
        </View>
      </View>

      {/* Client Name if present */}
      {Boolean(schedule.clientName) && (
        <View style={styles.clientRow}>
          <User size={13} color={colors.primary} strokeWidth={2} />
          <Text style={styles.clientText} numberOfLines={1}>
            Client: {schedule.clientName}
          </Text>
        </View>
      )}

      {/* Notes if present */}
      {Boolean(schedule.notes) && (
        <Text style={styles.notesText} numberOfLines={2}>
          {schedule.notes}
        </Text>
      )}

      {/* Action Buttons Divider & Toolbar */}
      <View style={styles.actionsDivider} />

      <View style={styles.actionsContainer}>
        {/* Edit Button */}
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => onEdit(schedule)}
          activeOpacity={0.7}
          accessibilityLabel="Edit schedule"
        >
          <Edit3 size={13} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.actionBtnEditText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => onDelete(schedule.id, schedule.title)}
          activeOpacity={0.7}
          accessibilityLabel="Delete schedule"
        >
          <Trash2 size={13} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.actionBtnDeleteText}>Delete</Text>
        </TouchableOpacity>

        {/* Open Button */}
        <TouchableOpacity
          style={styles.actionBtnOpen}
          onPress={() => onOpen(schedule)}
          activeOpacity={0.8}
          accessibilityLabel="Open schedule details"
        >
          <ExternalLink size={13} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.actionBtnOpenText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScheduleCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
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
  typeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
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
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    marginBottom: 4,
  },
  clientText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
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
    gap: 8,
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
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
    paddingHorizontal: 10,
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
    paddingHorizontal: 12,
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
