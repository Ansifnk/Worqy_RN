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
import type { RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import { User, Mail, Lock } from 'lucide-react-native';
import { useAppContext, User as AppUser } from '../../context/AppContext';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../../utils/constants';
import AuthHeader from '../../components/AuthHeader';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
// import SocialAuthButtons from '../../components/SocialAuthButtons';

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
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const authUser = userCredential.user;

      try {
        await updateProfile(authUser, { displayName: trimmedName });
      } catch (profileError) {
        console.warn('Failed to update displayName:', profileError);
      }

      const db = getFirestore();
      const userData: AppUser = {
        id: authUser.uid,
        name: trimmedName,
        email: authUser.email || trimmedEmail,
      };

      await setDoc(doc(db, firebaseCollections.users, authUser.uid), userData);

      setUser(userData);
      navigation.replace('Main');
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered. Please sign in instead.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error?.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled in Firebase console.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleSocialNotSupported = () => {
  //   Alert.alert('Notice', 'Social sign up is not supported. Please sign up with email.');
  // };

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
                  leftIcon={<User size={20} color={colors.textSecondary} strokeWidth={2} />}
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
              onPress={() => handleSubmit(onSubmit)()}
              style={styles.submitButton}
            />

            {/* Reusable Social Auth Buttons */}
            {/* <SocialAuthButtons
              dividerText="or sign up with"
              disabled={loading}
              onPressGoogle={handleSocialNotSupported}
              onPressApple={handleSocialNotSupported}
              onPressFacebook={handleSocialNotSupported}
            /> */}
          </View>

          {/* Switch to Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={handleGoToLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },

  // Primary Button
  submitButton: {
    marginTop: 10,
  },

  // Footer Link
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
