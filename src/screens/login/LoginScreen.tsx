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
import { Mail, Lock } from 'lucide-react-native';
import { useAppContext, User } from '../../context/AppContext';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../../utils/constants';
import AuthHeader from '../../components/AuthHeader';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
// import SocialAuthButtons from '../../components/SocialAuthButtons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values: LoginFormValues) => {
    const trimmedEmail = values.email.trim();
    const { password } = values;

    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const authUser = userCredential.user;

      const db = getFirestore();
      const userDocRef = doc(db, firebaseCollections.users, authUser.uid);
      const userSnap = await getDoc(userDocRef);

      let userData: User;
      if (userSnap.exists()) {
        const data = userSnap.data();
        userData = {
          id: authUser.uid,
          name: data?.name || authUser.displayName || trimmedEmail.split('@')[0],
          email: data?.email || authUser.email || trimmedEmail,
        };
      } else {
        userData = {
          id: authUser.uid,
          name: authUser.displayName || trimmedEmail.split('@')[0],
          email: authUser.email || trimmedEmail,
        };
        await setDoc(userDocRef, userData);
      }

      setUser(userData);
      navigation.replace('Main');
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/invalid-credential'
      ) {
        errorMessage = 'Invalid email or password.';
      } else if (error?.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error?.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const handleSocialNotSupported = () => {
  //   Alert.alert('Notice', 'Social sign in is not supported. Please sign in with email.');
  // };

  const handleGoToSignup = () => {
    navigation.navigate('Signup');
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
          {/* Reusable Auth Header */}
          <AuthHeader
            title="Welcome Back"
            subtitle="Sign in to continue to Worqy"
            onBack={() => navigation.goBack()}
          />

          {/* Form Fields */}
          <View style={styles.formContainer}>
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
                />
              )}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Primary Button */}
            <Button
              title="Sign in"
              loading={loading}
              onPress={() => handleSubmit(onSubmit)()}
              style={styles.submitButton}
            />

            {/* Reusable Social Auth Buttons */}
            {/* <SocialAuthButtons
              dividerText="or sign in with"
              disabled={loading}
              onPressGoogle={handleSocialNotSupported}
              onPressApple={handleSocialNotSupported}
              onPressFacebook={handleSocialNotSupported}
            /> */}
          </View>

          {/* Switch to Sign Up Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={handleGoToSignup}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

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
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Primary Button
  submitButton: {
    marginTop: 4,
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