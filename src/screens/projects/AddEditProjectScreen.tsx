import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  Users,
  Calendar,
  IndianRupee,
  AlignLeft,
  Activity,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { TextInput } from '../../components/TextInput';
import { SelectDropdown, SelectOption } from '../../components/SelectDropdown';
import { Button } from '../../components/Button';
import { ProjectFormData, ProjectItem, ProjectStatus } from './types';
import { useProject } from '../../hooks/useProject';
import { useClient } from '../../hooks/useClient';

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'In Progress', value: 'In Progress', badgeColor: '#2563EB', description: 'Active work in progress' },
  { label: 'Planning', value: 'Planning', badgeColor: '#7C3AED', description: 'Scoping, design, or roadmap' },
  { label: 'On Hold', value: 'On Hold', badgeColor: '#D97706', description: 'Paused temporarily' },
  { label: 'Completed', value: 'Completed', badgeColor: '#16A34A', description: 'Finished and delivered' },
  { label: 'Cancelled', value: 'Cancelled', badgeColor: '#DC2626', description: 'Cancelled or abandoned' },
];

const DEFAULT_PROJECT_FORM_VALUES: ProjectFormData = {
  name: '',
  description: '',
  clientId: '',
  clientName: '',
  status: 'In Progress',
  startDate: '',
  endDate: '',
  budget: undefined,
  color: '#176B67',
};

export const AddEditProjectScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { projectId, isEdit, initialData } = route.params || {};

  const { projects, addProject, updateProject } = useProject();
  const { clients } = useClient();

  const [saving, setSaving] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);

  // Match existing project if editing by projectId
  const existingProject = useMemo<ProjectItem | null>(() => {
    if (initialData) return initialData;
    if (projectId) return projects.find((p) => p.id === projectId) || null;
    return null;
  }, [initialData, projectId, projects]);

  const isEditingMode = isEdit || !!existingProject;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      ...DEFAULT_PROJECT_FORM_VALUES,
      startDate: dayjs().format('YYYY-MM-DD'),
    },
  });

  const selectedClientId = watch('clientId');
  const selectedStatus = watch('status');
  const selectedStartDate = watch('startDate');
  const selectedEndDate = watch('endDate');

  // Populate data when editing
  useEffect(() => {
    if (existingProject) {
      reset({
        name: existingProject.name || '',
        description: existingProject.description || '',
        clientId: existingProject.clientId || '',
        clientName: existingProject.clientName || '',
        status: existingProject.status || 'In Progress',
        startDate: existingProject.startDate ? dayjs(existingProject.startDate).format('YYYY-MM-DD') : '',
        endDate: existingProject.endDate ? dayjs(existingProject.endDate).format('YYYY-MM-DD') : '',
        budget: existingProject.budget !== undefined ? existingProject.budget : undefined,
        color: existingProject.color || '#176B67',
      });
    } else {
      reset({
        ...DEFAULT_PROJECT_FORM_VALUES,
        startDate: dayjs().format('YYYY-MM-DD'),
      });
    }
  }, [existingProject, reset]);

  // Client options for dropdown
  const clientOptions: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [
      { label: 'None (Internal / General)', value: '', description: 'No specific client linked' },
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

  const handleClientChange = (val: string) => {
    setValue('clientId', val, { shouldValidate: true });
    if (!val) {
      setValue('clientName', '', { shouldValidate: true });
    } else {
      const found = clients.find((c) => c.id === val);
      setValue('clientName', found ? found.companyName || found.name : '', { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      setSaving(true);
      const payload: ProjectFormData = {
        ...data,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        clientId: data.clientId || undefined,
        clientName: data.clientName?.trim() || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        budget: data.budget ? Number(data.budget) : undefined,
      };

      if (isEditingMode && existingProject) {
        await updateProject(existingProject.id, payload);
        Alert.alert('Success', 'Project updated successfully');
      } else {
        await addProject(payload);
        Alert.alert('Success', 'Project created successfully');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save project');
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

        {/* Top Header */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>
            {isEditingMode ? 'Edit Project' : 'New Project'}
          </Text>

          <TouchableOpacity
            style={[styles.saveTopBtn, saving && styles.saveDisabled]}
            onPress={() => handleSubmit(handleFormSubmit)()}
            disabled={saving}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save project"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
            )}
          </TouchableOpacity>
        </View>

        {/* Form Body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card 1: Project Scope */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Project Details</Text>

            {/* Project Name */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Project name is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Project Name *"
                    placeholder="e.g. Website Redesign, Mobile App v2"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                    leftIcon={<Briefcase size={18} color={colors.textSecondary} />}
                  />
                )}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Description & Scope"
                    placeholder="Key deliverables, goals, milestones..."
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    leftIcon={<AlignLeft size={18} color={colors.textSecondary} />}
                  />
                )}
              />
            </View>
          </View>

          {/* Card 2: Association & Status */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Association & Status</Text>

            {/* Client Selector (Optional) */}
            <View style={styles.inputGroup}>
              <SelectDropdown
                label="Associated Client (Optional)"
                placeholder="Select Client..."
                options={clientOptions}
                value={selectedClientId || ''}
                onChange={handleClientChange}
                leftIcon={<Users size={18} color={colors.textSecondary} />}
                sheetTitle="Select Project Client"
              />
            </View>

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <SelectDropdown
                label="Project Status"
                placeholder="Select Status..."
                options={STATUS_OPTIONS}
                value={selectedStatus}
                onChange={(val) => setValue('status', val as ProjectStatus, { shouldValidate: true })}
                leftIcon={<Activity size={18} color={colors.textSecondary} />}
                sheetTitle="Select Project Status"
              />
            </View>
          </View>

          {/* Card 3: Timeline & Budget */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Timeline & Budget</Text>

            {/* Date Row: Start Date & End Date */}
            <View style={styles.dateRow}>
              {/* Start Date */}
              <View style={styles.dateCol}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setIsStartDatePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={colors.primary} />
                  <Text style={styles.dateText}>
                    {selectedStartDate ? dayjs(selectedStartDate).format('DD MMM YYYY') : 'Set Start'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.dateCol}>
                <Text style={styles.label}>Target End Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setIsEndDatePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={colors.primary} />
                  <Text style={styles.dateText}>
                    {selectedEndDate ? dayjs(selectedEndDate).format('DD MMM YYYY') : 'Set End'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Budget in INR */}
            <View style={styles.inputGroup}>
              <Controller
                control={control}
                name="budget"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Budget (₹ INR)"
                    placeholder="e.g. 50000"
                    keyboardType="numeric"
                    value={value !== undefined && value !== null ? String(value) : ''}
                    onChangeText={(val) => {
                      const cleaned = val.replace(/[^0-9]/g, '');
                      onChange(cleaned ? Number(cleaned) : undefined);
                    }}
                    onBlur={onBlur}
                    leftIcon={<IndianRupee size={18} color={colors.textSecondary} />}
                  />
                )}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.bottomActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.actionBtn}
            />
            <Button
              title={isEditingMode ? 'Save Changes' : 'Create Project'}
              variant="primary"
              onPress={() => handleSubmit(handleFormSubmit)()}
              loading={saving}
              disabled={saving}
              style={styles.actionBtn}
            />
          </View>
        </ScrollView>

        {/* Date Pickers */}
        <DateTimePickerModal
          isVisible={isStartDatePickerOpen}
          mode="date"
          date={selectedStartDate ? new Date(selectedStartDate) : new Date()}
          onConfirm={(date) => {
            setIsStartDatePickerOpen(false);
            setValue('startDate', dayjs(date).format('YYYY-MM-DD'), { shouldValidate: true });
          }}
          onCancel={() => setIsStartDatePickerOpen(false)}
        />

        <DateTimePickerModal
          isVisible={isEndDatePickerOpen}
          mode="date"
          date={selectedEndDate ? new Date(selectedEndDate) : new Date()}
          onConfirm={(date) => {
            setIsEndDatePickerOpen(false);
            setValue('endDate', dayjs(date).format('YYYY-MM-DD'), { shouldValidate: true });
          }}
          onCancel={() => setIsEndDatePickerOpen(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddEditProjectScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  navButton: {
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
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dateCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
