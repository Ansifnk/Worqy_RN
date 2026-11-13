import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  Flag,
  Compass,
  FileText,
  ChevronDown,
  Check,
  Send,
  Clock,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useTask } from '../../hooks/useTask';
import { useClient } from '../../hooks/useClient';
import { useProject } from '../../hooks/useProject';
import { TaskStatus } from './types';
import TaskChecklistSection from './components/TaskChecklistSection';
import { getPriorityColors } from './components/TaskItemCard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ThreeDotsMenu from '../../components/ThreeDotsMenu';
import AddEditTaskScreen from './AddEditTaskScreen';

const TaskDetailViewer: React.FC<{ taskId?: string }> = ({ taskId }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleChecklistItem,
    addChecklistItem,
    deleteChecklistItem,
    addComment,
  } = useTask();

  const { clients } = useClient();
  const { projects } = useProject();

  const existingTask = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  const [commentText, setCommentText] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // If task doesn't exist, show not found
  if (!existingTask) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Task not found or has been deleted.</Text>
        </View>
      </View>
    );
  }

  const isDone = existingTask.status === 'Done';
  const currentPriority = existingTask.priority || 'Medium';
  const currentStatus = existingTask.status || 'To Do';
  const priorityTheme = getPriorityColors(currentPriority);

  // Status badge color
  const getStatusBadgeStyle = (st: TaskStatus) => {
    switch (st) {
      case 'In Progress':
        return { bg: '#EDE9FE', text: '#6C47C8' };
      case 'Done':
        return { bg: '#EAF6EE', text: '#238349' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const statusTheme = getStatusBadgeStyle(currentStatus);

  // Format Due Date
  const formatDetailDueDate = (dateStr?: string) => {
    if (!dateStr) return 'Select due date';
    const d = dayjs(dateStr);
    const today = dayjs();
    const prefix = d.isSame(today, 'day')
      ? 'Today, '
      : d.isSame(today.add(1, 'day'), 'day')
        ? 'Tomorrow, '
        : '';
    return prefix + d.format('D MMM YYYY');
  };

  // Status picker
  const handleStatusPress = () => {
    Alert.alert('Select Status', 'Update task progress status', [
      {
        text: 'To Do',
        onPress: () => updateTask(existingTask.id, { status: 'To Do' }),
      },
      {
        text: 'In Progress',
        onPress: () => updateTask(existingTask.id, { status: 'In Progress' }),
      },
      {
        text: 'Done',
        onPress: () => updateTask(existingTask.id, { status: 'Done' }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Priority picker
  const handlePriorityPress = () => {
    Alert.alert('Select Priority', 'Choose priority level', [
      {
        text: 'High',
        onPress: () => updateTask(existingTask.id, { priority: 'High' }),
      },
      {
        text: 'Medium',
        onPress: () => updateTask(existingTask.id, { priority: 'Medium' }),
      },
      {
        text: 'Low',
        onPress: () => updateTask(existingTask.id, { priority: 'Low' }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Client picker from clients list
  const handleClientPress = () => {
    const clientOptions = [
      {
        text: 'Internal / None',
        onPress: () => {
          updateTask(existingTask.id, { clientId: '', clientName: 'Internal' });
        },
      },
      ...clients.map((c) => ({
        text: c.name + (c.companyName ? ` (${c.companyName})` : ''),
        onPress: () => {
          updateTask(existingTask.id, { clientId: c.id, clientName: c.name });
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert('Select Client', 'Choose a client for this task', clientOptions as any);
  };

  // Edit Project selection
  const handleProjectPress = () => {
    const projectOptions = [
      {
        text: 'None (No Project)',
        onPress: () => {
          updateTask(existingTask.id, { projectId: '', project: '', projectName: '' });
        },
      },
      ...projects.map((p) => ({
        text: p.name + (p.clientName ? ` (${p.clientName})` : ''),
        onPress: () => {
          updateTask(existingTask.id, {
            projectId: p.id,
            projectName: p.name,
            project: p.name,
            ...(p.clientId && !existingTask.clientId
              ? { clientId: p.clientId, clientName: p.clientName }
              : {}),
          });
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert('Select Project', 'Choose an existing project for this task', projectOptions as any);
  };

  // Checklist handlers
  const handleToggleChecklist = (itemId: string) => {
    toggleChecklistItem(existingTask.id, itemId);
  };

  const handleAddChecklist = (itemTitle: string) => {
    addChecklistItem(existingTask.id, itemTitle);
  };

  const handleDeleteChecklist = (itemId: string) => {
    deleteChecklistItem(existingTask.id, itemId);
  };

  // Send comment
  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    const textToSend = commentText;
    setCommentText('');
    await addComment(existingTask.id, textToSend);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* Top Navigation Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>

          <ThreeDotsMenu
            orientation="horizontal"
            iconSize={22}
            iconColor={colors.text}
            title="Task Options"
            buttonStyle={styles.moreButton}
            actions={[
              {
                id: 'edit',
                title: 'Edit Task',
                image: Platform.select({ ios: 'pencil', android: 'ic_menu_edit' }),
                onPress: () =>
                  navigation.navigate('AddEditTask', {
                    taskId: existingTask.id,
                    isEdit: true,
                    initialData: existingTask,
                  }),
              },
              {
                id: 'toggle',
                title: isDone ? 'Mark Incomplete' : 'Mark Done',
                image: isDone
                  ? Platform.select({ ios: 'circle', android: 'ic_menu_revert' })
                  : Platform.select({ ios: 'checkmark.circle', android: 'ic_menu_send' }),
                onPress: () => toggleTaskComplete(existingTask.id),
              },
              {
                id: 'delete',
                title: 'Delete Task',
                destructive: true,
                onPress: () => {
                  Alert.alert('Confirm Delete', 'Delete this task permanently?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteTask(existingTask.id);
                        navigation.goBack();
                      },
                    },
                  ]);
                },
              },
            ]}
          />
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title with Big Checkbox */}
          <View style={styles.titleSection}>
            <TouchableOpacity
              style={[styles.bigCheckbox, isDone && styles.bigCheckboxDone]}
              onPress={() => toggleTaskComplete(existingTask.id)}
              activeOpacity={0.8}
            >
              {isDone && <Check size={18} color={colors.white} strokeWidth={3} />}
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                {existingTask.title}
              </Text>

              {/* Subtitle / Client Name */}
              <TouchableOpacity
                onPress={handleClientPress}
                activeOpacity={0.7}
                style={styles.subtitleRow}
              >
                <Text style={styles.taskSubtitle}>
                  {existingTask.clientName || 'General'}
                  {existingTask.projectName || existingTask.project
                    ? ` • ${existingTask.projectName || existingTask.project}`
                    : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Dropdown Pill */}
          <View style={styles.statusSection}>
            <TouchableOpacity
              style={[styles.statusPill, { backgroundColor: statusTheme.bg }]}
              onPress={handleStatusPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.statusText, { color: statusTheme.text }]}>
                {currentStatus}
              </Text>
              <ChevronDown size={16} color={statusTheme.text} />
            </TouchableOpacity>
          </View>

          {/* Attributes List */}
          <View style={styles.attributesList}>
            {/* Due Date Row */}
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={() => setIsDatePickerOpen(true)}
              activeOpacity={0.7}
            >
              <View style={styles.attrLeft}>
                <Calendar size={18} color="#6B7280" />
                <Text style={styles.attrLabel}>Due Date</Text>
              </View>
              <Text style={styles.attrValue}>
                {formatDetailDueDate(existingTask.dueDate)}
              </Text>
            </TouchableOpacity>

            {/* Priority Row */}
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={handlePriorityPress}
              activeOpacity={0.7}
            >
              <View style={styles.attrLeft}>
                <Flag size={18} color="#6B7280" />
                <Text style={styles.attrLabel}>Priority</Text>
              </View>
              <View
                style={[
                  styles.priorityPill,
                  { backgroundColor: priorityTheme.bg },
                ]}
              >
                <Text
                  style={[styles.priorityPillText, { color: priorityTheme.text }]}
                >
                  {currentPriority}
                </Text>
                <ChevronDown size={14} color={priorityTheme.text} />
              </View>
            </TouchableOpacity>

            {/* Client Row */}
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={handleClientPress}
              activeOpacity={0.7}
            >
              <View style={styles.attrLeft}>
                <Compass size={18} color="#6B7280" />
                <Text style={styles.attrLabel}>Client</Text>
              </View>
              <Text style={styles.attrValue}>
                {existingTask.clientName || 'Select Client'}
              </Text>
            </TouchableOpacity>

            {/* Project Row */}
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={handleProjectPress}
              activeOpacity={0.7}
            >
              <View style={styles.attrLeft}>
                <FileText size={18} color="#6B7280" />
                <Text style={styles.attrLabel}>Project</Text>
              </View>
              <View style={styles.attrRightRow}>
                <Text style={styles.attrValue}>
                  {existingTask.projectName || existingTask.project || 'Select Project'}
                </Text>
                <ChevronDown size={14} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.descriptionText}>
              {existingTask.description?.trim() || 'No description provided.'}
            </Text>
          </View>

          {/* Checklist Section */}
          <TaskChecklistSection
            items={existingTask.checklist || []}
            onToggleItem={handleToggleChecklist}
            onAddItem={handleAddChecklist}
            onDeleteItem={handleDeleteChecklist}
          />

          {/* Comments List */}
          {existingTask.comments && existingTask.comments.length > 0 && (
            <View style={styles.commentsListSection}>
              <Text style={styles.sectionHeader}>Comments</Text>
              {existingTask.comments.map((cmt) => (
                <View key={cmt.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {cmt.authorName || 'Me'}
                    </Text>
                    <Text style={styles.commentTime}>
                      {cmt.createdAt ? dayjs(cmt.createdAt).format('h:mm A') : ''}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>{cmt.text}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Bottom Floating Comment Bar */}
        <View
          style={[
            styles.bottomBarWrapper,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.commentInputRow}>
            <Clock size={18} color="#9CA3AF" style={styles.commentIcon} />
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              returnKeyType="send"
              onSubmitEditing={handleSendComment}
            />
            {commentText.trim().length > 0 && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendComment}
                activeOpacity={0.8}
              >
                <Send size={16} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerOpen}
          mode="date"
          date={
            existingTask.dueDate && dayjs(existingTask.dueDate).isValid()
              ? new Date(existingTask.dueDate)
              : new Date()
          }
          onConfirm={(date) => {
            setIsDatePickerOpen(false);
            updateTask(existingTask.id, { dueDate: date.toISOString() });
          }}
          onCancel={() => setIsDatePickerOpen(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export const TaskDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const { taskId, isNew } = route.params || {};

  if (isNew) {
    return <AddEditTaskScreen />;
  }

  return <TaskDetailViewer taskId={taskId} />;
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 6,
  },
  moreButton: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  bigCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: colors.surface,
  },
  bigCheckboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  titleWrapper: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  subtitleRow: {
    marginTop: 4,
  },
  taskSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  attributesList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 14,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  attrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attrLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  attrRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  commentsListSection: {
    marginTop: 28,
  },
  commentItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  commentTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  commentContent: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
  },
  commentIcon: {
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
    paddingVertical: 0,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
