import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Video, FileText, AlertCircle, Bell, Calendar, MoreVertical } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';

export interface ScheduleItem {
  id: string;
  title: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  subtitle?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  notes?: string;
  type?: string;
}

interface ScheduleCardProps {
  item: ScheduleItem;
  onPress?: () => void;
  onOptionsPress?: () => void;
  actions?: ActionMenuItem[];
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  onPress,
  onOptionsPress,
  actions,
}) => {
  const normalizedType = (item.type || 'Meeting').toLowerCase();

  const getBadgeConfig = () => {
    if (normalizedType.includes('meeting') || normalizedType === 'video') {
      return {
        bg: '#EBF3FC',
        icon: <Video size={22} color="#4A80E8" strokeWidth={2.2} />,
      };
    }
    if (normalizedType.includes('task') || normalizedType === 'document') {
      return {
        bg: '#F0EBFA',
        icon: <FileText size={22} color="#6E56CF" strokeWidth={2.2} />,
      };
    }
    if (normalizedType.includes('deadline')) {
      return {
        bg: '#FEF3C7',
        icon: <AlertCircle size={22} color="#D97706" strokeWidth={2.2} />,
      };
    }
    if (normalizedType.includes('reminder')) {
      return {
        bg: '#DCFCE7',
        icon: <Bell size={22} color="#16A34A" strokeWidth={2.2} />,
      };
    }
    return {
      bg: '#E0F2FE',
      icon: <Calendar size={22} color="#0284C7" strokeWidth={2.2} />,
    };
  };

  const badgeConfig = getBadgeConfig();

  const displayTime =
    item.time ||
    (item.startTime
      ? `${item.startTime}${item.endTime ? ` - ${item.endTime}` : ''}`
      : 'Scheduled');

  const displaySubtitle =
    item.subtitle ||
    (item.clientName && item.projectName
      ? `${item.clientName} • ${item.projectName}`
      : item.clientName || item.projectName || (item.type ? `${item.type} session` : 'Event'));

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={styles.clickableContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Icon Badge */}
        <View style={[styles.iconContainer, { backgroundColor: badgeConfig.bg }]}>
          {badgeConfig.icon}
        </View>

        {/* Content Info */}
        <View style={styles.textContainer}>
          <Text style={styles.timeText}>{displayTime}</Text>
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {displaySubtitle}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Options Menu */}
      <View style={styles.optionsWrapper}>
        {actions && actions.length > 0 ? (
          <ThreeDotsMenu
            actions={actions}
            title={item.title}
            iconSize={19}
            iconColor="#9E9E9E"
            buttonStyle={styles.optionsButton}
          />
        ) : (
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={onOptionsPress}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <MoreVertical size={19} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ScheduleCard;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFF1F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  clickableContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C5CE7',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.darkText,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12.5,
    color: colors.subtleText,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  optionsButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
