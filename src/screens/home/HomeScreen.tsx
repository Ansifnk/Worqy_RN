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
import TaskAnalyticsHero from './components/TaskAnalyticsHero';
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

  // Task Analytics calculations
  const inProgressTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'In Progress');
  }, [tasks]);

  const todoTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'To Do' || (!t.status && t.status !== 'Done'));
  }, [tasks]);

  const highPriorityTotal = useMemo(() => {
    return tasks.filter((t) => t.priority === 'High').length;
  }, [tasks]);

  const mediumPriorityTotal = useMemo(() => {
    return tasks.filter((t) => t.priority === 'Medium').length;
  }, [tasks]);

  const lowPriorityTotal = useMemo(() => {
    return tasks.filter((t) => t.priority === 'Low' || !t.priority).length;
  }, [tasks]);

  const overdueTasksCount = useMemo(() => {
    const today = dayjs().startOf('day');
    return tasks.filter(
      (t) => t.status !== 'Done' && t.dueDate && dayjs(t.dueDate).isBefore(today)
    ).length;
  }, [tasks]);

  const dueTodayTasksCount = useMemo(() => {
    const now = dayjs();
    return tasks.filter(
      (t) => t.status !== 'Done' && t.dueDate && dayjs(t.dueDate).isSame(now, 'day')
    ).length;
  }, [tasks]);

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

        {/* Task Analytics & Productivity Hero Card */}
        <TaskAnalyticsHero
          totalTasks={tasks.length}
          completedCount={completedTasks.length}
          inProgressCount={inProgressTasks.length}
          todoCount={todoTasks.length}
          highPriorityCount={highPriorityTotal}
          mediumPriorityCount={mediumPriorityTotal}
          lowPriorityCount={lowPriorityTotal}
          overdueCount={overdueTasksCount}
          dueTodayCount={dueTodayTasksCount}
          onPress={() => navigation.navigate('Tasks')}
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
