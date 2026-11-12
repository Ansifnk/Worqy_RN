import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { colors } from '../../utils/colors';
import { useClient } from '../../hooks/useClient';
import { useSchedule } from '../../hooks/useSchedule';
import { useTask } from '../../hooks/useTask';
import { useProject } from '../../hooks/useProject';
import { useInvoice } from '../../hooks/useInvoice';
import HomeHeader from './components/HomeHeader';
import HeroDailyPulse from './components/HeroDailyPulse';
import QuickActionsStrip from './components/QuickActionsStrip';
import HomeBentoGridModern from './components/HomeBentoGridModern';
import ClientFormModal from '../clients/components/ClientFormModal';
import ScheduleFormModal from '../schedule/components/ScheduleFormModal';
import { GlobalQuickSwitcher } from '../../components/GlobalQuickSwitcher';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAppContext();

  // Server Data Hooks (TanStack Query)
  const {
    clients,
    addClient,
    refresh: refreshClients,
  } = useClient();

  const {
    schedules,
    addSchedule,
    refresh: refreshSchedules,
  } = useSchedule();

  const {
    tasks,
    refresh: refreshTasks,
  } = useTask();

  const {
    projects,
    refresh: refreshProjects,
  } = useProject();

  const {
    invoices,
    refresh: refreshInvoices,
  } = useInvoice();

  // Modal & Switcher states
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name || 'Ansif';
  const avatarUrl = (user as any)?.avatar || (user as any)?.profilePic;

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshClients(),
        refreshSchedules(),
        refreshTasks(),
        refreshProjects(),
        refreshInvoices(),
      ]);
    } catch (e) {
      console.warn('Failed to refresh home data:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshClients, refreshSchedules, refreshTasks, refreshProjects, refreshInvoices]);

  // Tasks calculations
  const activeTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'Done');
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'Done');
  }, [tasks]);

  const highPriorityTasks = useMemo(() => {
    return activeTasks.filter((t) => t.priority === 'High');
  }, [activeTasks]);

  // Top focus task (highest priority active task, or first active task)
  const topFocusTask = useMemo(() => {
    if (activeTasks.length === 0) return null;
    if (highPriorityTasks.length > 0) return highPriorityTasks[0];
    return activeTasks[0];
  }, [activeTasks, highPriorityTasks]);

  const hasFocusTask = Boolean(topFocusTask);
  const focusTaskTitle = topFocusTask?.title || 'UI/UX Portfolio Design';
  const focusTaskProject = topFocusTask?.projectName || topFocusTask?.project;
  const focusTaskPriority = topFocusTask?.priority || 'High';

  const focusTaskProgress = useMemo(() => {
    if (!topFocusTask) return 0;
    if (topFocusTask.checklist && topFocusTask.checklist.length > 0) {
      const completed = topFocusTask.checklist.filter((c) => c.completed).length;
      return Math.round((completed / topFocusTask.checklist.length) * 100);
    }
    if (tasks.length > 0) {
      return Math.round((completedTasks.length / tasks.length) * 100);
    }
    return 75; // aesthetic fallback if active
  }, [topFocusTask, tasks, completedTasks]);

  const focusTaskChecklistSummary = useMemo(() => {
    if (!topFocusTask?.checklist || topFocusTask.checklist.length === 0) return undefined;
    const completed = topFocusTask.checklist.filter((c) => c.completed).length;
    return `${completed} of ${topFocusTask.checklist.length} subtasks done`;
  }, [topFocusTask]);

  const focusTaskDueText = useMemo(() => {
    if (!topFocusTask?.dueDate) return 'Due today';
    const due = dayjs(topFocusTask.dueDate);
    const now = dayjs();
    const diffHours = due.diff(now, 'hour');
    if (diffHours > 0 && diffHours < 24) {
      const diffMins = due.diff(now, 'minute') % 60;
      return `Due in ${diffHours}h ${diffMins > 0 ? `${diffMins}m` : ''}`;
    }
    if (due.isSame(now, 'day')) return 'Due Today';
    if (due.isBefore(now)) return 'Overdue';
    return `Due ${due.format('MMM D')}`;
  }, [topFocusTask]);

  // Clients calculations
  const activeClientsCount = useMemo(() => {
    return clients.filter((c) => c.status === 'Active').length;
  }, [clients]);

  // Projects calculations
  const activeProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'In Progress').length;
  }, [projects]);

  const projectProgress = useMemo(() => {
    if (projects.length === 0) return 0;
    const done = projects.filter((p) => p.status === 'Completed').length;
    return Math.round((done / projects.length) * 100);
  }, [projects]);

  // Invoices calculations
  const invoicesSummary = useMemo(() => {
    const pending = invoices.filter((i) => i.status !== 'Paid');
    if (pending.length > 0) return `${pending.length} Due`;
    if (invoices.length > 0) return `${invoices.length} Total`;
    return '0 Due';
  }, [invoices]);

  // Upcoming Schedule Item
  const upcomingSchedule = useMemo(() => {
    const now = dayjs();
    const today = schedules.filter((item) => dayjs(item.date).isSame(now, 'day'));
    if (today.length > 0) return today[0];
    const future = schedules
      .filter((s) => dayjs(s.date).isAfter(now))
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    return future[0] || null;
  }, [schedules]);

  const upcomingTitle = upcomingSchedule ? upcomingSchedule.title : undefined;
  const upcomingTime = useMemo(() => {
    if (!upcomingSchedule) return undefined;
    const itemDate = dayjs(upcomingSchedule.date);
    const now = dayjs();
    const isToday = itemDate.isSame(now, 'day');
    const isTomorrow = itemDate.isSame(now.add(1, 'day'), 'day');
    const datePrefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : itemDate.format('MMM D');
    return upcomingSchedule.startTime
      ? `${datePrefix}, ${upcomingSchedule.startTime}`
      : datePrefix;
  }, [upcomingSchedule]);

  // Quick Action Handlers
  const handleAddTask = () => {
    navigation.navigate('TaskDetail', { isNew: true });
  };

  const handleAddProject = () => {
    navigation.navigate('AddEditProject');
  };

  const handleAddClient = () => {
    setIsClientModalVisible(true);
  };

  const handleAddInvoice = () => {
    navigation.navigate('AddEditInvoice', { isEdit: false });
  };

  const handleAddSchedule = () => {
    setIsScheduleModalVisible(true);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: Math.max(insets.bottom + 84, 104), // clearance for bottom right floating switcher
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header: 4-square App Launcher (Left) + Date Badge + Profile Avatar (Right) */}
        <HomeHeader
          userName={displayName}
          avatarUrl={avatarUrl}
          onMenuPress={() => setIsSwitcherOpen(true)}
          onProfilePress={() => navigation.navigate('Profile')}
        />

        {/* Hero Card: Executive Daily Pulse */}
        <HeroDailyPulse
          hasTask={hasFocusTask}
          title={focusTaskTitle}
          projectName={focusTaskProject}
          priority={focusTaskPriority}
          progressPercentage={focusTaskProgress}
          dueText={focusTaskDueText}
          checklistSummary={focusTaskChecklistSummary}
          onPress={() => {
            if (topFocusTask) {
              navigation.navigate('TaskDetail', { taskId: topFocusTask.id });
            } else {
              navigation.navigate('Tasks');
            }
          }}
          onCreateTask={handleAddTask}
        />

        {/* 1-Tap Quick Creation Strip */}
        <QuickActionsStrip
          onAddTask={handleAddTask}
          onAddProject={handleAddProject}
          onAddClient={handleAddClient}
          onAddInvoice={handleAddInvoice}
        />

        {/* Modern Workspace Bento Hub:
            - Row 1: Tasks (Left) & Clients (Right)
            - Row 2: Active Projects Spotlight with SVG Circular Progress
            - Row 3: Invoices & Cash Flow (Left) & AI Copilot (Right)
            - Row 4: Next Up Agenda / Clear Schedule
        */}
        <HomeBentoGridModern
          tasksRemaining={activeTasks.length}
          highPriorityTasksCount={highPriorityTasks.length}
          clientsCount={clients.length}
          activeClientsCount={activeClientsCount}
          projectsCount={projects.length}
          activeProjectsCount={activeProjectsCount}
          projectProgress={projectProgress}
          invoicesSummary={invoicesSummary}
          invoicesCount={invoices.length}
          upcomingTitle={upcomingTitle}
          upcomingTime={upcomingTime}
          onNavigateTasks={() => navigation.navigate('Tasks')}
          onNavigateClients={() => navigation.navigate('Clients')}
          onNavigateProjects={() => navigation.navigate('Projects')}
          onNavigateInvoices={() => navigation.navigate('Invoices')}
          onNavigateAI={() => navigation.navigate('AIChat')}
          onNavigateSchedule={() => navigation.navigate('Schedule')}
          onAddSchedule={handleAddSchedule}
        />
      </ScrollView>

      {/* Floating Workspace Quick Switcher shown where it was before at bottom right */}
      <GlobalQuickSwitcher
        currentRoute="Main"
        isOpen={isSwitcherOpen}
        onOpenChange={setIsSwitcherOpen}
        hideFloatingTrigger={false}
      />

      {/* Modal: Fast Add Client */}
      <ClientFormModal
        visible={isClientModalVisible}
        onClose={() => setIsClientModalVisible(false)}
        onSubmit={async (data) => {
          try {
            await addClient(data);
            setIsClientModalVisible(false);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to save client');
          }
        }}
        initialData={null}
      />

      {/* Modal: Fast Add Schedule */}
      <ScheduleFormModal
        visible={isScheduleModalVisible}
        onClose={() => setIsScheduleModalVisible(false)}
        onSubmit={async (data) => {
          try {
            await addSchedule(data);
            setIsScheduleModalVisible(false);
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to save schedule');
          }
        }}
        initialData={null}
        defaultDate={new Date().toISOString()}
        defaultStartTime="09:00 AM"
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate-50 crisp canvas
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
