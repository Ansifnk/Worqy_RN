import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { BottomSheet } from '../../../components/BottomSheet';
import { Button } from '../../../components/Button';
import { colors } from '../../../utils/colors';
import { useAppContext } from '../../../context/AppContext';
import { GoogleSocialIcon } from '../../../components/SocialAuthButtons';

/* Kept for later reuse when email/password auth is restored
import { useForm, Controller } from 'react-hook-form';
import { Lock } from 'lucide-react-native';
import { TextInput } from '../../../components/TextInput';

interface DeleteAccountFormData {
  password: string;
}
*/

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
}) => {
  const { deleteAccount, user } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* Password form state kept for future reuse
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
  */

  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      // Deletes user account (handles Google user credentials directly without password)
      await deleteAccount();
      onClose();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setErrorMessage(
        err?.message || 'Failed to delete account. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Delete Account"
      subtitle="Permanent account deletion"
      maxHeightRatio={0.75}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <AlertTriangle size={22} color="#DC2626" style={styles.warningIcon} />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Permanent Action</Text>
              <Text style={styles.warningBody}>
                Are you sure you want to delete your account? All your datas will be permanently removed. This action cannot be undone.
              </Text>
            </View>
          </View>

          {/* Account Info Chip */}
          <View style={styles.accountChip}>
            <View style={styles.googleIconBadge}>
              <GoogleSocialIcon size={18} />
            </View>
            <View style={styles.accountTextContainer}>
              <Text style={styles.accountLabel}>Signed in with Google</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>
                {user?.email || 'Google Account'}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Password Input (kept for later reuse when email/password auth is restored)
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required to confirm account deletion',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                placeholder="Enter your current password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
              />
            )}
          />
          */}

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
              onPress={handleConfirmDelete}
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
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FAF8',
    borderWidth: 1,
    borderColor: '#DCEFE7',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  googleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6F4F0',
  },
  accountTextContainer: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  accountEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
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
