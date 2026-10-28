import React, { useState, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  Flag,
  User,
  Compass,
  FileText,
  ChevronDown,
  Check,
  Send,
  Clock,
  Save,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useTask } from '../../hooks/useTask';
import { useClient } from '../../hooks/useClient';
import { useProject } from '../../hooks/useProject';
import { TaskPriority, TaskStatus, ChecklistItem, TaskFormData } from './types';
import TaskChecklistSection from './components/TaskChecklistSection';
import { getPriorityColors } from './components/TaskItemCard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ThreeDotsMenu from '../../components/ThreeDotsMenu';

export const TaskDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId, isNew } = route.params || {};

  const {
    tasks,
    addTask,
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

  // Form states (used for new task or inline edits)
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [project, setProject] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString());
  const [priority, setPriority] = useState<TaskPriority>('High');
  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sync state if viewing an existing task
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title || '');
      setClientName(existingTask.clientName || '');
      setClientId(existingTask.clientId || '');
      setProject(existingTask.projectName || existingTask.project || '');
      setProjectId(existingTask.projectId || '');
      setDueDate(existingTask.dueDate || new Date().toISOString());
      setPriority(existingTask.priority || 'Medium');
      setStatus(existingTask.status || 'To Do');
      setDescription(existingTask.description || '');
      setChecklist(existingTask.checklist || []);
    } else if (isNew) {
      // Default initial dummy values matching design inspiration
      setTitle('');
      setClientName(route.params?.prefillClientName || '');
      setClientId(route.params?.prefillClientId || '');
      setProject(route.params?.prefillProject || '');
      setProjectId(route.params?.prefillProjectId || '');
      setDueDate(new Date().toISOString());
      setPriority('High');
      setStatus('In Progress');
      setDescription('');
      setChecklist([]);
    }
  }, [existingTask, isNew, route.params]);

  // If not new and task doesn't exist, show not found
  if (!isNew && !existingTask) {
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

  const isDone = isNew ? status === 'Done' : existingTask?.status === 'Done';
  const currentPriority = isNew ? priority : (existingTask?.priority || priority);
  const currentStatus = isNew ? status : (existingTask?.status || status);
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
        onPress: () => {
          if (isNew) setStatus('To Do');
          else if (existingTask) updateTask(existingTask.id, { status: 'To Do' });
        },
      },
      {
        text: 'In Progress',
        onPress: () => {
          if (isNew) setStatus('In Progress');
          else if (existingTask) updateTask(existingTask.id, { status: 'In Progress' });
        },
      },
      {
        text: 'Done',
        onPress: () => {
          if (isNew) setStatus('Done');
          else if (existingTask) updateTask(existingTask.id, { status: 'Done' });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Priority picker
  const handlePriorityPress = () => {
    Alert.alert('Select Priority', 'Choose priority level', [
      {
        text: 'High',
        onPress: () => {
          if (isNew) setPriority('High');
          else if (existingTask) updateTask(existingTask.id, { priority: 'High' });
        },
      },
      {
        text: 'Medium',
        onPress: () => {
          if (isNew) setPriority('Medium');
          else if (existingTask) updateTask(existingTask.id, { priority: 'Medium' });
        },
      },
      {
        text: 'Low',
        onPress: () => {
          if (isNew) setPriority('Low');
          else if (existingTask) updateTask(existingTask.id, { priority: 'Low' });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Client picker from firebaseCollections.clients
  const handleClientPress = () => {
    const clientOptions = [
      {
        text: 'Internal / None',
        onPress: () => {
          if (isNew) {
            setClientId('');
            setClientName('Internal');
          } else if (existingTask) {
            updateTask(existingTask.id, { clientId: '', clientName: 'Internal' });
          }
        },
      },
      ...clients.map((c) => ({
        text: c.name + (c.companyName ? ` (${c.companyName})` : ''),
        onPress: () => {
          if (isNew) {
            setClientId(c.id);
            setClientName(c.name);
          } else if (existingTask) {
            updateTask(existingTask.id, { clientId: c.id, clientName: c.name });
          }
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
          if (isNew) {
            setProjectId('');
            setProject('');
          } else if (existingTask) {
            updateTask(existingTask.id, { projectId: '', project: '', projectName: '' });
          }
        },
      },
      ...projects.map((p) => ({
        text: p.name + (p.clientName ? ` (${p.clientName})` : ''),
        onPress: () => {
          if (isNew) {
            setProjectId(p.id);
            setProject(p.name);
            if (p.clientId && !clientId) {
              setClientId(p.clientId);
              setClientName(p.clientName || '');
            }
          } else if (existingTask) {
            updateTask(existingTask.id, {
              projectId: p.id,
              projectName: p.name,
              project: p.name,
              ...(p.clientId && !existingTask.clientId
                ? { clientId: p.clientId, clientName: p.clientName }
                : {}),
            });
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert('Select Project', 'Choose an existing project for this task', projectOptions as any);
  };

  // Checklist handlers
  const handleToggleChecklist = (itemId: string) => {
    if (isNew) {
      setChecklist((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i))
      );
    } else if (existingTask) {
      toggleChecklistItem(existingTask.id, itemId);
    }
  };

  const handleAddChecklist = (itemTitle: string) => {
    if (isNew) {
      const newItem: ChecklistItem = {
        id: `item_${Date.now()}`,
        title: itemTitle,
        completed: false,
      };
      setChecklist((prev) => [...prev, newItem]);
    } else if (existingTask) {
      addChecklistItem(existingTask.id, itemTitle);
    }
  };

  const handleDeleteChecklist = (itemId: string) => {
    if (isNew) {
      setChecklist((prev) => prev.filter((i) => i.id !== itemId));
    } else if (existingTask) {
      deleteChecklistItem(existingTask.id, itemId);
    }
  };

  // Save Task (for new task creation)
  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload: TaskFormData = {
        title: title.trim(),
        clientName: clientName.trim() || 'Internal',
        clientId: clientId || undefined,
        project: project.trim() || undefined,
        projectId: projectId || undefined,
        projectName: project.trim() || undefined,
        dueDate,
        priority,
        status,
        assignedTo: 'Me',
        description: description.trim(),
        checklist,
      };

      await addTask(payload);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  // Send comment
  const handleSendComment = async () => {
    if (!commentText.trim() || !existingTask) return;
    const textToSend = commentText;
    setCommentText('');
    await addComment(existingTask.id, textToSend);
  };

  // Options menu for existing task
  const handleMorePress = () => {
    if (!existingTask) return;
    Alert.alert('Task Options', existingTask.title, [
      {
        text: isDone ? 'Mark Incomplete' : 'Mark Done',
        onPress: () => toggleTaskComplete(existingTask.id),
      },
      {
        text: 'Delete Task',
        style: 'destructive',
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
      { text: 'Cancel', style: 'cancel' },
    ]);
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

          {isNew ? (
            <TouchableOpacity
              style={styles.saveHeaderBtn}
              onPress={handleSaveTask}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Save size={16} color={colors.white} />
                  <Text style={styles.saveHeaderBtnText}>Save Task</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <ThreeDotsMenu
              orientation="horizontal"
              iconSize={22}
              iconColor={colors.text}
              title="Task Options"
              buttonStyle={styles.moreButton}
              actions={[
                {
                  id: 'toggle',
                  title: isDone ? 'Mark Incomplete' : 'Mark Done',
                  image: isDone
                    ? Platform.select({ ios: 'circle', android: 'ic_menu_revert' })
                    : Platform.select({ ios: 'checkmark.circle', android: 'ic_menu_send' }),
                  onPress: () => existingTask && toggleTaskComplete(existingTask.id),
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
                          if (existingTask) {
                            await deleteTask(existingTask.id);
                            navigation.goBack();
                          }
                        },
                      },
                    ]);
                  },
                },
              ]}
            />
          )}
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
              onPress={() => {
                if (isNew) {
                  setStatus(status === 'Done' ? 'To Do' : 'Done');
                } else if (existingTask) {
                  toggleTaskComplete(existingTask.id);
                }
              }}
              activeOpacity={0.8}
            >
              {isDone && <Check size={18} color={colors.white} strokeWidth={3} />}
            </TouchableOpacity>

            <View style={styles.titleWrapper}>
              {isNew ? (
                <TextInput
                  style={styles.titleInput}
                  placeholder="Task title (e.g. Design Homepage)"
                  placeholderTextColor="#A8A29E"
                  value={title}
                  onChangeText={setTitle}
                  multiline
                  autoFocus
                />
              ) : (
                <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                  {existingTask?.title}
                </Text>
              )}

              {/* Subtitle / Client Name */}
              <TouchableOpacity
                onPress={handleClientPress}
                activeOpacity={0.7}
                style={styles.subtitleRow}
              >
                <Text style={styles.taskSubtitle}>
                  {(isNew ? clientName : existingTask?.clientName) ||
                    (isNew ? '+ Tap to select client' : 'General')}
                  {(isNew ? project : existingTask?.project)
                    ? ` • ${isNew ? project : existingTask?.project}`
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
                {formatDetailDueDate(isNew ? dueDate : existingTask?.dueDate)}
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

            {/* Assigned to Row */}
            {/* <View style={styles.attributeRow}>
              <View style={styles.attrLeft}>
                <User size={18} color="#6B7280" />
                <Text style={styles.attrLabel}>Assigned to</Text>
              </View>
              <View style={styles.assignedWrapper}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>M</Text>
                </View>
                <Text style={styles.attrValue}>Me</Text>
                <ChevronDown size={14} color="#6B7280" />
              </View>
            </View> */}

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
                {(isNew ? clientName : existingTask?.clientName) || 'Select Client'}
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
                  {(isNew ? project : existingTask?.projectName || existingTask?.project) || 'Select Project'}
                </Text>
                <ChevronDown size={14} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionHeader}>Description</Text>
            {isNew ? (
              <TextInput
                style={styles.descInput}
                placeholder="Add a description"
                placeholderTextColor="#A8A29E"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.descriptionText}>
                {existingTask?.description?.trim() || 'No description provided.'}
              </Text>
            )}
          </View>

          {/* Checklist Section */}
          <TaskChecklistSection
            items={isNew ? checklist : existingTask?.checklist || []}
            onToggleItem={handleToggleChecklist}
            onAddItem={handleAddChecklist}
            onDeleteItem={handleDeleteChecklist}
          />

          {/* Save Task Action Button at bottom for New Tasks */}
          {isNew && (
            <TouchableOpacity
              style={styles.bottomCreateBtn}
              onPress={handleSaveTask}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.bottomCreateBtnText}>Create Task</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Comments List for existing task */}
          {!isNew && existingTask?.comments && existingTask.comments.length > 0 && (
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

        {/* Bottom Floating Comment Bar (Only for existing task) */}
        {!isNew && (
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
        )}

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerOpen}
          mode="date"
          date={dayjs(isNew ? dueDate : existingTask?.dueDate).isValid() ? new Date(isNew ? dueDate : existingTask!.dueDate) : new Date()}
          onConfirm={(date) => {
            setIsDatePickerOpen(false);
            if (isNew) {
              setDueDate(date.toISOString());
            } else if (existingTask) {
              updateTask(existingTask.id, { dueDate: date.toISOString() });
            }
          }}
          onCancel={() => setIsDatePickerOpen(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

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
  saveHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveHeaderBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
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
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
    paddingVertical: 0,
    letterSpacing: -0.3,
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
    color: '#7E8B88',
    fontWeight: '500',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  attributesList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EBE5DC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBE5DC',
    paddingVertical: 8,
    marginBottom: 20,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  attrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attrRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attrLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  attrValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  projectInput: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    paddingVertical: 0,
    flex: 1,
    marginLeft: 20,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  assignedWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  descInput: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  bottomCreateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bottomCreateBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  commentsListSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  commentItem: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
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
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  commentIcon: {
    marginLeft: 2,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default TaskDetailScreen;
