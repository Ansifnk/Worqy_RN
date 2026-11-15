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
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import { colors } from '../../utils/colors';
import { LoadingView } from '../../components/LoadingView';
import { useSchedule } from '../../hooks/useSchedule';
import { ScheduleItem, ScheduleFormData, ScheduleType } from './types';

import ScheduleHeader from './components/ScheduleHeader';
import ScheduleDateStrip, {
  formatDateToISOString,
} from './components/ScheduleDateStrip';
import ScheduleDaySummary from './components/ScheduleDaySummary';
import ScheduleFilterTabs, {
  ScheduleFilterType,
} from './components/ScheduleFilterTabs';
import ScheduleTimelineItem from './components/ScheduleTimelineItem';
import ScheduleDetailModal from './components/ScheduleDetailModal';
import ScheduleEmptyState from './components/ScheduleEmptyState';
import ScheduleFormModal from './components/ScheduleFormModal';
import { GlobalQuickSwitcher } from '../../components/GlobalQuickSwitcher';

interface ScheduleScreenProps {
  embedded?: boolean;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ embedded = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
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

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter state
  const [activeFilter, setActiveFilter] = useState<ScheduleFilterType>('all');

  // Month Picker Modal state
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState<boolean>(false);

  // Form Modal state
  const [isFormModalVisible, setIsFormModalVisible] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00 AM');
  const [initialFormType, setInitialFormType] = useState<ScheduleType>('Meeting');

  // Detail Modal state
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [detailItem, setDetailItem] = useState<ScheduleItem | null>(null);

  useEffect(() => {
    if (route.params?.date) {
      setSelectedDate(formatDateToISOString(new Date(route.params.date)));
    }
  }, [route.params?.date]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Set of dates that have events (for calendar strip dot markers)
  const datesWithEvents = useMemo(() => {
    const dates = new Set<string>();
    schedules.forEach((item) => {
      if (item.date) {
        dates.add(dayjs(item.date).format('YYYY-MM-DD'));
      }
    });
    return dates;
  }, [schedules]);

  // Filter schedules by selected date
  const daySchedules = useMemo(() => {
    return schedules.filter((item) =>
      dayjs(item.date).isSame(dayjs(selectedDate), 'day')
    );
  }, [schedules, selectedDate]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: daySchedules.length,
      Meeting: daySchedules.filter((i) => i.type === 'Meeting').length,
      Task: daySchedules.filter((i) => i.type === 'Task').length,
      Deadline: daySchedules.filter((i) => i.type === 'Deadline').length,
      Reminder: daySchedules.filter((i) => i.type === 'Reminder').length,
    };
  }, [daySchedules]);

  // Filter by active category tab and search query
  const filteredSchedules = useMemo(() => {
    return daySchedules.filter((item) => {
      // Type filter
      if (activeFilter !== 'all' && item.type !== activeFilter) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const clientMatch = item.clientName?.toLowerCase().includes(query);
        const projectMatch = item.projectName?.toLowerCase().includes(query);
        const notesMatch = item.notes?.toLowerCase().includes(query);
        return titleMatch || clientMatch || projectMatch || notesMatch;
      }

      return true;
    });
  }, [daySchedules, activeFilter, searchQuery]);

  // Navigation & Actions
  const handleAddPress = () => {
    setEditingSchedule(null);
    setSelectedSlotTime('09:00 AM');
    setInitialFormType('Meeting');
    setIsFormModalVisible(true);
  };

  const handleQuickAdd = (type: ScheduleType) => {
    setEditingSchedule(null);
    setSelectedSlotTime('09:00 AM');
    setInitialFormType(type);
    setIsFormModalVisible(true);
  };

  const handleEmptySlotPress = (timeSlot: string) => {
    setEditingSchedule(null);
    setSelectedSlotTime(timeSlot);
    setInitialFormType('Meeting');
    setIsFormModalVisible(true);
  };

  const handleItemPress = (item: ScheduleItem) => {
    setDetailItem(item);
    setIsDetailModalVisible(true);
  };

  const handleEditPress = (item: ScheduleItem) => {
    setDetailItem(null);
    setIsDetailModalVisible(false);
    setEditingSchedule(item);
    setSelectedSlotTime(item.startTime || '09:00 AM');
    setInitialFormType(item.type);
    setIsFormModalVisible(true);
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
              if (detailItem?.id === item.id) {
                setIsDetailModalVisible(false);
                setDetailItem(null);
              }
              await deleteSchedule(item.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete schedule');
            }
          },
        },
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

  const handleTodayPress = () => {
    setSelectedDate(formatDateToISOString(new Date()));
  };

  const handleMonthDatePicked = (pickedDate: Date) => {
    setIsDatePickerModalOpen(false);
    setSelectedDate(formatDateToISOString(pickedDate));
  };

  const currentMonthDisplay = dayjs(selectedDate).format('MMMM YYYY');
  const isSelectedDateToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  const screenStyle = useMemo(
    () => [
      styles.screen,
      { paddingTop: embedded ? 0 : Math.max(insets.top, 10) },
    ],
    [embedded, insets.top]
  );

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      { paddingBottom: Math.max(insets.bottom + 32, 60) },
    ],
    [insets.bottom]
  );

  return (
    <View style={screenStyle}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <ScheduleHeader
        onAddPress={handleAddPress}
        onBackPress={() => navigation.goBack()}
        showBack={navigation.canGoBack() && !embedded}
        currentMonthDisplay={currentMonthDisplay}
        onDatePickerPress={() => setIsDatePickerModalOpen(true)}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => {
          setIsSearchOpen((prev) => {
            if (prev) setSearchQuery('');
            return !prev;
          });
        }}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        totalEventsCount={daySchedules.length}
      />

      {/* Horizontal Date Picker Strip with event dots */}
      <ScheduleDateStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        datesWithEvents={datesWithEvents}
      />

      {/* Day Overview Summary */}
      <ScheduleDaySummary
        selectedDate={selectedDate}
        eventCount={daySchedules.length}
        onTodayPress={handleTodayPress}
        isToday={isSelectedDateToday}
      />

      {/* Category Filter Tabs (when day has events or filter is active) */}
      {daySchedules.length > 0 && (
        <ScheduleFilterTabs
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          counts={counts}
        />
      )}

      {/* Timeline Schedule List */}
      <FlatList
        data={filteredSchedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ScheduleTimelineItem
            item={item}
            isLast={index === filteredSchedules.length - 1}
            onPress={() => handleItemPress(item)}
            onEdit={handleEditPress}
            onDelete={handleDeletePress}
          />
        )}
        contentContainerStyle={listContentStyle}
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
          ) : searchQuery.trim().length > 0 ? (
            <View style={styles.emptySearchContainer}>
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptySubtitle}>
                No events found matching "{searchQuery}".
              </Text>
            </View>
          ) : (
            <ScheduleEmptyState
              onAddPress={handleAddPress}
              onQuickAdd={handleQuickAdd}
              onSlotPress={handleEmptySlotPress}
            />
          )
        }
      />

      {/* Full Event Details Bottom Sheet Modal */}
      <ScheduleDetailModal
        visible={isDetailModalVisible}
        item={detailItem}
        onClose={() => {
          setIsDetailModalVisible(false);
          setDetailItem(null);
        }}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
      />

      {/* Add / Edit Schedule Bottom Sheet Modal */}
      <ScheduleFormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSchedule}
        defaultDate={selectedDate}
        defaultStartTime={selectedSlotTime}
        defaultType={initialFormType}
      />

      {/* Full Date Picker for jumping directly to any month / day */}
      <DateTimePickerModal
        isVisible={isDatePickerModalOpen}
        mode="date"
        date={new Date(selectedDate)}
        onConfirm={handleMonthDatePicked}
        onCancel={() => setIsDatePickerModalOpen(false)}
      />

      <GlobalQuickSwitcher currentRoute="Schedule" />
    </View>
  );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 8,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptySearchContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
  },
});
