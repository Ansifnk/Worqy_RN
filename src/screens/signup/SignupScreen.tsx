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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import {
  MailIcon,
  PhoneIcon,
  LockIcon,
  BackChevronIcon,
  DecorativeSparkle,
  GoogleSocialIcon,
  AppleSocialIcon,
  FacebookSocialIcon,
} from '../../components/AuthIcons';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // In demo flow, proceed to main app
    navigation.replace('Main');
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      {/* Ambient background glows for depth */}
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
              {/* Left small decorative accent */}
              <DecorativeSparkle
                size={16}
                color={colors.accent}
                style={styles.leftSparkle}
              />

              <Text style={styles.title}>Create Account</Text>

              {/* Right larger decorative accent */}
              <DecorativeSparkle
                size={22}
                color={colors.primary}
                style={styles.rightSparkle}
              />
            </View>

            <Text style={styles.subtitle}>Find your ideal workspace</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email Field */}
            <TextInput
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<MailIcon color={colors.textSecondary} />}
            />

            {/* Mobile Number Field */}
            <TextInput
              label="Mobile Number"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<PhoneIcon color={colors.textSecondary} />}
            />

            {/* Password Field */}
            <TextInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              isPassword
              leftIcon={<LockIcon color={colors.textSecondary} />}
              rightAccessory={
                password.length > 0 ? (
                  <View style={styles.strengthBadge}>
                    <Text style={styles.strengthText}>Strong</Text>
                  </View>
                ) : undefined
              }
            />

            {/* Sign Up Primary Button */}
            <Button
              title="Sign up"
              onPress={handleSignUp}
              style={styles.submitButton}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsRow}>
              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignUp}
              >
                <GoogleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignUp}
              >
                <AppleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSignUp}
              >
                <FacebookSocialIcon />
              </TouchableOpacity>
            </View>
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
