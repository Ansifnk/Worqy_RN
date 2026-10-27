import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { User as UserIcon, Mail, Lock } from 'lucide-react-native';
import { navigationRef, type RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import { useAppContext, User } from '../../context/AppContext';
import { http } from '../../utils/http';
import { saveAuthSession } from '../../utils/authStorage';
import AuthHeader from '../../components/AuthHeader';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
}

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password');

  const getPasswordStrength = () => {
    if (!passwordValue) return null;
    if (passwordValue.length < 6) return { label: 'Weak', color: colors.warning };
    if (passwordValue.length < 10) return { label: 'Medium', color: colors.info };
    return { label: 'Strong', color: colors.success };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (values: SignupFormValues) => {
    const trimmedName = values.name.trim();
    const trimmedEmail = values.email.trim();
    const { password } = values;

    try {
      setLoading(true);

      const res = await http.post<{
        accessToken: string;
        account: {
          userId: string;
          email: string;
          name: string;
          role?: string;
        };
      }>('/auth/client/register', {
        name: trimmedName,
        email: trimmedEmail,
        password,
        source: 'mobile',
      });

      const accessToken = res?.data?.accessToken;
      const account = res?.data?.account;

      if (accessToken && account) {
        const userData: User = {
          id: account.userId || (account as any).id,
          name: account.name || trimmedName,
          email: account.email || trimmedEmail,
        };

        await saveAuthSession(accessToken, userData);
        setUser(userData);

        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.replace('Main');
        }
      } else {
        throw new Error(res?.msg || 'Failed to register');
      }
    } catch (error: any) {
      const errorMessage =
        error?.msg || error?.message || 'Failed to create account. Please try again.';
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Ambient background glow for depth */}
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
          {/* Reusable Auth Header */}
          <AuthHeader
            title="Join Worqy"
            subtitle="Create your workspace account"
            onBack={() => navigation.goBack()}
          />

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Field with react-hook-form */}
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                  disabled={loading}
                  leftIcon={<UserIcon size={20} color={colors.textSecondary} strokeWidth={2} />}
                />
              )}
            />

            {/* Email Field with react-hook-form */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="name@example.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  disabled={loading}
                  leftIcon={<Mail size={20} color={colors.textSecondary} strokeWidth={2} />}
                />
              )}
            />

            {/* Password Field with react-hook-form */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  autoCapitalize="none"
                  isPassword
                  disabled={loading}
                  leftIcon={<Lock size={20} color={colors.textSecondary} strokeWidth={2} />}
                  rightAccessory={
                    strength ? (
                      <View style={styles.strengthBadge}>
                        <Text style={[styles.strengthText, { color: strength.color }]}>
                          {strength.label}
                        </Text>
                      </View>
                    ) : null
                  }
                />
              )}
            />

            {/* Sign Up Primary Button */}
            <Button
              title="Sign up"
              loading={loading}
              disabled={loading}
              onPress={() => handleSubmit(onSubmit)()}
              style={styles.submitButton}
            />
          </View>

          {/* Switch to Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleGoToLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignupScreen;

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

  // Form Container
  formContainer: {
    marginVertical: 10,
  },
  strengthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // Primary Button
  submitButton: {
    marginTop: 16,
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
