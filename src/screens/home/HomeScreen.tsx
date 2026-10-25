import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAppContext } from '../../context/AppContext';
import { colors } from '../../utils/colors';
import HomeHeader from './components/HomeHeader';
import HeroProductivityCard from './components/HeroProductivityCard';
import ScheduleCard, { ScheduleItem } from './components/ScheduleCard';
import ClientCard, { ClientItem } from './components/ClientCard';

const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: 's-1',
    time: '10:00 AM',
    title: 'Client Meeting',
    subtitle: 'Bricado - Project Discussion',
    type: 'video',
  },
  {
    id: 's-2',
    time: '2:00 PM',
    title: 'Design Review',
    subtitle: 'Worqy Mobile App',
    type: 'document',
  },
];

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: 'c-1',
    name: 'Bricado',
    status: 'Ongoing Project',
    badgeType: 'bricado',
    optionsColor: '#16A34A',
  },
  {
    id: 'c-2',
    name: 'NKT Electronics',
    status: 'Proposal Sent',
    badgeType: 'nkt',
  },
  {
    id: 'c-3',
    name: 'Britauria',
    status: 'Project Completed',
    badgeType: 'britauria',
  },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAppContext();

  const [scheduleList] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [clientsList] = useState<ClientItem[]>(INITIAL_CLIENTS);

  const displayName = user?.name || 'Ansif';

  const handleNotificationPress = () => {
    Alert.alert('Notifications', 'You have no new notifications at this time.');
  };

  const handleViewAllSchedule = () => {
    Alert.alert("Today's Schedule", 'Viewing complete schedule.');
  };

  const handleViewAllClients = () => {
    Alert.alert('Recent Clients', 'Viewing all active & past clients.');
  };

  const handleSchedulePress = (item: ScheduleItem) => {
    Alert.alert(item.title, `${item.time}\n${item.subtitle}`);
  };

  const handleClientPress = (item: ClientItem) => {
    Alert.alert(item.name, `Status: ${item.status}`);
  };

  const handleFabPress = () => {
    Alert.alert('Create New', 'Add a new task, meeting, or client to your workspace.', [
      { text: 'Add Task', onPress: () => {} },
      { text: 'Schedule Meeting', onPress: () => {} },
      { text: 'New Client', onPress: () => {} },
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
      >
        {/* Top Header */}
        <HomeHeader
          userName={displayName}
          onNotificationPress={handleNotificationPress}
        />

        {/* Hero Productivity Card */}
        <HeroProductivityCard
          tasksCount={3}
          meetingsCount={2}
          activeClientsCount={4}
          onPressAnalytics={() => Alert.alert('Productivity', 'Weekly productivity report: +18%')}
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
          {scheduleList.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              onPress={() => handleSchedulePress(item)}
              onOptionsPress={() => Alert.alert(item.title, 'Schedule options')}
            />
          ))}
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
          {clientsList.map((item) => (
            <ClientCard
              key={item.id}
              item={item}
              onPress={() => handleClientPress(item)}
              onOptionsPress={() => Alert.alert(item.name, 'Client options')}
            />
          ))}
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