import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Lock, AlertTriangle } from 'lucide-react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { TextInput } from '../../../components/TextInput';
import { Button } from '../../../components/Button';
import { colors } from '../../../utils/colors';
import { useAppContext } from '../../../context/AppContext';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DeleteAccountFormData {
  password: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
}) => {
  const { deleteAccount } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeleteAccountFormData>({
    defaultValues: {
      password: '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ password: '' });
      setErrorMessage(null);
    }
  }, [visible, reset]);

  const onSubmit = async (data: DeleteAccountFormData) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      await deleteAccount(data.password);
      onClose();
    } catch (err: any) {
      console.error('Delete account error:', err);
      const errCode = err?.code || '';
      if (
        errCode === 'auth/wrong-password' ||
        errCode === 'auth/invalid-credential' ||
        errCode === 'auth/invalid-password'
      ) {
        setErrorMessage('Incorrect password. Please verify and try again.');
      } else if (errCode === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please try again later.');
      } else {
        setErrorMessage(
          err?.message || 'Failed to delete account. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Delete Account"
      subtitle="Security verification required"
      maxHeightRatio={0.75}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color="#DC2626" style={styles.warningIcon} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Permanent Action</Text>
              <Text style={styles.warningBody}>
                Enter your password to confirm and permanently delete your account.
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required to confirm account deletion',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                placeholder="Enter your current password"
                value={value}
                onChangeText={(val) => {
                  onChange(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
                returnKeyType="done"
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
              title={submitting ? 'Deleting...' : 'Delete Account'}
              variant="primary"
              onPress={() => handleSubmit(onSubmit)()}
              loading={submitting}
              disabled={submitting}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

export default DeleteAccountModal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  content: {
    gap: 16,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  warningBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#991B1B',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
