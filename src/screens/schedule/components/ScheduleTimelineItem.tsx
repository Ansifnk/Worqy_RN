import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  Video,
  FileText,
  Utensils,
  AlertCircle,
  Bell,
  Plus,
  Clock,
  Users,
  Briefcase,
  AlignLeft,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ScheduleItem, ScheduleType } from '../types';
import { parseTimeToMinutes } from '../../../hooks/useSchedule';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';

export interface ScheduleTimelineItemProps {
  item: ScheduleItem;
  isLast?: boolean;
  onPress: () => void;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (item: ScheduleItem) => void;
}

interface ThemeConfig {
  cardBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
}

// Get modern theme based on type or keywords
const getCardTheme = (type: ScheduleType, title: string = ''): ThemeConfig => {
  const lowerTitle = title.toLowerCase();

  if (
    lowerTitle.includes('lunch') ||
    lowerTitle.includes('break') ||
    lowerTitle.includes('coffee') ||
    type === 'Break'
  ) {
    return {
      cardBg: '#FAF7F2',
      borderColor: '#EFE8DE',
      iconBg: '#EFE8DE',
      iconColor: '#8C6551',
      badgeBg: '#F2EAE1',
      badgeText: '#785340',
      dotColor: '#8C6551',
    };
  }

  if (type === 'Meeting' || lowerTitle.includes('meeting') || lowerTitle.includes('call')) {
    return {
      cardBg: '#F8F6FE',
      borderColor: '#E7E0FF',
      iconBg: '#EDE9FE',
      iconColor: '#7C3AED',
      badgeBg: '#EDE9FE',
      badgeText: '#6D28D9',
      dotColor: '#7C3AED',
    };
  }

  if (type === 'Deadline') {
    return {
      cardBg: '#FFFDF5',
      borderColor: '#FEEBC8',
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#B45309',
      dotColor: '#D97706',
    };
  }

  if (type === 'Reminder') {
    return {
      cardBg: '#F2F9FD',
      borderColor: '#D8EFFE',
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      badgeBg: '#E0F2FE',
      badgeText: '#0369A1',
      dotColor: '#0284C7',
    };
  }

  // Default: Task (Teal/Emerald)
  return {
    cardBg: '#F2FBF6',
    borderColor: '#D3F4E3',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    badgeBg: '#DCFCE7',
    badgeText: '#15803D',
    dotColor: '#16A34A',
  };
};

const renderTypeIcon = (type: ScheduleType, title: string = '', iconColor: string) => {
  const lowerTitle = title.toLowerCase();
  const iconSize = 15;

  if (lowerTitle.includes('lunch') || lowerTitle.includes('break') || type === 'Break') {
    return <Utensils size={iconSize} color={iconColor} strokeWidth={2.4} />;
  }
  if (type === 'Meeting' || lowerTitle.includes('meeting') || lowerTitle.includes('call')) {
    return <Video size={iconSize} color={iconColor} strokeWidth={2.4} />;
  }
  if (type === 'Deadline') {
    return <AlertCircle size={iconSize} color={iconColor} strokeWidth={2.4} />;
  }
  if (type === 'Reminder') {
    return <Bell size={iconSize} color={iconColor} strokeWidth={2.4} />;
  }
  return <FileText size={iconSize} color={iconColor} strokeWidth={2.4} />;
};

const formatDuration = (startTime?: string, endTime?: string): string | null => {
  if (!startTime || !endTime) return null;
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const diff = endMin - startMin;
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export const ScheduleTimelineItem: React.FC<ScheduleTimelineItemProps> = ({
  item,
  isLast = false,
  onPress,
  onEdit,
  onDelete,
}) => {
  const theme = getCardTheme(item.type, item.title);
  const duration = formatDuration(item.startTime, item.endTime);

  const menuActions = useMemo<ActionMenuItem[]>(() => {
    const list: ActionMenuItem[] = [];
    if (onEdit) {
      list.push({
        id: 'edit',
        title: 'Edit Event',
        image: 'pencil',
        onPress: () => onEdit(item),
      });
    }
    if (onDelete) {
      list.push({
        id: 'delete',
        title: 'Delete Event',
        destructive: true,
        image: 'trash',
        onPress: () => onDelete(item),
      });
    }
    return list;
  }, [onEdit, onDelete, item]);

  return (
    <View style={styles.container}>
      {/* Left Timeline Column */}
      <View style={styles.timelineColumn}>
        <Text style={styles.startTimeText}>{item.startTime || 'All day'}</Text>
        {item.endTime && <Text style={styles.endTimeText}>{item.endTime}</Text>}

        <View style={styles.lineTrack}>
          {/* Node dot with pulsing ring */}
          <View style={[styles.nodeOuterRing, { borderColor: theme.dotColor + '40' }]}>
            <View style={[styles.nodeInnerDot, { backgroundColor: theme.dotColor }]} />
          </View>
          {/* Vertical connecting line */}
          {!isLast && <View style={styles.verticalLine} />}
        </View>
      </View>

      {/* Right Schedule Card */}
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.type} at ${item.startTime}`}
      >
        {/* Top Meta Row: Type Badge + Duration + Menu */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.typePill,
                { backgroundColor: theme.badgeBg },
              ]}
            >
              {renderTypeIcon(item.type, item.title, theme.iconColor)}
              <Text style={[styles.typePillText, { color: theme.badgeText }]}>
                {item.type}
              </Text>
            </View>

            {duration && (
              <View style={styles.durationPill}>
                <Clock size={11} color={colors.textSecondary} strokeWidth={2.2} />
                <Text style={styles.durationPillText}>{duration}</Text>
              </View>
            )}
          </View>

          {menuActions.length > 0 && (
            <ThreeDotsMenu
              actions={menuActions}
              title={item.title}
              iconSize={16}
              iconColor={colors.textSecondary}
              buttonStyle={styles.menuButton}
            />
          )}
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Metadata Tags: Client & Project */}
        {(item.clientName || item.projectName) && (
          <View style={styles.metaTagsRow}>
            {item.clientName ? (
              <View style={styles.tagPill}>
                <Users size={12} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.tagText} numberOfLines={1}>
                  {item.clientName}
                </Text>
              </View>
            ) : null}

            {item.projectName ? (
              <View style={styles.tagPill}>
                <Briefcase size={12} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.tagText} numberOfLines={1}>
                  {item.projectName}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Notes preview */}
        {item.notes ? (
          <View style={styles.notesRow}>
            <AlignLeft size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.notesPreviewText} numberOfLines={1}>
              {item.notes}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

export default ScheduleTimelineItem;

export interface ScheduleEmptyTimelineSlotProps {
  time: string;
  isLast?: boolean;
  onPress: () => void;
}

export const ScheduleEmptyTimelineSlot: React.FC<ScheduleEmptyTimelineSlotProps> = ({
  time,
  isLast = false,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Timeline Column */}
      <View style={styles.timelineColumn}>
        <Text style={styles.startTimeText}>{time}</Text>

        <View style={styles.lineTrack}>
          <View style={styles.emptyNodeDot} />
          {!isLast && <View style={styles.verticalLine} />}
        </View>
      </View>

      {/* Right Empty Slot Card */}
      <TouchableOpacity
        style={styles.emptySlotCard}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`No event at ${time}. Tap to add.`}
      >
        <View style={styles.emptySlotIcon}>
          <Plus size={15} color={colors.primary} strokeWidth={2.4} />
        </View>
        <View style={styles.emptySlotTextGroup}>
          <Text style={styles.emptySlotTitle}>Available slot</Text>
          <Text style={styles.emptySlotSubtitle}>Tap to schedule at {time}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  timelineColumn: {
    width: 68,
    alignItems: 'center',
    paddingTop: 6,
    marginRight: 12,
  },
  startTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  endTimeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  lineTrack: {
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
    marginTop: 4,
  },
  nodeOuterRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  nodeInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  verticalLine: {
    width: 1.5,
    flex: 1,
    marginTop: 4,
    backgroundColor: '#E2E8F0',
  },
  card: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  menuButton: {
    padding: 4,
    marginRight: -4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  metaTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '48%',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  notesPreviewText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  emptySlotCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D5DFDC',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  emptySlotIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EAF4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptySlotTextGroup: {
    flex: 1,
  },
  emptySlotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  emptySlotSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
