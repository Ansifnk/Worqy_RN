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

interface ScheduleDateStripProps {
  selectedDate: string; // ISO string
  onSelectDate: (date: string) => void;
}

interface DateItem {
  dateString: string; // ISO string
  dayName: string; // Mon, Tue...
  dayNumber: number; // 20, 21...
  isToday: boolean;
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

export const ScheduleDateStrip: React.FC<ScheduleDateStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const scrollViewRef = useRef<any>(null);

  // Generate 21 days: 7 days before selectedDate, today, and 13 days after
  const dateList = useMemo<DateItem[]>(() => {
    const items: DateItem[] = [];
    const baseDate = selectedDate ? dayjs(selectedDate) : dayjs();

    const startOffset = -7;
    const totalDays = 21;

    for (let i = 0; i < totalDays; i++) {
      const d = baseDate.add(startOffset + i, 'day');
      const iso = d.toISOString();
      items.push({
        dateString: iso,
        dayName: d.format('ddd'),
        dayNumber: d.date(),
        isToday: d.isSame(dayjs(), 'day'),
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
      const itemWidth = 64; // width + margin
      const scrollPosition = Math.max(0, selectedIndex * itemWidth - 100);
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
          return (
            <TouchableOpacity
              key={item.dateString}
              style={[
                styles.datePill,
                isSelected ? styles.datePillActive : styles.datePillInactive,
              ]}
              onPress={() => onSelectDate(item.dateString)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.dayName} ${item.dayNumber}`}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected ? styles.dayNameActive : styles.dayNameInactive,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected ? styles.dayNumberActive : styles.dayNumberInactive,
                ]}
              >
                {item.dayNumber}
              </Text>
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
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePill: {
    width: 56,
    height: 74,
    borderRadius: 8,
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
  datePillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNameInactive: {
    color: colors.textSecondary,
  },
  dayNameActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayNumberInactive: {
    color: colors.text,
  },
  dayNumberActive: {
    color: colors.white,
  },
});
