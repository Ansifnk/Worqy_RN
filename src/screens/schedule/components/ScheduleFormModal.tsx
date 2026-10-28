import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import dayjs from 'dayjs';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  AlertCircle,
  Bell,
  Briefcase,
  Users,
  AlignLeft,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { BottomSheet } from '../../../components/BottomSheet';
import { TextInput } from '../../../components/TextInput';
import { SelectDropdown, SelectOption } from '../../../components/SelectDropdown';
import { Button } from '../../../components/Button';
import { ScheduleFormData, ScheduleItem, ScheduleType } from '../types';
import { useClient } from '../../../hooks/useClient';
import { useProject } from '../../../hooks/useProject';
import { formatDateToISOString } from './ScheduleDateStrip';

interface ScheduleFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => void;
  initialData?: ScheduleItem | null;
  defaultDate?: string; // ISO string
  defaultStartTime?: string;
}

const TYPE_OPTIONS: { label: string; value: ScheduleType; icon: any; color: string }[] = [
  { label: 'Meeting', value: 'Meeting', icon: Video, color: '#6C52EE' },
  { label: 'Task', value: 'Task', icon: FileText, color: '#2578C0' },
  { label: 'Deadline', value: 'Deadline', icon: AlertCircle, color: '#D97706' },
  { label: 'Reminder', value: 'Reminder', icon: Bell, color: '#1B8256' },
];

const COMMON_TIMES = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '05:30 PM',
];

const parseTimeStringToDate = (timeStr: string): Date => {
  const d = new Date();
  if (!timeStr) return d;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return d;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = (match[3] || 'AM').toUpperCase();
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
  defaultDate,
  defaultStartTime,
}) => {
  const isEditing = !!initialData;
  const { clients } = useClient();
  const { projects } = useProject();

  // DatePicker modal visibility states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const initialFormValues = useMemo<ScheduleFormData>(() => {
    const fallbackIso = formatDateToISOString();
    return {
      title: '',
      date: defaultDate || fallbackIso,
      startTime: defaultStartTime || '09:00 AM',
      endTime: '10:00 AM',
      type: 'Meeting',
      clientId: '',
      clientName: '',
      projectId: '',
      projectName: '',
      notes: '',
    };
  }, [defaultDate, defaultStartTime]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    defaultValues: initialFormValues,
  });

  const selectedType = watch('type');
  const selectedDate = watch('date');
  const selectedStartTime = watch('startTime');
  const selectedEndTime = watch('endTime');
  const selectedClientId = watch('clientId');
  const selectedProjectId = watch('projectId');

  // Populate form on open or when initialData changes
  useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          date: dayjs(initialData.date).isValid()
            ? dayjs(initialData.date).toISOString()
            : defaultDate || formatDateToISOString(),
          startTime: initialData.startTime || defaultStartTime || '09:00 AM',
          endTime: initialData.endTime || '10:00 AM',
          type: initialData.type || 'Meeting',
          clientId: initialData.clientId || '',
          clientName: initialData.clientName || '',
          projectId: initialData.projectId || '',
          projectName: initialData.projectName || '',
          notes: initialData.notes || '',
        });
      } else {
        reset({
          title: '',
          date: defaultDate || formatDateToISOString(),
          startTime: defaultStartTime || '09:00 AM',
          endTime: '10:00 AM',
          type: 'Meeting',
          clientId: '',
          clientName: '',
          projectId: '',
          projectName: '',
          notes: '',
        });
      }
    }
  }, [visible, initialData, defaultDate, defaultStartTime, reset]);

  // Build client options for dropdown
  const clientOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      {
        label: 'None / Internal Work',
        value: '',
        description: 'Not linked to any external client',
      },
    ];

    clients.forEach((c) => {
      const displayLabel = c.name + (c.companyName ? ` (${c.companyName})` : '');
      options.push({
        label: displayLabel,
        value: c.id,
        description: c.category || c.clientType,
      });
    });

    return options;
  }, [clients]);

  // Handle client selection and sync clientName
  const handleClientChange = (clientId: string) => {
    setValue('clientId', clientId, { shouldValidate: true });
    if (!clientId) {
      setValue('clientName', 'Internal Work', { shouldValidate: true });
    } else {
      const found = clients.find((c) => c.id === clientId);
      setValue('clientName', found?.companyName || found?.name || '', { shouldValidate: true });
    }
  };

  // Build project options for dropdown
  const projectOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      {
        label: 'None / No Project',
        value: '',
        description: 'Not linked to any project',
      },
    ];

    projects.forEach((p) => {
      options.push({
        label: p.name + (p.clientName ? ` (${p.clientName})` : ''),
        value: p.id,
        description: p.status,
      });
    });

    return options;
  }, [projects]);

  const handleProjectChange = (val: string) => {
    setValue('projectId', val, { shouldValidate: true });
    if (!val) {
      setValue('projectName', '', { shouldValidate: true });
    } else {
      const p = projects.find((item) => item.id === val);
      setValue('projectName', p?.name || '', { shouldValidate: true });
      if (p?.clientId && !selectedClientId) {
        setValue('clientId', p.clientId, { shouldValidate: true });
        setValue('clientName', p.clientName || '', { shouldValidate: true });
      }
    }
  };

  const handleFormSubmit = (data: ScheduleFormData) => {
    // Ensure date is strictly formatted as an ISO string
    const isoDate = dayjs(data.date).toISOString();
    const cleanedData: ScheduleFormData = {
      ...data,
      date: isoDate,
      clientName: data.clientName?.trim() || (data.clientId ? '' : 'Internal Work'),
    };
    onSubmit(cleanedData);
    onClose();
  };

  // Quick date presets
  const setQuickDate = (offsetDays: number) => {
    const d = dayjs().add(offsetDays, 'day').toISOString();
    setValue('date', d, { shouldValidate: true });
  };

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');
  const isTomorrow = dayjs(selectedDate).isSame(dayjs().add(1, 'day'), 'day');

  // Convert form strings to Date objects for native pickers
  const pickerDateValue = useMemo(() => {
    return dayjs(selectedDate).isValid() ? dayjs(selectedDate).toDate() : new Date();
  }, [selectedDate]);

  const pickerStartTimeValue = useMemo(() => {
    return parseTimeStringToDate(selectedStartTime);
  }, [selectedStartTime]);

  const pickerEndTimeValue = useMemo(() => {
    return parseTimeStringToDate(selectedEndTime);
  }, [selectedEndTime]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Schedule' : 'New Schedule'}
      subtitle={isEditing ? 'Update event details' : 'Plan your meetings and activities'}
      maxHeightRatio={0.92}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. Schedule Title */}
        <Controller
          control={control}
          name="title"
          rules={{
            required: 'Title is required',
            minLength: { value: 2, message: 'Title must be at least 2 characters' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Title"
              placeholder="e.g. Project Planning, Client Meeting, Review"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
              autoCapitalize="sentences"
              leftIcon={<Briefcase size={18} color={colors.textSecondary} />}
            />
          )}
        />

        {/* 2. Type Selector Pills */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Type</Text>
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((opt) => {
              const isSelected = selectedType === opt.value;
              const IconComponent = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.typeChip,
                    isSelected && styles.typeChipActive,
                  ]}
                  onPress={() => setValue('type', opt.value, { shouldValidate: true })}
                  activeOpacity={0.7}
                >
                  <IconComponent
                    size={16}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      isSelected && styles.typeTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Date Selection with DatePicker library */}
        <View style={styles.section}>
          <View style={styles.dateHeaderRow}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.quickDateRow}>
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  isToday && styles.quickDateBtnActive,
                ]}
                onPress={() => setQuickDate(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    isToday && styles.quickDateTextActive,
                  ]}
                >
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.quickDateBtn,
                  isTomorrow && styles.quickDateBtnActive,
                ]}
                onPress={() => setQuickDate(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.quickDateText,
                    isTomorrow && styles.quickDateTextActive,
                  ]}
                >
                  Tomorrow
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Interactive Date Picker Trigger Card */}
          <TouchableOpacity
            style={styles.pickerCard}
            onPress={() => setIsDatePickerOpen(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Pick date"
          >
            <View style={styles.pickerCardLeft}>
              <View style={styles.pickerIconWrapper}>
                <Calendar size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.pickerPrimaryText}>
                  {dayjs(selectedDate).format('dddd, D MMMM YYYY')}
                </Text>
                <Text style={styles.pickerSecondaryText}>Tap to change date</Text>
              </View>
            </View>
            <Text style={styles.pickerActionText}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Start Time & End Time with Time Pickers */}
        <View style={styles.timeRowContainer}>
          {/* Start Time */}
          <View style={styles.timeInputCol}>
            <Text style={styles.sectionLabel}>Start Time</Text>
            <TouchableOpacity
              style={styles.timePickerCard}
              onPress={() => setIsStartTimePickerOpen(true)}
              activeOpacity={0.7}
            >
              <Clock size={16} color={colors.primary} />
              <Text style={styles.timeValueText}>{selectedStartTime || '09:00 AM'}</Text>
            </TouchableOpacity>
          </View>

          {/* End Time */}
          <View style={styles.timeInputCol}>
            <Text style={styles.sectionLabel}>End Time</Text>
            <TouchableOpacity
              style={styles.timePickerCard}
              onPress={() => setIsEndTimePickerOpen(true)}
              activeOpacity={0.7}
            >
              <Clock size={16} color={colors.primary} />
              <Text style={styles.timeValueText}>{selectedEndTime || '10:00 AM'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Start Time Presets */}
        <View style={styles.quickTimeContainer}>
          <Text style={styles.quickTimeLabel}>Quick Start Times:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickTimeChips}>
              {COMMON_TIMES.map((time) => {
                const isActive = selectedStartTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.quickTimeChip,
                      isActive && styles.quickTimeChipActive,
                    ]}
                    onPress={() => setValue('startTime', time, { shouldValidate: true })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickTimeChipText,
                        isActive && styles.quickTimeChipTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* 5. Client Dropdown */}
        <View style={styles.section}>
          <SelectDropdown
            label="Client (Optional)"
            placeholder="Link to an existing client"
            options={clientOptions}
            value={selectedClientId}
            onChange={handleClientChange}
            leftIcon={<Users size={18} color={colors.textSecondary} />}
            sheetTitle="Select Associated Client"
          />
        </View>

        {/* 5b. Project Dropdown */}
        <View style={styles.section}>
          <SelectDropdown
            label="Associated Project (Optional)"
            placeholder="Link to an existing project"
            options={projectOptions}
            value={selectedProjectId}
            onChange={handleProjectChange}
            leftIcon={<Briefcase size={18} color={colors.textSecondary} />}
            sheetTitle="Select Associated Project"
          />
        </View>

        {/* 6. Notes / Description */}
        <View style={styles.section}>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Notes / Description (Optional)"
                placeholder="Meeting agenda, location, project details..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                containerStyle={styles.notesInput}
                leftIcon={<AlignLeft size={18} color={colors.textSecondary} />}
              />
            )}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={onClose}
            style={styles.actionBtn}
          />
          <Button
            title={isEditing ? 'Save Changes' : 'Create Schedule'}
            variant="primary"
            onPress={() => handleSubmit(handleFormSubmit)()}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>

      {/* DatePicker Modal Component for Date */}
      <DateTimePickerModal
        isVisible={isDatePickerOpen}
        date={pickerDateValue}
        mode="date"
        onConfirm={(pickedDate) => {
          setIsDatePickerOpen(false);
          setValue('date', dayjs(pickedDate).toISOString(), { shouldValidate: true });
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />

      {/* DatePicker Modal Component for Start Time */}
      <DateTimePickerModal
        isVisible={isStartTimePickerOpen}
        date={pickerStartTimeValue}
        mode="time"
        onConfirm={(pickedTime) => {
          setIsStartTimePickerOpen(false);
          setValue('startTime', dayjs(pickedTime).format('hh:mm A'), {
            shouldValidate: true,
          });
        }}
        onCancel={() => {
          setIsStartTimePickerOpen(false);
        }}
      />

      {/* DatePicker Modal Component for End Time */}
      <DateTimePickerModal
        isVisible={isEndTimePickerOpen}
        date={pickerEndTimeValue}
        mode="time"
        onConfirm={(pickedTime) => {
          setIsEndTimePickerOpen(false);
          setValue('endTime', dayjs(pickedTime).format('hh:mm A'), {
            shouldValidate: true,
          });
        }}
        onCancel={() => {
          setIsEndTimePickerOpen(false);
        }}
      />
    </BottomSheet>
  );
};

export default ScheduleFormModal;

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EAF4F2',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  typeTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickDateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  quickDateBtnActive: {
    backgroundColor: colors.primary,
  },
  quickDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickDateTextActive: {
    color: colors.white,
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EAF4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pickerSecondaryText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pickerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  timeRowContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timeInputCol: {
    flex: 1,
  },
  timePickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  timeValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  quickTimeContainer: {
    marginBottom: 16,
  },
  quickTimeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  quickTimeChips: {
    flexDirection: 'row',
    gap: 8,
  },
  quickTimeChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
  },
  quickTimeChipActive: {
    backgroundColor: colors.primary,
  },
  quickTimeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickTimeChipTextActive: {
    color: colors.white,
  },
  notesInput: {
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
  },
});
