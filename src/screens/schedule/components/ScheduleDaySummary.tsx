import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ScheduleDaySummaryProps {
  selectedDate: string; // ISO string
  eventCount: number;
  onTodayPress?: () => void;
  isToday?: boolean;
}

export const ScheduleDaySummary: React.FC<ScheduleDaySummaryProps> = ({
  selectedDate,
  eventCount,
  onTodayPress,
  isToday,
}) => {
  const dateObj = dayjs(selectedDate);
  const isActualToday = isToday ?? dateObj.isSame(dayjs(), 'day');
  const isTomorrow = dateObj.isSame(dayjs().add(1, 'day'), 'day');
  const isYesterday = dateObj.isSame(dayjs().subtract(1, 'day'), 'day');

  let relativeTag = '';
  if (isActualToday) relativeTag = 'Today';
  else if (isTomorrow) relativeTag = 'Tomorrow';
  else if (isYesterday) relativeTag = 'Yesterday';

  const fullDateDisplay = dateObj.format('dddd, MMMM D');

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <View style={styles.titleRow}>
          <Text style={styles.fullDateText}>{fullDateDisplay}</Text>
          {relativeTag ? (
            <View
              style={[
                styles.relativeBadge,
                isActualToday && styles.todayBadge,
              ]}
            >
              <Text
                style={[
                  styles.relativeBadgeText,
                  isActualToday && styles.todayBadgeText,
                ]}
              >
                {relativeTag}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.subtitleText}>
          {eventCount === 0
            ? 'No events scheduled for this day'
            : `${eventCount} event${eventCount > 1 ? 's' : ''} planned`}
        </Text>
      </View>

      {!isActualToday && onTodayPress && (
        <TouchableOpacity
          style={styles.todayButton}
          onPress={onTodayPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go to Today"
        >
          <Sparkles size={14} color={colors.primary} strokeWidth={2.4} />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ScheduleDaySummary;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  leftCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  fullDateText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  relativeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#EEF2F1',
  },
  relativeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  todayBadge: {
    backgroundColor: '#E6F5F2',
  },
  todayBadgeText: {
    color: colors.primary,
  },
  subtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF4F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCE5E0',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
