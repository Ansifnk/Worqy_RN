import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Contact,
  FileText,
  Tag,
  Share2,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { BottomSheet } from '../../../components/BottomSheet';
import { TextInput } from '../../../components/TextInput';
import { SelectDropdown, SelectOption } from '../../../components/SelectDropdown';
import { Button } from '../../../components/Button';
import ClientAvatarPicker from './ClientAvatarPicker';
import { ClientFormData } from '../types';

interface ClientFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: ClientFormData | null;
}

const DEFAULT_FORM_VALUES: ClientFormData = {
  clientType: 'Company',
  name: '',
  companyName: '',
  profilePic: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  contactPerson: '',
  notes: '',
  tags: [],
  status: 'Active',
  clientSource: 'Referral',
};

const STATUS_OPTIONS: SelectOption[] = [
  { label: 'Active', value: 'Active', badgeColor: '#24865B', description: 'Currently active client' },
  { label: 'Lead', value: 'Lead', badgeColor: '#5275C5', description: 'Prospective client in pipeline' },
  { label: 'Inactive', value: 'Inactive', badgeColor: '#8A847E', description: 'Dormant or paused' },
  { label: 'On Hold', value: 'On Hold', badgeColor: '#E9A23B', description: 'Temporarily on hold' },
  { label: 'Completed', value: 'Completed', badgeColor: '#70B7A8', description: 'Project concluded' },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { label: 'Referral', value: 'Referral' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Website', value: 'Website' },
  { label: 'Direct Outreach', value: 'Direct Outreach' },
  { label: 'Upwork / Freelance', value: 'Upwork' },
  { label: 'Event / Conference', value: 'Conference' },
  { label: 'Other', value: 'Other' },
];

const PREDEFINED_TAGS = ['VIP', 'Long-term', 'High Priority', 'Enterprise', 'New Lead'];

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData;
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const selectedClientType = watch('clientType');
  const selectedTags = watch('tags') || [];

  // Re-populate when modal opens or initialData changes
  useEffect(() => {
    if (visible) {
      if (initialData) {
        reset({
          ...DEFAULT_FORM_VALUES,
          ...initialData,
        });
        // Auto-expand optional fields if editing and contains extra data
        if (
          initialData.website ||
          initialData.address ||
          initialData.contactPerson ||
          initialData.notes ||
          (initialData.tags && initialData.tags.length > 0)
        ) {
          setShowOptionalFields(true);
        }
      } else {
        reset(DEFAULT_FORM_VALUES);
        setShowOptionalFields(false);
      }
    }
  }, [visible, initialData, reset]);

  const toggleTag = (tag: string) => {
    const current = selectedTags || [];
    if (current.includes(tag)) {
      setValue(
        'tags',
        current.filter((t) => t !== tag),
        { shouldDirty: true }
      );
    } else {
      setValue('tags', [...current, tag], { shouldDirty: true });
    }
  };

  const handleFormSubmit = (data: ClientFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'Add New Client'}
      subtitle={isEditing ? 'Update client details' : 'Enter client information below'}
      maxHeightRatio={0.92}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Client Type Toggle (Individual / Company) */}
        <View style={styles.clientTypeContainer}>
          <Text style={styles.sectionLabel}>Client Type</Text>
          <Controller
            control={control}
            name="clientType"
            render={({ field: { value, onChange } }) => (
              <View style={styles.typeSegment}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    value === 'Company' && styles.segmentButtonActive,
                  ]}
                  onPress={() => onChange('Company')}
                  activeOpacity={0.8}
                >
                  <Building2
                    size={16}
                    color={value === 'Company' ? colors.primary : colors.textSecondary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      value === 'Company' && styles.segmentTextActive,
                    ]}
                  >
                    Company
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    value === 'Individual' && styles.segmentButtonActive,
                  ]}
                  onPress={() => onChange('Individual')}
                  activeOpacity={0.8}
                >
                  <User
                    size={16}
                    color={value === 'Individual' ? colors.primary : colors.textSecondary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      value === 'Individual' && styles.segmentTextActive,
                    ]}
                  >
                    Individual
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* 2. Dummy Profile Photo / Logo Picker */}
        <Controller
          control={control}
          name="profilePic"
          render={({ field: { value, onChange } }) => (
            <ClientAvatarPicker
              clientType={selectedClientType}
              value={value}
              onChange={onChange}
            />
          )}
        />

        {/* 3. Essential Fields */}
        <View style={styles.section}>
          <Text style={styles.groupHeader}>Essential Details</Text>

          {/* Name * (Required) */}
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={selectedClientType === 'Company' ? 'Client / Brand Name *' : 'Full Name *'}
                placeholder={
                  selectedClientType === 'Company' ? 'e.g. Acme Innovations' : 'e.g. Jane Doe'
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon={
                  selectedClientType === 'Company' ? (
                    <Building2 size={18} color={colors.textSecondary} />
                  ) : (
                    <User size={18} color={colors.textSecondary} />
                  )
                }
                autoCapitalize="words"
              />
            )}
          />

          {/* Company Name (Optional) */}
          <Controller
            control={control}
            name="companyName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Company Name"
                placeholder="e.g. Acme Corp LLC"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon={<Building2 size={18} color={colors.textSecondary} />}
                autoCapitalize="words"
              />
            )}
          />

          {/* Phone Number (Optional) */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={colors.textSecondary} />}
              />
            )}
          />

          {/* Email Address (Optional) */}
          <Controller
            control={control}
            name="email"
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email Address"
                placeholder="client@company.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
              />
            )}
          />

          {/* Status Dropdown */}
          <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
              <SelectDropdown
                label="Status"
                options={STATUS_OPTIONS}
                value={value}
                onChange={onChange}
                sheetTitle="Select Client Status"
              />
            )}
          />

          {/* Client Source Dropdown */}
          <Controller
            control={control}
            name="clientSource"
            render={({ field: { value, onChange } }) => (
              <SelectDropdown
                label="Client Source"
                placeholder="Select Source"
                options={SOURCE_OPTIONS}
                value={value}
                onChange={onChange}
                leftIcon={<Share2 size={18} color={colors.textSecondary} />}
                sheetTitle="How did this client find you?"
              />
            )}
          />
        </View>

        {/* 4. Tags Section */}
        <View style={styles.section}>
          <View style={styles.tagsHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Tag size={16} color={colors.primary} />
              <Text style={styles.tagsTitle}>Tags</Text>
            </View>
            <Text style={styles.tagsHint}>Tap to add/remove</Text>
          </View>

          <View style={styles.tagsList}>
            {PREDEFINED_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, isActive && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                    {isActive ? `✓ ${tag}` : tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Optional Fields Collapsible / Toggle */}
        <TouchableOpacity
          style={styles.expandOptionalButton}
          onPress={() => setShowOptionalFields(!showOptionalFields)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandOptionalText}>
            {showOptionalFields ? '− Hide Additional Information' : '+ Add More Details (Address, Website, Notes...)'}
          </Text>
        </TouchableOpacity>

        {showOptionalFields && (
          <View style={styles.optionalSection}>
            {/* Website */}
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Website"
                  placeholder="https://company.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="url"
                  autoCapitalize="none"
                  leftIcon={<Globe size={18} color={colors.textSecondary} />}
                />
              )}
            />

            {/* Contact Person */}
            <Controller
              control={control}
              name="contactPerson"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Contact Person"
                  placeholder="e.g. Alex Morgan (Head of Ops)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  leftIcon={<Contact size={18} color={colors.textSecondary} />}
                />
              )}
            />

            {/* Address */}
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Address"
                  placeholder="Street, City, Country"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={<MapPin size={18} color={colors.textSecondary} />}
                />
              )}
            />

            {/* Notes */}
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Notes / Special Instructions"
                  placeholder="Add any extra background, preferences, or project details..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  inputContainerStyle={styles.notesInputContainer}
                  inputStyle={styles.notesInput}
                  leftIcon={<FileText size={18} color={colors.textSecondary} />}
                />
              )}
            />
          </View>
        )}

        {/* 6. Form Actions */}
        <View style={styles.actionButtons}>
          <Button
            title={isEditing ? 'Save Changes' : 'Add Client'}
            onPress={() => handleSubmit(handleFormSubmit)()}
            variant="primary"
            size="md"
          />

          <Button
            title="Cancel"
            onPress={onClose}
            variant="ghost"
            size="sm"
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

export default ClientFormModal;

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
  },
  clientTypeContainer: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  typeSegment: {
    flexDirection: 'row',
    backgroundColor: '#EEF5F2',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  section: {
    marginTop: 8,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A847E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
    marginLeft: 4,
  },
  tagsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginLeft: 4,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  tagsHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipActive: {
    backgroundColor: '#EAF6EE',
    borderColor: '#BBE2CD',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tagTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  expandOptionalButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expandOptionalText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.primary,
  },
  optionalSection: {
    marginTop: 14,
  },
  notesInputContainer: {
    height: 90,
    borderRadius: 20,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  notesInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    marginTop: -4,
  },
});
