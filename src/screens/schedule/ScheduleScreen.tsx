import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import { colors } from '../../utils/colors';
import { LoadingView } from '../../components/LoadingView';
import { useSchedule } from '../../hooks/useSchedule';
import { ScheduleItem, ScheduleFormData } from './types';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleDateStrip, {
  formatDateToISOString,
  formatDisplayDate,
} from './components/ScheduleDateStrip';
import ScheduleTimelineItem, {
  ScheduleEmptyTimelineSlot,
} from './components/ScheduleTimelineItem';
import ScheduleFormModal from './components/ScheduleFormModal';

const DEFAULT_TIMELINE_HOURS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
];

interface ScheduleScreenProps {
  embedded?: boolean;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ embedded = false }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const initialParamDate = route.params?.date;

  const {
    schedules,
    loading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    refresh,
  } = useSchedule();

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    initialParamDate
      ? formatDateToISOString(new Date(initialParamDate))
      : formatDateToISOString(new Date())
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    if (route.params?.date) {
      setSelectedDate(formatDateToISOString(new Date(route.params.date)));
    }
  }, [route.params?.date]);

  // Form Modal state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00 AM');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Filter schedules by selected date
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => dayjs(item.date).isSame(dayjs(selectedDate), 'day'));
  }, [schedules, selectedDate]);

  const handleAddPress = () => {
    setEditingSchedule(null);
    setSelectedSlotTime('09:00 AM');
    setIsModalVisible(true);
  };

  const handleEmptySlotPress = (timeSlot: string) => {
    setEditingSchedule(null);
    setSelectedSlotTime(timeSlot);
    setIsModalVisible(true);
  };

  const handleEditPress = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setSelectedSlotTime(item.startTime || '09:00 AM');
    setIsModalVisible(true);
  };

  const handleDeletePress = (item: ScheduleItem) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to remove "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchedule(item.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: ScheduleItem) => {
    const subtitle = item.clientName ? `Client: ${item.clientName}` : 'Internal';
    const notes = item.notes ? `\n\nNotes: ${item.notes}` : '';

    Alert.alert(
      item.title,
      `${item.type} • ${item.startTime} - ${item.endTime}\n${subtitle}${notes}`,
      [
        {
          text: 'Edit',
          onPress: () => handleEditPress(item),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeletePress(item),
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleFormSubmit = async (data: ScheduleFormData) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, data);
        Alert.alert('Schedule Updated', `"${data.title}" has been updated.`);
      } else {
        await addSchedule(data);
        if (!dayjs(data.date).isSame(dayjs(selectedDate), 'day')) {
          setSelectedDate(data.date);
        }
        Alert.alert('Schedule Added', `"${data.title}" has been added.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save schedule');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: embedded ? 0 : Math.max(insets.top, 12) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <ScheduleHeader onAddPress={handleAddPress} />

      {/* Horizontal Date Picker Strip */}
      <ScheduleDateStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Selected Date Section Header */}
      <View style={styles.dateHeaderContainer}>
        <Text style={styles.dateHeaderText}>
          {formatDisplayDate(selectedDate)}
        </Text>
      </View>

      {/* Timeline Schedule List */}
      <FlatList
        data={filteredSchedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ScheduleTimelineItem
            item={item}
            isLast={index === filteredSchedules.length - 1}
            onPress={() => handleItemPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Loading schedule..." style={styles.emptyContainer} />
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Unable to load schedule</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyTimelineContainer}>
              {DEFAULT_TIMELINE_HOURS.map((hour, idx) => (
                <ScheduleEmptyTimelineSlot
                  key={hour}
                  time={hour}
                  isLast={idx === DEFAULT_TIMELINE_HOURS.length - 1}
                  onPress={() => handleEmptySlotPress(hour)}
                />
              ))}
            </View>
          )
        }
      />

      {/* Add / Edit Schedule Bottom Sheet Modal */}
      <ScheduleFormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSchedule}
        defaultDate={selectedDate}
        defaultStartTime={selectedSlotTime}
      />
    </View>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  listContent: {
    paddingTop: 4,
  },
  emptyTimelineContainer: {
    paddingTop: 4,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyAddButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
