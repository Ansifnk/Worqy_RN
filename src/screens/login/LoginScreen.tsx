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
import type { RootStackParamList } from '../../navigations/AppNav';
import { colors } from '../../utils/colors';
import {
  Mail,
  Lock,
  ChevronLeft,
  Sparkle,
} from 'lucide-react-native';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import { useAppContext, User } from '../../context/AppContext';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../../utils/constants';

// Direct Social Icons
const GoogleSocialIcon: React.FC = () => (
  <View style={styles.socialIconContainer}>
    <Text style={styles.googleLetter}>G</Text>
  </View>
);

const AppleSocialIcon: React.FC = () => (
  <View style={styles.socialIconContainer}>
    <View style={styles.appleStem} />
    <View style={styles.appleBody} />
  </View>
);

const FacebookSocialIcon: React.FC = () => (
  <View style={styles.socialIconContainer}>
    <Text style={styles.facebookLetter}>f</Text>
  </View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { setUser } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

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

  const handleSocialNotSupported = () => {
    Alert.alert('Notice', 'Social sign in is not supported. Please sign in with email.');
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
              <ChevronLeft size={22} color={colors.text} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Header Title with Flanking Accents */}
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              {/* Left decorative sparkle */}
              <View style={styles.leftSparkle}>
                <Sparkle size={16} color={colors.accent} strokeWidth={2} />
              </View>

              <Text style={styles.title}>Welcome Back</Text>

              {/* Right decorative sparkle */}
              <View style={styles.rightSparkle}>
                <Sparkle size={22} color={colors.primary} strokeWidth={2} />
              </View>
            </View>

            <Text style={styles.subtitle}>Sign in to continue to Worqy</Text>
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
              disabled={loading}
              leftIcon={<Mail size={20} color={colors.textSecondary} strokeWidth={2} />}
            />

            {/* Password Field */}
            <TextInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              isPassword
              disabled={loading}
              leftIcon={<Lock size={20} color={colors.textSecondary} strokeWidth={2} />}
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
              onPress={handleSignIn}
              style={styles.submitButton}
            />

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
                onPress={handleSocialNotSupported}
              >
                <GoogleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSocialNotSupported}
              >
                <AppleSocialIcon />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialCircleBtn}
                activeOpacity={0.8}
                onPress={handleSocialNotSupported}
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

  // Social Icon glyphs
  socialIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EA4335',
  },
  appleStem: {
    width: 4,
    height: 3,
    borderTopRightRadius: 3,
    borderWidth: 1.2,
    borderColor: '#171717',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    alignSelf: 'center',
    marginBottom: -0.5,
  },
  appleBody: {
    width: 14,
    height: 13,
    borderRadius: 7,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: '#171717',
  },
  facebookLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1877F2',
    marginTop: -2,
  },
});