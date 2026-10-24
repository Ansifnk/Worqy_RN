import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  BackChevronIcon,
  DecorativeSparkle,
  GoogleSocialIcon,
  AppleSocialIcon,
  FacebookSocialIcon,
} from '../../components/AuthIcons';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    navigation.replace('Main');
  };

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
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <BackChevronIcon color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Header Title with Flanking Accents */}
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              {/* Left decorative sparkle */}
              <DecorativeSparkle
                size={16}
                color={colors.accent}
                style={styles.leftSparkle}
              />

              <Text style={styles.title}>Welcome Back</Text>

              {/* Right decorative sparkle */}
              <DecorativeSparkle
                size={22}
                color={colors.primary}
                style={styles.rightSparkle}
              />
            </View>

            <Text style={styles.subtitle}>Sign in to continue to Worqy</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.pillInputContainer}>
                <View style={styles.inputLeftIcon}>
                  <MailIcon color={colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.pillInputContainer}>
                <View style={styles.inputLeftIcon}>
                  <LockIcon color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <EyeIcon visible={showPassword} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Primary Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignIn}
              activeOpacity={0.88}
            >
              <Text style={styles.submitButtonText}>Sign in</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsRow}>
              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignIn}
              >
                <GoogleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignIn}
              >
                <AppleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignIn}
              >
                <FacebookSocialIcon />
              </TouchableOpacity>
            </View>
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

  // Top Bar
  topBar: {
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Header Title
  headerBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 24,
  },
  leftSparkle: {
    marginRight: 8,
    marginTop: -8,
  },
  rightSparkle: {
    marginLeft: 8,
    marginTop: -4,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14.5,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },

  // Form Container
  formContainer: {
    marginVertical: 10,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  pillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF5F2',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputLeftIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeToggle: {
    padding: 4,
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
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Social Buttons
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  socialCircleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
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