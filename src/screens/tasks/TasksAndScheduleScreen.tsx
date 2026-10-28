import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Plus,
  CheckSquare,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../utils/colors';
import { useTask } from '../../hooks/useTask';
import { useSchedule } from '../../hooks/useSchedule';
import { TaskItem } from './types';
import { ScheduleItem, ScheduleFormData } from '../schedule/types';
import TaskSearchBar from './components/TaskSearchBar';
import TaskFilterTabs, { FilterStatus } from './components/TaskFilterTabs';
import TaskItemCard from './components/TaskItemCard';
import ScheduleDateStrip, {
  formatDateToISOString,
  formatDisplayDate,
} from '../schedule/components/ScheduleDateStrip';
import ScheduleTimelineItem from '../schedule/components/ScheduleTimelineItem';
import ScheduleFormModal from '../schedule/components/ScheduleFormModal';

type PlannerSectionItem =
  | { type: 'controls'; id: string }
  | { type: 'task'; data: TaskItem; id: string }
  | { type: 'schedule'; data: ScheduleItem; id: string }
  | { type: 'empty'; id: string };

export const TasksAndScheduleScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Active sub-tab
  const [topTab, setTopTab] = useState<'tasks' | 'schedule'>(
    route.params?.initialTab === 'schedule' ? 'schedule' : 'tasks'
  );

  // Tasks state
  const {
    tasks,
    deleteTask,
    toggleTaskComplete,
    refresh: refreshTasks,
  } = useTask();

  const [taskSearch, setTaskSearch] = useState('');
  const [activeTaskFilter, setActiveTaskFilter] = useState<FilterStatus>('all');

  // Schedules state
  const {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    refresh: refreshSchedules,
  } = useSchedule();

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    route.params?.date
      ? formatDateToISOString(new Date(route.params.date))
      : formatDateToISOString(new Date())
  );

  // Form Modal state for Schedules
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('09:00 AM');

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshTasks(), refreshSchedules()]);
    setRefreshing(false);
  }, [refreshTasks, refreshSchedules]);

  // Statistics calculation
  const activeTasksCount = useMemo(
    () => tasks.filter((t) => t.status !== 'Done').length,
    [tasks]
  );
  const todaySchedulesCount = useMemo(
    () => schedules.filter((s) => dayjs(s.date).isSame(dayjs(), 'day')).length,
    [schedules]
  );

  // Dynamic filter counts for Tasks
  const taskCounts = useMemo(() => {
    const all = tasks.length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    return { all, todo, inProgress, done };
  }, [tasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      if (activeTaskFilter !== 'all' && item.status !== activeTaskFilter) {
        return false;
      }
      if (taskSearch.trim().length > 0) {
        const query = taskSearch.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchClient = item.clientName?.toLowerCase().includes(query);
        const matchProject = item.project?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        return matchTitle || matchClient || matchProject || matchDesc;
      }
      return true;
    });
  }, [tasks, activeTaskFilter, taskSearch]);

  // Filtered Schedules by selected date
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) =>
      dayjs(item.date).isSame(dayjs(selectedDate), 'day')
    );
  }, [schedules, selectedDate]);

  // Section data mapping for SectionList
  const sections = useMemo(() => {
    if (topTab === 'tasks') {
      const items: PlannerSectionItem[] = [
        { type: 'controls', id: '__controls_tasks__' },
      ];
      if (filteredTasks.length === 0) {
        items.push({ type: 'empty', id: '__empty_tasks__' });
      } else {
        filteredTasks.forEach((t) => {
          items.push({ type: 'task', data: t, id: t.id });
        });
      }
      return [{ title: 'planner_content', data: items }];
    } else {
      const items: PlannerSectionItem[] = [
        { type: 'controls', id: '__controls_schedule__' },
      ];
      if (filteredSchedules.length === 0) {
        items.push({ type: 'empty', id: '__empty_schedule__' });
      } else {
        filteredSchedules.forEach((s) => {
          items.push({ type: 'schedule', data: s, id: s.id });
        });
      }
      return [{ title: 'planner_content', data: items }];
    }
  }, [topTab, filteredTasks, filteredSchedules]);

  // Task actions
  const handleTaskPress = useCallback(
    (item: TaskItem) => {
      navigation.navigate('TaskDetail', { taskId: item.id });
    },
    [navigation]
  );

  const handleEditTask = useCallback(
    (item: TaskItem) => {
      navigation.navigate('TaskDetail', { taskId: item.id });
    },
    [navigation]
  );

  const handleDeleteTask = useCallback(
    (item: TaskItem) => {
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete "${item.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTask(item.id);
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete task');
              }
            },
          },
        ]
      );
    },
    [deleteTask]
  );

  const getTaskActions = useCallback(
    (item: TaskItem) => [
      {
        id: 'details',
        title: 'View Details',
        onPress: () => handleTaskPress(item),
      },
      {
        id: 'edit',
        title: 'Edit Task',
        onPress: () => handleEditTask(item),
      },
      {
        id: 'toggle',
        title: item.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete',
        image:
          item.status === 'Done'
            ? Platform.select({ ios: 'circle', android: 'ic_menu_revert' })
            : Platform.select({ ios: 'checkmark.circle', android: 'ic_menu_send' }),
        onPress: () => toggleTaskComplete(item.id),
      },
      {
        id: 'delete',
        title: 'Delete Task',
        destructive: true,
        onPress: () => handleDeleteTask(item),
      },
    ],
    [handleTaskPress, handleEditTask, toggleTaskComplete, handleDeleteTask]
  );

  // Schedule actions
  const handleAddSchedulePress = () => {
    setEditingSchedule(null);
    setSelectedSlotTime('09:00 AM');
    setIsScheduleModalVisible(true);
  };

  const handleEditSchedulePress = useCallback((item: ScheduleItem) => {
    setEditingSchedule(item);
    setSelectedSlotTime(item.startTime || '09:00 AM');
    setIsScheduleModalVisible(true);
  }, []);

  const handleDeleteSchedulePress = useCallback(
    (item: ScheduleItem) => {
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
    },
    [deleteSchedule]
  );

  const handleScheduleItemPress = useCallback(
    (item: ScheduleItem) => {
      const subtitle = item.clientName ? `Client: ${item.clientName}` : 'Internal';
      const notes = item.notes ? `\n\nNotes: ${item.notes}` : '';

      Alert.alert(
        item.title,
        `${item.type} • ${item.startTime} - ${item.endTime}\n${subtitle}${notes}`,
        [
          {
            text: 'Edit',
            onPress: () => handleEditSchedulePress(item),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteSchedulePress(item),
          },
          { text: 'Close', style: 'cancel' },
        ]
      );
    },
    [handleEditSchedulePress, handleDeleteSchedulePress]
  );

  const handleScheduleFormSubmit = async (data: ScheduleFormData) => {
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
      setIsScheduleModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save schedule');
    }
  };

  // Planner Header Add Handler
  const handleTopAddPress = () => {
    if (topTab === 'tasks') {
      navigation.navigate('TaskDetail', { isNew: true });
    } else {
      handleAddSchedulePress();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        /* 1. Planner Header & 2. Statistics Banner scroll up together */
        ListHeaderComponent={
          <View style={styles.headerAndBannerContainer}>
            {/* Header */}
            <View style={styles.plannerHeaderRow}>
              <View>
                <Text style={styles.screenTitle}>Planner</Text>
                <Text style={styles.screenSubtitle}>
                  {tasks.length} tasks • {todaySchedulesCount} events today
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleTopAddPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add new task or schedule"
              >
                <Plus size={22} color={colors.white} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Statistics Banner */}
            <View style={styles.statsBannerContainer}>
              <View style={styles.statsRow}>
                {/* Tasks Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'tasks' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('tasks')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
                      <CheckSquare size={16} color="#4F46E5" />
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statPillText}>
                        {activeTasksCount} Pending
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>{tasks.length}</Text>
                  <Text style={styles.statTitle}>Total Tasks</Text>
                </TouchableOpacity>

                {/* Schedules Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'schedule' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('schedule')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Calendar size={16} color="#D97706" />
                    </View>
                    <View
                      style={[
                        styles.statPill,
                        { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                      ]}
                    >
                      <Text style={[styles.statPillText, { color: '#D97706' }]}>
                        {todaySchedulesCount} Today
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>{schedules.length}</Text>
                  <Text style={styles.statTitle}>Total Events</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        /* 3. Sticky Tab Switch: Tasks vs Schedule */
        renderSectionHeader={() => (
          <View style={styles.stickyTabsWrapper}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  topTab === 'tasks' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('tasks');
                }}
                activeOpacity={0.8}
              >
                <CheckSquare
                  size={16}
                  color={
                    topTab === 'tasks' ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    topTab === 'tasks' && styles.segmentBtnTextActive,
                  ]}
                >
                  Tasks ({activeTasksCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  topTab === 'schedule' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('schedule');
                }}
                activeOpacity={0.8}
              >
                <Calendar
                  size={16}
                  color={
                    topTab === 'schedule' ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    topTab === 'schedule' && styles.segmentBtnTextActive,
                  ]}
                >
                  Schedule ({todaySchedulesCount} today)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        /* 4. Selected Tab's Data */
        renderItem={({ item }) => {
          if (item.type === 'controls') {
            if (topTab === 'tasks') {
              return (
                <View style={styles.controlsWrapper}>
                  {/* Task Search Bar */}
                  <TaskSearchBar
                    value={taskSearch}
                    onChangeText={setTaskSearch}
                    onFilterPress={() => {
                      Alert.alert('Filter', 'Filter tasks by status', [
                        { text: 'All Tasks', onPress: () => setActiveTaskFilter('all') },
                        { text: 'To Do', onPress: () => setActiveTaskFilter('To Do') },
                        { text: 'In Progress', onPress: () => setActiveTaskFilter('In Progress') },
                        { text: 'Done', onPress: () => setActiveTaskFilter('Done') },
                        { text: 'Cancel', style: 'cancel' },
                      ]);
                    }}
                  />

                  {/* Task Filter Tabs */}
                  <TaskFilterTabs
                    activeFilter={activeTaskFilter}
                    onSelectFilter={setActiveTaskFilter}
                    counts={taskCounts}
                  />
                </View>
              );
            } else {
              return (
                <View style={styles.controlsWrapper}>
                  {/* Date Strip */}
                  <ScheduleDateStrip
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                  />

                  {/* Date Header */}
                  <View style={styles.dateHeaderContainer}>
                    <Clock size={15} color={colors.primary} />
                    <Text style={styles.dateHeaderText}>
                      {formatDisplayDate(selectedDate)}
                    </Text>
                  </View>
                </View>
              );
            }
          }

          if (item.type === 'task') {
            return (
              <TaskItemCard
                item={item.data}
                onPress={() => handleTaskPress(item.data)}
                onToggleComplete={() => toggleTaskComplete(item.data.id)}
                actions={getTaskActions(item.data)}
              />
            );
          }

          if (item.type === 'schedule') {
            return (
              <ScheduleTimelineItem
                item={item.data}
                onPress={() => handleScheduleItemPress(item.data)}
              />
            );
          }

          if (item.type === 'empty') {
            const isTasks = topTab === 'tasks';
            return (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  {isTasks ? (
                    <CheckCircle2 size={36} color={colors.primary} />
                  ) : (
                    <Calendar size={36} color={colors.primary} />
                  )}
                </View>
                <Text style={styles.emptyTitle}>
                  {isTasks
                    ? taskSearch
                      ? 'No matching tasks'
                      : activeTaskFilter !== 'all'
                      ? `No ${activeTaskFilter} tasks`
                      : 'No tasks yet'
                    : 'No schedules for this day'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isTasks
                    ? taskSearch
                      ? 'Try adjusting your search criteria.'
                      : 'Create a task to track deliverables and milestones.'
                    : 'Tap the button below to book a meeting or event.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={handleTopAddPress}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.white} />
                  <Text style={styles.emptyAddBtnText}>
                    {isTasks ? 'Create Task' : 'Add Event'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

          return null;
        }}
      />

      {/* Schedule Form Modal */}
      <ScheduleFormModal
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
        onSubmit={handleScheduleFormSubmit}
        defaultDate={selectedDate}
        defaultStartTime={selectedSlotTime}
        initialData={editingSchedule}
      />
    </View>
  );
};

export default TasksAndScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 90,
  },
  headerAndBannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  plannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  statsBannerContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FAF5FF',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  stickyTabsWrapper: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  controlsWrapper: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
