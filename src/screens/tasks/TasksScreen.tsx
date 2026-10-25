import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Alert,
  Text,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/colors';
import { LoadingView } from '../../components/LoadingView';
import { useTask } from '../../hooks/useTask';
import { TaskItem } from './types';
import TasksHeader from './components/TasksHeader';
import TaskSearchBar from './components/TaskSearchBar';
import TaskFilterTabs, { FilterStatus } from './components/TaskFilterTabs';
import TaskItemCard from './components/TaskItemCard';
import { CheckCircle2 } from 'lucide-react-native';

export const TasksScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    tasks,
    loading,
    deleteTask,
    toggleTaskComplete,
    refresh,
  } = useTask();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Dynamic filter counts
  const counts = useMemo(() => {
    const all = tasks.length;
    const todo = tasks.filter((t) => t.status === 'To Do').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    return { all, todo, inProgress, done };
  }, [tasks]);

  // Filtered task items
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Status filter
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchClient = item.clientName?.toLowerCase().includes(query);
        const matchProject = item.project?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        return matchTitle || matchClient || matchProject || matchDesc;
      }

      return true;
    });
  }, [tasks, activeFilter, searchQuery]);

  const handleAddTask = () => {
    navigation.navigate('TaskDetail', { isNew: true });
  };

  const handleEditTask = (item: TaskItem) => {
    navigation.navigate('TaskDetail', { taskId: item.id });
  };

  const handleDeleteTask = (item: TaskItem) => {
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
  };

  const handleTaskPress = (item: TaskItem) => {
    navigation.navigate('TaskDetail', { taskId: item.id });
  };

  const handleMorePress = (item: TaskItem) => {
    Alert.alert(item.title, 'Select an action', [
      { text: 'View Details', onPress: () => handleTaskPress(item) },
      { text: 'Edit', onPress: () => handleEditTask(item) },
      {
        text: item.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete',
        onPress: () => toggleTaskComplete(item.id),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDeleteTask(item),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <TasksHeader onAddTask={handleAddTask} />

      {/* Search Bar */}
      <TaskSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => {
          Alert.alert('Filter', 'Filter tasks by priority or status', [
            { text: 'All Tasks', onPress: () => setActiveFilter('all') },
            { text: 'To Do', onPress: () => setActiveFilter('To Do') },
            { text: 'In Progress', onPress: () => setActiveFilter('In Progress') },
            { text: 'Done', onPress: () => setActiveFilter('Done') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
      />

      {/* Filter Tabs */}
      <TaskFilterTabs
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        counts={counts}
      />

      {/* Tasks List */}
      {loading && tasks.length === 0 ? (
        <LoadingView message="Loading tasks..." />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItemCard
              item={item}
              onPress={() => handleTaskPress(item)}
              onToggleComplete={() => toggleTaskComplete(item.id)}
              onMorePress={() => handleMorePress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredTasks.length === 0 && styles.emptyListContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <CheckCircle2 size={36} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'No matching tasks'
                  : activeFilter !== 'all'
                  ? `No ${activeFilter} tasks`
                  : 'No tasks yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Tap the "+" button at the top to create a task.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TasksScreen;
