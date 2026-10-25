import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  Video,
  FileText,
  Utensils,
  CheckSquare,
  AlertCircle,
  Bell,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ScheduleItem, ScheduleType } from '../types';

interface ScheduleTimelineItemProps {
  item: ScheduleItem;
  isLast?: boolean;
  onPress: () => void;
}

interface ThemeConfig {
  cardBg: string;
  iconBg: string;
  iconColor: string;
}

// Get harmonious pastel theme based on type or title keywords
const getCardTheme = (type: ScheduleType, title: string = '', index: number = 0): ThemeConfig => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('lunch') || lowerTitle.includes('break') || lowerTitle.includes('coffee') || type === 'Break') {
    return {
      cardBg: '#F7F4EF',
      iconBg: '#EFE8DE',
      iconColor: '#8C6551',
    };
  }

  if (lowerTitle.includes('client meeting') || lowerTitle.includes('call') || (type === 'Meeting' && index % 2 === 1)) {
    return {
      cardBg: '#FDF1F0',
      iconBg: '#FCDCDA',
      iconColor: '#DE4B4B',
    };
  }

  if (lowerTitle.includes('doc') || lowerTitle.includes('internal') || lowerTitle.includes('write')) {
    return {
      cardBg: '#EDF5FB',
      iconBg: '#D7E9F8',
      iconColor: '#2578C0',
    };
  }

  if (type === 'Deadline') {
    return {
      cardBg: '#FFF6EB',
      iconBg: '#FCE6C8',
      iconColor: '#D97706',
    };
  }

  if (type === 'Reminder') {
    return {
      cardBg: '#F0F9F5',
      iconBg: '#D5EFE3',
      iconColor: '#1B8256',
    };
  }

  // Default / Meeting / Task: elegant lavender/purple
  return {
    cardBg: '#F2EFFE',
    iconBg: '#E4DCFB',
    iconColor: '#6B4EEA',
  };
};

const renderTypeIcon = (type: ScheduleType, title: string = '', iconColor: string) => {
  const lowerTitle = title.toLowerCase();
  const iconSize = 18;

  if (lowerTitle.includes('lunch') || lowerTitle.includes('break') || lowerTitle.includes('food') || type === 'Break') {
    return <Utensils size={iconSize} color={iconColor} strokeWidth={2.2} />;
  }
  if (type === 'Meeting' || lowerTitle.includes('meeting') || lowerTitle.includes('call') || lowerTitle.includes('planning')) {
    return <Video size={iconSize} color={iconColor} strokeWidth={2.2} />;
  }
  if (type === 'Task' || lowerTitle.includes('review') || lowerTitle.includes('design')) {
    return <FileText size={iconSize} color={iconColor} strokeWidth={2.2} />;
  }
  if (type === 'Deadline') {
    return <AlertCircle size={iconSize} color={iconColor} strokeWidth={2.2} />;
  }
  if (type === 'Reminder') {
    return <Bell size={iconSize} color={iconColor} strokeWidth={2.2} />;
  }
  return <CheckSquare size={iconSize} color={iconColor} strokeWidth={2.2} />;
};

export const ScheduleTimelineItem: React.FC<ScheduleTimelineItemProps> = ({
  item,
  isLast = false,
  onPress,
}) => {
  const theme = getCardTheme(item.type, item.title);

  // Subtitle fallback: clientName > notes > type
  const subtitle = item.clientName?.trim() || item.notes?.trim() || item.type;

  return (
    <View style={styles.container}>
      {/* Left Timeline Column */}
      <View style={styles.timelineColumn}>
        <Text style={styles.timeText}>{item.startTime || 'All day'}</Text>

        <View style={styles.lineTrack}>
          {/* Timeline node dot */}
          <View style={styles.nodeDot} />
          {/* Vertical connecting line */}
          {!isLast && <View style={styles.verticalLine} />}
        </View>
      </View>

      {/* Right Schedule Card */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.cardBg }]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${subtitle}, at ${item.startTime}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
          {renderTypeIcon(item.type, item.title, theme.iconColor)}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ScheduleTimelineItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timelineColumn: {
    width: 68,
    alignItems: 'center',
    paddingTop: 10,
    marginRight: 10,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  lineTrack: {
    alignItems: 'center',
    flex: 1,
    minHeight: 46,
  },
  nodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C5D0CD',
  },
  verticalLine: {
    width: 1.5,
    flex: 1,
    marginTop: 4,
    backgroundColor: '#E4ECE9',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptySlotCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D8E2DF',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  emptySlotIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptySlotTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  emptySlotSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

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
        <Text style={styles.timeText}>{time}</Text>

        <View style={styles.lineTrack}>
          {/* Timeline node dot */}
          <View style={styles.nodeDot} />
          {/* Vertical connecting line */}
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
          <Plus size={16} color={colors.primary} strokeWidth={2.4} />
        </View>
        <View>
          <Text style={styles.emptySlotTitle}>No event scheduled</Text>
          <Text style={styles.emptySlotSubtitle}>Tap to add an event at {time}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
