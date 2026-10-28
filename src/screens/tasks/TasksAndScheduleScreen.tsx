import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { CheckSquare, Calendar } from 'lucide-react-native';
import dayjs from 'dayjs';
import { colors } from '../../utils/colors';
import { useTask } from '../../hooks/useTask';
import { useSchedule } from '../../hooks/useSchedule';
import { TasksScreen } from './TasksScreen';
import { ScheduleScreen } from '../schedule/ScheduleScreen';

export const TasksAndScheduleScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const [topTab, setTopTab] = useState<'tasks' | 'schedule'>(
    route.params?.initialTab === 'schedule' ? 'schedule' : 'tasks'
  );

  const { tasks } = useTask();
  const { schedules } = useSchedule();

  const activeTasksCount = tasks.filter((t) => t.status !== 'Done').length;
  const todaySchedulesCount = schedules.filter((s) =>
    dayjs(s.date).isSame(dayjs(), 'day')
  ).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Segmented Bar: [ Tasks | Schedule ] */}
      <View style={styles.topSegmentedWrapper}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'tasks' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('tasks');
            }}
            activeOpacity={0.8}
          >
            <CheckSquare
              size={16}
              color={topTab === 'tasks' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'tasks' && styles.segmentBtnTextActive,
              ]}
            >
              Tasks {activeTasksCount > 0 ? `(${activeTasksCount})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'schedule' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('schedule');
            }}
            activeOpacity={0.8}
          >
            <Calendar
              size={16}
              color={topTab === 'schedule' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'schedule' && styles.segmentBtnTextActive,
              ]}
            >
              Schedule {todaySchedulesCount > 0 ? `(${todaySchedulesCount} today)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Selected View */}
      {topTab === 'schedule' ? (
        <View style={styles.contentContainer}>
          <ScheduleScreen embedded={true} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <TasksScreen embedded={true} />
        </View>
      )}
    </View>
  );
};

export default TasksAndScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topSegmentedWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
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
  contentContainer: {
    flex: 1,
  },
});
