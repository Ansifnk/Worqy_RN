import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Video, FileText, MoreVertical } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  type: 'video' | 'document';
}

interface ScheduleCardProps {
  item: ScheduleItem;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  onPress,
  onOptionsPress,
}) => {
  const isVideo = item.type === 'video';

  return (
    <TouchableOpacity
      style={styles.rowContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon Badge */}
      <View
        style={[
          styles.iconContainer,
          isVideo ? styles.videoBadge : styles.documentBadge,
        ]}
      >
        {isVideo ? (
          <Video size={22} color="#4A80E8" strokeWidth={2.2} />
        ) : (
          <FileText size={22} color="#6E56CF" strokeWidth={2.2} />
        )}
      </View>

      {/* Content Info */}
      <View style={styles.textContainer}>
        <Text style={styles.timeText}>{item.time}</Text>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitleText} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>

      {/* Options Menu Button */}
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
    </TouchableOpacity>
  );
};

export default ScheduleCard;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  videoBadge: {
    backgroundColor: '#EBF3FC',
  },
  documentBadge: {
    backgroundColor: '#F0EBFA',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  optionsButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
