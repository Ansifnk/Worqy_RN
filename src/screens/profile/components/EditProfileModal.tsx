import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { User as UserIcon, Mail } from 'lucide-react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { colors } from '../../../utils/colors';
import { http } from '../../../utils/http';
import { useAppContext } from '../../../context/AppContext';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ProfileFormData {
  name: string;
  email: string;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, refreshUser } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    if (visible && user) {
      reset({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [visible, user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Please enter a valid name.');
      return;
    }

    try {
      setSubmitting(true);

      // Update profile on server
      await http.put('/auth/profile', { name: trimmedName });

      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully.');
      onClose();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      Alert.alert('Error', err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Update your personal account information"
      maxHeightRatio={0.7}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          {/* Full Name */}
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon={<UserIcon size={18} color={colors.textSecondary} />}
                autoCapitalize="words"
                returnKeyType="done"
              />
            )}
          />

          {/* Email Address (Read-only) */}
          <Controller
            control={control}
            name="email"
            render={({ field: { value } }) => (
              <TextInput
                label="Email Address"
                value={value}
                editable={false}
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
                helperText="Email address cannot be modified here."
                containerStyle={styles.emailContainer}
              />
            )}
          />

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              disabled={submitting}
              style={styles.cancelButton}
            />
            <Button
              title={submitting ? 'Saving...' : 'Save Changes'}
              variant="primary"
              onPress={() => handleSubmit(onSubmit)()}
              loading={submitting}
              disabled={submitting}
              style={styles.saveButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  formContainer: {
    gap: 16,
  },
  emailContainer: {
    opacity: 0.8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
