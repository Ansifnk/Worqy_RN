import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  TextInput as RNTextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, RefreshCw, Edit3 } from 'lucide-react-native';
import { navigationRef, type RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import { useAppContext, User } from '../../context/AppContext';
import { http, setAuthToken } from '../../utils/http';
import { saveAuthSession } from '../../utils/authStorage';
import { queryClient } from '../../utils/queryClient';
import { subscriptionKeys, isPlanNotExpired } from '../../utils/subscriptionUtils';
import AuthHeader from '../../components/AuthHeader';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'OtpVerification'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export const OtpVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const { email, name, password, source = 'mobile' } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

  const inputRef = useRef<React.ElementRef<typeof RNTextInput>>(null);

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleVerifyAndRegister = async (otpCode: string = otp) => {
    const trimmedOtp = otpCode.trim();
    if (trimmedOtp.length !== OTP_LENGTH) {
      setErrorMessage(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await http.post<{
        accessToken: string;
        refreshToken?: string;
        account: {
          userId: string;
          email: string;
          name: string;
          role?: string;
        };
      }>('/auth/user/register', {
        name,
        email,
        password,
        otp: trimmedOtp,
        source,
      });

      const accessToken = res?.data?.accessToken;
      const refreshToken = res?.data?.refreshToken;
      const account = res?.data?.account;

      if (accessToken && account) {
        setAuthToken(accessToken);

        let subData: any = null;
        try {
          const subRes = await http.get('/subscription-plans/my-subscription');
          subData = subRes?.data ?? null;
        } catch {
          // ignore error if subscription endpoint fails
        }

        const rawAccount = account as any;
        const targetUserId = rawAccount.userId || rawAccount.id;

        if (subData) {
          queryClient.setQueryData(subscriptionKeys.current(targetUserId), subData);
        }

        const mergedPlanId = subData?.subscriptionPlanId ?? rawAccount.subscriptionPlanId ?? null;
        const mergedStatus = subData?.subscriptionStatus ?? rawAccount.subscriptionStatus ?? null;
        const mergedStartsAt = subData?.subscriptionStartsAt ?? rawAccount.subscriptionStartsAt ?? null;
        const mergedEndsAt = subData?.subscriptionEndsAt ?? rawAccount.subscriptionEndsAt ?? null;
        const mergedTrialEndsAt = subData?.trialEndsAt ?? rawAccount.trialEndsAt ?? null;
        const mergedPlan = subData?.plan ?? rawAccount.subscriptionPlan ?? null;
        const mergedDaysRemaining = subData?.daysRemaining ?? null;

        const candidate = {
          isSubscribed: subData?.isSubscribed ?? rawAccount.isSubscribed,
          subscriptionPlanId: mergedPlanId,
          subscriptionStatus: mergedStatus,
          subscriptionStartsAt: mergedStartsAt,
          subscriptionEndsAt: mergedEndsAt,
          trialEndsAt: mergedTrialEndsAt,
          daysRemaining: mergedDaysRemaining,
          plan: mergedPlan,
        };

        const hasNotExpired = isPlanNotExpired(candidate);

        const userData: User = {
          id: targetUserId,
          name: rawAccount.name || name,
          email: rawAccount.email || email,
          mobile: rawAccount.mobile || rawAccount.phone || null,
          subscriptionPlanId: mergedPlanId,
          subscriptionStatus: mergedStatus,
          subscriptionStartsAt: mergedStartsAt,
          subscriptionEndsAt: mergedEndsAt,
          trialEndsAt: mergedTrialEndsAt,
          hasUsedTrial: subData?.hasUsedTrial ?? rawAccount.hasUsedTrial ?? false,
          subscriptionPlan: mergedPlan,
          daysRemaining: mergedDaysRemaining,
          isSubscribed: hasNotExpired,
        };

        await saveAuthSession(accessToken, userData, refreshToken);
        setUser(userData);

        const targetRoute = hasNotExpired ? 'Main' : 'SubscriptionPlans';
        const targetParams = hasNotExpired ? undefined : { isMandatory: true };

        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: targetRoute as any, params: targetParams }],
          });
        } else {
          navigation.replace(targetRoute as any, targetParams);
        }
      } else {
        throw new Error(res?.msg || 'Failed to complete registration');
      }
    } catch (error: any) {
      const msg =
        error?.msg ||
        error?.message ||
        'Invalid or expired verification code. Please try again.';
      setErrorMessage(msg);
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0 || resending) return;

    try {
      setResending(true);
      setErrorMessage(null);

      await http.post('/auth/user/send-verification-email', {
        email,
        name,
      });

      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      setOtp('');
      inputRef.current?.focus();
      Alert.alert(
        'Code Sent',
        `A fresh 6-digit verification code has been dispatched to ${email}.`,
      );
    } catch (error: any) {
      const msg =
        error?.msg ||
        error?.message ||
        'Failed to resend verification code. Please try again later.';
      Alert.alert('Resend Failed', msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Ambient background glow */}
      <View style={styles.ambientTopGlow} pointerEvents="none" />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: Math.max(insets.top, 14),
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <AuthHeader
            title="Verify Email"
            subtitle="Enter the verification code"
            onBack={() => navigation.goBack()}
          />

          <View style={styles.contentContainer}>
            {/* Email notification card */}
            <View style={styles.emailCard}>
              <View style={styles.emailIconWrapper}>
                <Mail size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <View style={styles.emailTextWrapper}>
                <Text style={styles.emailSentToLabel}>Verification code sent to:</Text>
                <Text style={styles.emailValueText} numberOfLines={1}>
                  {email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.editEmailButton}
                activeOpacity={0.7}
              >
                <Edit3 size={16} color={colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Instruction description */}
            <Text style={styles.instructionText}>
              Please enter the 6-digit code sent to your email address to confirm your identity and complete registration.
            </Text>

            {/* 6-box OTP Display driven by hidden TextInput */}
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={styles.otpBoxesRow}
              accessible
              accessibilityRole="none"
              accessibilityLabel={`OTP input, ${otp.length} of ${OTP_LENGTH} digits entered`}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const digit = otp[index] || '';
                const isFocused = otp.length === index;
                const isFilled = digit.length > 0;
                const hasError = Boolean(errorMessage);

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      isFilled && styles.otpBoxFilled,
                      isFocused && styles.otpBoxFocused,
                      hasError && styles.otpBoxError,
                    ]}
                  >
                    <Text
                      style={[
                        styles.otpBoxText,
                        isFilled && styles.otpBoxTextFilled,
                        hasError && styles.otpBoxTextError,
                      ]}
                    >
                      {digit}
                    </Text>
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden actual TextInput */}
            <RNTextInput
              ref={inputRef}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              style={styles.hiddenInput}
              caretHidden
            />

            {/* Inline Error Display */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Resend OTP Row */}
            <View style={styles.resendRow}>
              {secondsLeft > 0 ? (
                <Text style={styles.cooldownText}>
                  Resend code in{' '}
                  <Text style={styles.cooldownSecondsText}>
                    {secondsLeft < 10 ? `0:0${secondsLeft}` : `0:${secondsLeft}`}
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resending || loading}
                  style={styles.resendButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RefreshCw
                    size={15}
                    color={colors.primary}
                    style={resending ? styles.spinning : undefined}
                  />
                  <Text style={styles.resendButtonText}>
                    {resending ? 'Sending...' : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify & Register Primary Action */}
            <Button
              title="Verify & Create Account"
              loading={loading}
              disabled={otp.length !== OTP_LENGTH || loading}
              onPress={() => handleVerifyAndRegister()}
              style={styles.submitButton}
            />
          </View>

          {/* Footer Back Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Wrong email address? </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Change</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },

  // Ambient Glow
  ambientTopGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.surfaceSecondary,
    opacity: 0.6,
  },

  contentContainer: {
    marginVertical: 12,
  },

  // Email Card
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emailIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emailTextWrapper: {
    flex: 1,
  },
  emailSentToLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  emailValueText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  editEmailButton: {
    padding: 6,
  },

  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  // OTP Boxes
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  otpBoxFilled: {
    borderColor: colors.secondary,
    backgroundColor: colors.surface,
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  otpBoxError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  otpBoxTextFilled: {
    color: colors.primary,
  },
  otpBoxTextError: {
    color: colors.error,
  },

  // Hidden Input
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  // Error Message
  errorContainer: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Resend Row
  resendRow: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cooldownText: {
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  cooldownSecondsText: {
    fontWeight: '700',
    color: colors.primary,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  spinning: {
    opacity: 0.5,
  },

  // Primary Action
  submitButton: {
    marginTop: 26,
  },

  // Footer Link
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
