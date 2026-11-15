import React, { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import dayjs from 'dayjs';
import { colors } from '../../../utils/colors';

export interface ScheduleDateStripProps {
  selectedDate: string; // ISO string
  onSelectDate: (date: string) => void;
  datesWithEvents?: string[] | Set<string>;
}

interface DateItem {
  dateString: string; // ISO string
  dayName: string; // Mon, Tue...
  dayNumber: number; // 20, 21...
  isToday: boolean;
  dateKey: string; // YYYY-MM-DD
}

// Format Date object or string to ISO string (local day start)
export const formatDateToISOString = (d: Date | string = new Date()): string => {
  return dayjs(d).toISOString();
};

// Format Date string to readable header (e.g. "Tuesday, 21 Oct 2026")
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dayjs(dateStr).format('dddd, D MMM YYYY');
};

const PILL_WIDTH = 58;
const PILL_GAP = 10;
const ITEM_TOTAL_WIDTH = PILL_WIDTH + PILL_GAP;

export const ScheduleDateStrip: React.FC<ScheduleDateStripProps> = ({
  selectedDate,
  onSelectDate,
  datesWithEvents,
}) => {
  const scrollViewRef = useRef<any>(null);

  // Set of dates with events for quick O(1) lookup
  const eventDateSet = useMemo<Set<string>>(() => {
    if (!datesWithEvents) return new Set();
    if (datesWithEvents instanceof Set) return datesWithEvents;
    return new Set(datesWithEvents.map((d) => dayjs(d).format('YYYY-MM-DD')));
  }, [datesWithEvents]);

  // Generate 35 days: 14 days before selectedDate and 20 days after
  const dateList = useMemo<DateItem[]>(() => {
    const items: DateItem[] = [];
    const baseDate = selectedDate ? dayjs(selectedDate) : dayjs();

    const startOffset = -14;
    const totalDays = 35;

    for (let i = 0; i < totalDays; i++) {
      const d = baseDate.add(startOffset + i, 'day');
      const iso = d.toISOString();
      items.push({
        dateString: iso,
        dayName: d.format('ddd'),
        dayNumber: d.date(),
        isToday: d.isSame(dayjs(), 'day'),
        dateKey: d.format('YYYY-MM-DD'),
      });
    }
    return items;
  }, [selectedDate]);

  // Auto-scroll to selected date on mount or date change
  useEffect(() => {
    const selectedIndex = dateList.findIndex((item) =>
      dayjs(item.dateString).isSame(dayjs(selectedDate), 'day')
    );
    if (selectedIndex >= 0 && scrollViewRef.current) {
      const scrollPosition = Math.max(0, selectedIndex * ITEM_TOTAL_WIDTH - 120);
      scrollViewRef.current.scrollTo({ x: scrollPosition, animated: true });
    }
  }, [selectedDate, dateList]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dateList.map((item) => {
          const isSelected = dayjs(item.dateString).isSame(dayjs(selectedDate), 'day');
          const hasEvents = eventDateSet.has(item.dateKey);

          return (
            <TouchableOpacity
              key={item.dateString}
              style={[
                styles.datePill,
                isSelected ? styles.datePillActive : styles.datePillInactive,
                item.isToday && !isSelected && styles.datePillToday,
              ]}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.dayName} ${item.dayNumber}${
                item.isToday ? ', Today' : ''
              }${hasEvents ? ', has events' : ''}`}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameActive : styles.dayNameInactive,
                  item.isToday && !isSelected && styles.dayNameToday,
                ]}
              >
                {item.dayName.toUpperCase()}
              </Text>

              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberActive : styles.dayNumberInactive,
                  item.isToday && !isSelected && styles.dayNumberToday,
                ]}
              >
                {item.dayNumber}
              </Text>

              {/* Event indicator dot */}
              <View style={styles.indicatorContainer}>
                {hasEvents ? (
                  <View
                    style={[
                      styles.eventDot,
                      isSelected ? styles.eventDotActive : styles.eventDotInactive,
                    ]}
                  />
                ) : item.isToday && !isSelected ? (
                  <View style={styles.todaySmallDot} />
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ScheduleDateStrip;

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: PILL_GAP,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  datePill: {
    width: PILL_WIDTH,
    height: 78,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  datePillInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  datePillToday: {
    borderColor: colors.primary,
    backgroundColor: '#F3FAF8',
  },
  datePillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayNameInactive: {
    color: colors.textSecondary,
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayNameActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dayNumber: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dayNumberInactive: {
    color: colors.text,
  },
  dayNumberToday: {
    color: colors.primary,
  },
  dayNumberActive: {
    color: colors.white,
  },
  indicatorContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  eventDotInactive: {
    backgroundColor: colors.primary,
  },
  eventDotActive: {
    backgroundColor: '#A7F3D0',
  },
  todaySmallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  emptyDot: {
    width: 5,
    height: 5,
  },
});
