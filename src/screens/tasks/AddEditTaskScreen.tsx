import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  ArrowLeft,
  Check,
  CheckSquare,
  AlignLeft,
  Calendar,
  Flag,
  Users,
  Briefcase,
  Clock,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { TextInput } from '../../components/TextInput';
import { SelectDropdown, SelectOption } from '../../components/SelectDropdown';
import { Button } from '../../components/Button';
import { TaskFormData, TaskPriority, TaskStatus, ChecklistItem, TaskItem } from './types';
import { useTask } from '../../hooks/useTask';
import { useClient } from '../../hooks/useClient';
import { useProject } from '../../hooks/useProject';
import TaskChecklistSection from './components/TaskChecklistSection';

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string; bg: string; border: string }[] = [
  { value: 'High', label: 'High Priority', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
  { value: 'Medium', label: 'Medium Priority', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  { value: 'Low', label: 'Low Priority', color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; bg: string; border: string }[] = [
  { value: 'To Do', label: 'To Do', color: '#475569', bg: '#F1F5F9', border: '#CBD5E1' },
  { value: 'In Progress', label: 'In Progress', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  { value: 'Done', label: 'Done', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
];

const DEFAULT_FORM_VALUES: TaskFormData = {
  title: '',
  description: '',
  dueDate: new Date().toISOString(),
  priority: 'Medium',
  status: 'To Do',
  clientId: '',
  clientName: '',
  projectId: '',
  projectName: '',
  project: '',
  assignedTo: 'Me',
  checklist: [],
};

export const AddEditTaskScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    taskId,
    isEdit,
    initialData,
    prefillProject,
    prefillProjectId,
    prefillClientName,
    prefillClientId,
  } = route.params || {};

  const { tasks, addTask, updateTask } = useTask();
  const { clients } = useClient();
  const { projects } = useProject();

  const [saving, setSaving] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Match existing task if editing
  const existingTask = useMemo<TaskItem | null>(() => {
    if (initialData) return initialData;
    if (taskId) return tasks.find((t) => t.id === taskId) || null;
    return null;
  }, [initialData, taskId, tasks]);

  const isEditingMode = Boolean(isEdit || existingTask);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      project: prefillProject || '',
      projectName: prefillProject || '',
      projectId: prefillProjectId || '',
      clientName: prefillClientName || '',
      clientId: prefillClientId || '',
    },
  });

  const selectedPriority = watch('priority');
  const selectedStatus = watch('status');
  const selectedDueDate = watch('dueDate');
  const selectedProjectId = watch('projectId');
  const selectedClientId = watch('clientId');
  const rawChecklist = watch('checklist');
  const currentChecklist = useMemo(() => rawChecklist || [], [rawChecklist]);

  // Populate data when editing
  useEffect(() => {
    if (existingTask) {
      reset({
        title: existingTask.title || '',
        description: existingTask.description || '',
        dueDate: existingTask.dueDate || new Date().toISOString(),
        priority: existingTask.priority || 'Medium',
        status: existingTask.status || 'To Do',
        clientId: existingTask.clientId || '',
        clientName: existingTask.clientName || '',
        projectId: existingTask.projectId || '',
        projectName: existingTask.projectName || existingTask.project || '',
        project: existingTask.projectName || existingTask.project || '',
        assignedTo: existingTask.assignedTo || 'Me',
        checklist: existingTask.checklist || [],
      });
    } else {
      reset({
        ...DEFAULT_FORM_VALUES,
        dueDate: new Date().toISOString(),
        project: prefillProject || '',
        projectName: prefillProject || '',
        projectId: prefillProjectId || '',
        clientName: prefillClientName || '',
        clientId: prefillClientId || '',
        checklist: [],
      });
    }
  }, [existingTask, reset, prefillProject, prefillProjectId, prefillClientName, prefillClientId]);

  // Project options for dropdown
  const projectOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      { label: 'None (No Project)', value: '', description: 'Stand-alone task' },
    ];
    projects.forEach((p) => {
      list.push({
        label: p.name,
        value: p.id,
        description: p.clientName ? `Client: ${p.clientName}` : undefined,
      });
    });
    return list;
  }, [projects]);

  // Client options for dropdown
  const clientOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      { label: 'Internal / None', value: '', description: 'No specific client linked' },
    ];
    clients.forEach((c) => {
      list.push({
        label: c.companyName || c.name,
        value: c.id,
        description: c.email || (c.companyName && c.name ? c.name : undefined),
      });
    });
    return list;
  }, [clients]);

  // Handle Project selection (auto-link client if project has one)
  const handleProjectChange = useCallback(
    (projId: string) => {
      setValue('projectId', projId, { shouldValidate: true });
      if (!projId) {
        setValue('projectName', '', { shouldValidate: true });
        setValue('project', '', { shouldValidate: true });
      } else {
        const found = projects.find((p) => p.id === projId);
        if (found) {
          setValue('projectName', found.name, { shouldValidate: true });
          setValue('project', found.name, { shouldValidate: true });

          // Auto-sync client if user hasn't chosen one
          if (found.clientId && !selectedClientId) {
            setValue('clientId', found.clientId, { shouldValidate: true });
            setValue('clientName', found.clientName || '', { shouldValidate: true });
          }
        }
      }
    },
    [projects, selectedClientId, setValue]
  );

  // Handle Client selection
  const handleClientChange = useCallback(
    (cId: string) => {
      setValue('clientId', cId, { shouldValidate: true });
      if (!cId) {
        setValue('clientName', '', { shouldValidate: true });
      } else {
        const found = clients.find((c) => c.id === cId);
        setValue('clientName', found ? found.companyName || found.name : '', { shouldValidate: true });
      }
    },
    [clients, setValue]
  );

  // Checklist handlers
  const handleToggleChecklist = useCallback(
    (itemId: string) => {
      const updated = currentChecklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setValue('checklist', updated, { shouldValidate: true });
    },
    [currentChecklist, setValue]
  );

  const handleAddChecklist = useCallback(
    (itemTitle: string) => {
      const newItem: ChecklistItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: itemTitle.trim(),
        completed: false,
      };
      setValue('checklist', [...currentChecklist, newItem], { shouldValidate: true });
    },
    [currentChecklist, setValue]
  );

  const handleDeleteChecklist = useCallback(
    (itemId: string) => {
      const updated = currentChecklist.filter((item) => item.id !== itemId);
      setValue('checklist', updated, { shouldValidate: true });
    },
    [currentChecklist, setValue]
  );

  // Quick date chips
  const handleSetQuickDate = useCallback(
    (daysToAdd: number) => {
      const targetDate = dayjs().add(daysToAdd, 'day').hour(18).minute(0).second(0).millisecond(0);
      setValue('dueDate', targetDate.toISOString(), { shouldValidate: true });
    },
    [setValue]
  );

  // Format Due Date for display
  const formattedDueDate = useMemo(() => {
    if (!selectedDueDate) return 'Select date';
    const d = dayjs(selectedDueDate);
    const today = dayjs();
    if (d.isSame(today, 'day')) return 'Today, ' + d.format('D MMM YYYY');
    if (d.isSame(today.add(1, 'day'), 'day')) return 'Tomorrow, ' + d.format('D MMM YYYY');
    return d.format('ddd, D MMM YYYY');
  }, [selectedDueDate]);

  // Form Submit Handler
  const handleFormSubmit = async (data: TaskFormData) => {
    if (!data.title?.trim()) {
      Alert.alert('Validation Error', 'Task title cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      const payload: TaskFormData = {
        title: data.title.trim(),
        description: data.description?.trim() || '',
        dueDate: data.dueDate || new Date().toISOString(),
        priority: data.priority || 'Medium',
        status: data.status || 'To Do',
        clientId: data.clientId || undefined,
        clientName: data.clientName?.trim() || 'Internal',
        projectId: data.projectId || undefined,
        projectName: data.projectName?.trim() || undefined,
        project: data.projectName?.trim() || undefined,
        assignedTo: 'Me',
        checklist: data.checklist || [],
      };

      if (isEditingMode && existingTask) {
        await updateTask(existingTask.id, payload);
        Alert.alert('Success', 'Task updated successfully');
      } else {
        await addTask(payload);
        Alert.alert('Success', 'Task created successfully');
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* Top Header Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navBackButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>
            {isEditingMode ? 'Edit Task' : 'New Task'}
          </Text>

          <TouchableOpacity
            style={[styles.saveTopBtn, saving && styles.saveDisabled]}
            onPress={() => handleSubmit(handleFormSubmit)()}
            disabled={saving}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save task"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
            )}
          </TouchableOpacity>
        </View>

        {/* Scrollable Form Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 28, 48) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Task Title */}
          <Controller
            control={control}
            name="title"
            rules={{
              required: 'Task title is required',
              minLength: { value: 2, message: 'Title must be at least 2 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Task Title *"
                placeholder="e.g. Design Landing Page, Review Wireframes"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                leftIcon={<CheckSquare size={18} color={colors.textSecondary} />}
                autoFocus={!isEditingMode}
                containerStyle={styles.fieldSpacing}
              />
            )}
          />

          {/* Task Description */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Description & Notes"
                placeholder="Add context, acceptance criteria, or external links..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={4}
                leftIcon={<AlignLeft size={18} color={colors.textSecondary} />}
                containerStyle={styles.fieldSpacing}
              />
            )}
          />

          {/* Priority 1-Tap Pills */}
          <View style={styles.pillGroupWrapper}>
            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.pillRow}>
              {PRIORITY_OPTIONS.map((item) => {
                const isSelected = selectedPriority === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.priorityPill,
                      { borderColor: item.border },
                      isSelected && [styles.pillSelected, { backgroundColor: item.bg }],
                    ]}
                    onPress={() => setValue('priority', item.value, { shouldValidate: true })}
                    activeOpacity={0.8}
                  >
                    <Flag
                      size={14}
                      color={isSelected ? item.color : '#64748B'}
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    <Text
                      style={[
                        styles.priorityPillText,
                        isSelected && [styles.pillTextSelected, { color: item.color }],
                      ]}
                    >
                      {item.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Status 1-Tap Pills */}
          <View style={styles.pillGroupWrapper}>
            <Text style={styles.inputLabel}>Task Status</Text>
            <View style={styles.pillRow}>
              {STATUS_OPTIONS.map((item) => {
                const isSelected = selectedStatus === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.statusPill,
                      { borderColor: item.border },
                      isSelected && [styles.pillSelected, { backgroundColor: item.bg }],
                    ]}
                    onPress={() => setValue('status', item.value, { shouldValidate: true })}
                    activeOpacity={0.8}
                  >
                    {item.value === 'Done' ? (
                      <Check
                        size={14}
                        color={isSelected ? item.color : '#64748B'}
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Clock
                        size={14}
                        color={isSelected ? item.color : '#64748B'}
                        strokeWidth={2}
                      />
                    )}
                    <Text
                      style={[
                        styles.statusPillText,
                        isSelected && [styles.pillTextSelected, { color: item.color }],
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Due Date & Timeline */}
          <View style={styles.dateGroupWrapper}>
            <Text style={styles.inputLabel}>Due Date</Text>
            <TouchableOpacity
              style={styles.datePickerTrigger}
              onPress={() => setIsDatePickerOpen(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dateTriggerLeft}>
                <View style={styles.dateIconBox}>
                  <Calendar size={18} color={colors.primary} />
                </View>
                <Text style={styles.dateValueBig}>{formattedDueDate}</Text>
              </View>
              <View style={styles.changeDateBadge}>
                <Text style={styles.changeDateText}>Change</Text>
              </View>
            </TouchableOpacity>

            {/* Quick Date Chips */}
            <View style={styles.quickChipsRow}>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleSetQuickDate(0)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleSetQuickDate(1)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleSetQuickDate(3)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>In 3 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => handleSetQuickDate(7)}
                activeOpacity={0.8}
              >
                <Text style={styles.quickChipText}>Next Week</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Project Selector */}
          <SelectDropdown
            label="Associated Project"
            placeholder="Select project..."
            options={projectOptions}
            value={selectedProjectId || ''}
            onChange={handleProjectChange}
            leftIcon={<Briefcase size={18} color={colors.textSecondary} />}
            sheetTitle="Select Project"
            containerStyle={styles.fieldSpacing}
          />

          {/* Client Selector */}
          <SelectDropdown
            label="Associated Client"
            placeholder="Select client..."
            options={clientOptions}
            value={selectedClientId || ''}
            onChange={handleClientChange}
            leftIcon={<Users size={18} color={colors.textSecondary} />}
            sheetTitle="Select Client"
            containerStyle={styles.fieldSpacing}
          />

          {/* Checklist & Subtasks */}
          <View style={styles.checklistWrapper}>
            <TaskChecklistSection
              items={currentChecklist}
              onToggleItem={handleToggleChecklist}
              onAddItem={handleAddChecklist}
              onDeleteItem={handleDeleteChecklist}
            />
          </View>

          {/* Bottom Action Buttons */}
          <View style={styles.bottomActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.actionBtn}
            />
            <Button
              title={isEditingMode ? 'Save Changes' : 'Create Task'}
              variant="primary"
              onPress={() => handleSubmit(handleFormSubmit)()}
              loading={saving}
              disabled={saving}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerOpen}
          mode="date"
          date={
            selectedDueDate && dayjs(selectedDueDate).isValid()
              ? new Date(selectedDueDate)
              : new Date()
          }
          onConfirm={(date) => {
            setIsDatePickerOpen(false);
            setValue('dueDate', date.toISOString(), { shouldValidate: true });
          }}
          onCancel={() => setIsDatePickerOpen(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddEditTaskScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  navBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveDisabled: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  fieldSpacing: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  pillGroupWrapper: {
    marginBottom: 18,
  },
  dateGroupWrapper: {
    marginBottom: 18,
  },
  checklistWrapper: {
    marginBottom: 18,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  priorityPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  pillSelected: {
    borderWidth: 1.8,
  },
  pillTextSelected: {
    fontWeight: '700',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  dateTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValueBig: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  changeDateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  changeDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
  },
});
