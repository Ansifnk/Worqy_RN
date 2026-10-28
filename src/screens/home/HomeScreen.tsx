import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Calendar, Users, PlusCircle } from 'lucide-react-native';
import dayjs from 'dayjs';
import { useAppContext } from '../../context/AppContext';
import { colors } from '../../utils/colors';
import { useClient } from '../../hooks/useClient';
import { useSchedule } from '../../hooks/useSchedule';
import { useTask } from '../../hooks/useTask';
import { useProject } from '../../hooks/useProject';
import HomeHeader from './components/HomeHeader';
import HeroProductivityCard from './components/HeroProductivityCard';
import QuickActionsSection from './components/QuickActionsSection';
import ScheduleCard from './components/ScheduleCard';
import ClientCard from './components/ClientCard';
import ClientFormModal from '../clients/components/ClientFormModal';
import ScheduleFormModal from '../schedule/components/ScheduleFormModal';
import { ClientItem } from '../clients/types';
import { ScheduleItem } from '../schedule/types';

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAppContext();

  // Server Data Hooks (TanStack Query)
  const {
    clients,
    addClient,
    deleteClient,
    refresh: refreshClients,
  } = useClient();

  const {
    schedules,
    addSchedule,
    deleteSchedule,
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

  // Modal visibility states for Quick Actions / FAB
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name || 'Ansif';

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshClients(),
        refreshSchedules(),
        refreshTasks(),
        refreshProjects(),
      ]);
    } catch (e) {
      console.warn('Failed to refresh home data:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshClients, refreshSchedules, refreshTasks, refreshProjects]);

  // Today's schedules from Firebase
  const todaySchedules = useMemo(() => {
    return schedules.filter((item) => dayjs(item.date).isSame(dayjs(), 'day'));
  }, [schedules]);

  // Recent clients from Firebase (latest 3)
  const recentClients = useMemo(() => {
    return clients.slice(0, 3);
  }, [clients]);

  // Hero productivity metrics
  const activeTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status !== 'Done').length;
  }, [tasks]);

  const todayMeetingsCount = useMemo(() => {
    return todaySchedules.length;
  }, [todaySchedules]);

  const activeClientsCount = useMemo(() => {
    return clients.filter((c) => c.status === 'Active').length;
  }, [clients]);

  // Header Handlers
  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have no new notifications at this time.');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Quick Action Handlers
  const handleAddClient = () => {
    setIsClientModalVisible(true);
  };

  const handleAddTask = () => {
    navigation.navigate('TaskDetail', { isNew: true });
  };

  const handleAddInvoice = () => {
    navigation.navigate('AddEditInvoice', { isEdit: false });
  };

  const handleAddSchedule = () => {
    setIsScheduleModalVisible(true);
  };

  // Navigation to main tabs
  const handleViewAllSchedule = () => {
    navigation.navigate('Schedule');
  };

  const handleViewAllClients = () => {
    navigation.navigate('Clients');
  };

  const handleSchedulePress = (item: ScheduleItem) => {
    navigation.navigate('Schedule');
  };

  const handleClientPress = (item: ClientItem) => {
    navigation.navigate('Clients');
  };

  const handleDeleteSchedule = (item: ScheduleItem) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${item.title}"?`,
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

  const handleDeleteClient = (item: ClientItem) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to remove "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(item.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete client');
            }
          },
        },
      ]
    );
  };

  const handleAddProject = () => {
    navigation.navigate('AddEditProject');
  };

  // FAB Press handler
  const handleFabPress = () => {
    Alert.alert('Create New', 'Choose an action to create in your workspace:', [
      { text: 'Add Project', onPress: handleAddProject },
      { text: 'Add Client', onPress: handleAddClient },
      { text: 'Add Task', onPress: handleAddTask },
      { text: 'Add Invoice', onPress: handleAddInvoice },
      { text: 'Add Schedule', onPress: handleAddSchedule },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
            paddingBottom: Math.max(insets.bottom + 80, 100),
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
        {/* Top Header with Profile Icon at Top Right */}
        <HomeHeader
          userName={displayName}
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
        />

        {/* Hero Productivity Card with live Firebase statistics */}
        <HeroProductivityCard
          tasksCount={activeTasksCount}
          meetingsCount={todayMeetingsCount}
          activeClientsCount={activeClientsCount}
          onPressAnalytics={() => {
            Alert.alert(
              'Workspace Summary',
              `• ${activeTasksCount} Pending Tasks\n• ${todayMeetingsCount} Scheduled Today\n• ${activeClientsCount} Active Clients`
            );
          }}
        />

        {/* Quick Actions Section */}
        <QuickActionsSection
          onAddClient={handleAddClient}
          onAddTask={handleAddTask}
          onAddInvoice={handleAddInvoice}
          onAddSchedule={handleAddSchedule}
        />

        {/* Section 1: Today's Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity
            onPress={handleViewAllSchedule}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContent}>
          {todaySchedules.length > 0 ? (
            todaySchedules.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                onPress={() => handleSchedulePress(item)}
                actions={[
                  {
                    id: 'view',
                    title: 'View in Schedule',
                    onPress: () => handleSchedulePress(item),
                  },
                  {
                    id: 'delete',
                    title: 'Delete',
                    destructive: true,
                    onPress: () => handleDeleteSchedule(item),
                  },
                ]}
              />
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconBg}>
                <Calendar size={22} color={colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>No schedules for today</Text>
              <Text style={styles.emptyStateSubtitle}>
                Plan your meetings, tasks, and client calls.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddSchedule}
                activeOpacity={0.7}
              >
                <PlusCircle size={15} color={colors.primary} />
                <Text style={styles.emptyStateButtonText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Section 2: Recent Clients */}
        <View style={[styles.sectionHeader, styles.clientsSectionHeader]}>
          <Text style={styles.sectionTitle}>Recent Clients</Text>
          <TouchableOpacity
            onPress={handleViewAllClients}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContent}>
          {recentClients.length > 0 ? (
            recentClients.map((item) => (
              <ClientCard
                key={item.id}
                item={item}
                onPress={() => handleClientPress(item)}
                actions={[
                  {
                    id: 'details',
                    title: 'View Client',
                    onPress: () => handleClientPress(item),
                  },
                  {
                    id: 'delete',
                    title: 'Delete',
                    destructive: true,
                    onPress: () => handleDeleteClient(item),
                  },
                ]}
              />
            ))
          ) : (
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconBg}>
                <Users size={22} color={colors.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Clients added yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Keep track of your clients and ongoing projects.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleAddClient}
                activeOpacity={0.7}
              >
                <PlusCircle size={15} color={colors.primary} />
                <Text style={styles.emptyStateButtonText}>Add Client</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            bottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
        onPress={handleFabPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create new item"
      >
        <Plus size={24} color={colors.white} strokeWidth={2.6} />
      </TouchableOpacity>

      {/* Add Client Modal */}
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

      {/* Add Schedule Modal */}
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  clientsSectionHeader: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  sectionContent: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  emptyStateCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#134E4A', // Matches hero dark-teal tone
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
});