import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Building2 } from 'lucide-react-native';
import { navigationRef, type RootStackParamList } from '../../navigations/AppNav';
import { useAppContext } from '../../context/AppContext';
import { signInWithGoogle } from '../../utils/googleAuth';
import { GoogleSocialIcon } from '../../components/SocialAuthButtons';
import SunburstBackground from './components/SunburstBackground';
import FloatingIconBadges from './components/FloatingIconBadges';

/* Kept for later reuse when email/password auth is restored
import { useForm, Controller } from 'react-hook-form';
import { Mail, Lock } from 'lucide-react-native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';
import { firebaseCollections } from '../../utils/constants';
import AuthHeader from '../../components/AuthHeader';
import TextInput from '../../components/TextInput';
import Button from '../../components/Button';
import SocialAuthButtons from '../../components/SocialAuthButtons';
import type { User as AppUser } from '../../context/AppContext';
*/

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/* Kept for later reuse
interface LoginFormValues {
  email: string;
  password: string;
}
*/

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { setUser } = useAppContext();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Convergence point of the sunburst rays & logo placement
  const centerY = Math.round(height * 0.44);

  // Email/Password form state - Commented out for now (Google login only)
  /*
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

      let userData: AppUser;
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
  */

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const result = await signInWithGoogle();

      if (result.cancelled) {
        return;
      }

      if (result.success && result.user) {
        setUser(result.user);
        if (navigationRef.isReady()) {
          navigationRef.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.replace('Main');
        }
      } else if (result.error) {
        Alert.alert('Sign In Failed', result.error);
      }
    } catch (error: any) {
      Alert.alert('Sign In Failed', error?.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Sign up navigation - Commented out for now (No sign up needed, login auto-creates account)
  /*
  const handleGoToSignup = () => {
    navigation.navigate('Signup');
  };
  */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* 1. Dynamic Radiating Fan/Sunburst Background in Brand Colors */}
      <SunburstBackground width={width} height={height} centerY={centerY} />

      {/* 2. Floating Themed Icon Badges across rays (strictly icons, no people) */}
      <FloatingIconBadges width={width} height={height} />

      {/* 3. Top Navigation Bar (Sleek glass back button) */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={22} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 4. Center Brand Area (Sits directly at the sunburst convergence point) */}
        <View style={[styles.brandArea, { marginTop: centerY - 46 }]}>
          {/* App Logo Card with 3D Glossy Badge and "Worqy" tag */}
          <View style={styles.logoCardWrapper}>
            <View style={styles.logoCard}>
              <View style={styles.logoIconCircle}>
                <Building2 size={36} color="#176B67" strokeWidth={2.4} />
              </View>
              {/* Curved badge tag matching reference "Lite" banner */}
              <View style={styles.logoTagPill}>
                <Text style={styles.logoTagText}>Worqy</Text>
              </View>
            </View>
          </View>

          {/* App Title & Subtitle */}
          <Text style={styles.appTitle}>Worqy Spaces</Text>
          <Text style={styles.appSubtitle}>Find Your Perfect Workspace</Text>
        </View>

        {/* 5. Lower Actions Section */}
        <View style={[styles.actionsSection, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Primary Action: Golden "Sign in with Google" Pill Button */}
          <TouchableOpacity
            style={[styles.googlePillButton, googleLoading && styles.googlePillButtonLoading]}
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#193A38" />
            ) : (
              <View style={styles.buttonContentRow}>
                <View style={styles.googleIconBadge}>
                  <GoogleSocialIcon size={20} />
                </View>
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Secondary Action: "Sign in with Account" Pill Button - Commented out for now
          <TouchableOpacity
            style={styles.accountPillButton}
            activeOpacity={0.85}
            disabled={googleLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Account"
          >
            <View style={styles.buttonContentRow}>
              <View style={styles.accountIconBadge}>
                <User size={18} color="#193A38" strokeWidth={2.4} />
              </View>
              <Text style={styles.accountButtonText}>Sign in with Account</Text>
            </View>
          </TouchableOpacity>
          */}

          {/* Quick Login footer link - Commented out for now
          <View style={styles.quickLoginRow}>
            <Text style={styles.quickLoginText}>Have an account ? </Text>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.quickLoginLink}>Quick Login</Text>
            </TouchableOpacity>
          </View>
          */}

          {/* User Agreement & Privacy Policy Footer */}
          <View style={styles.agreementContainer}>
            <Text style={styles.agreementText}>By continuing you agree to the</Text>
            <View style={styles.agreementLinksRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Text style={styles.agreementLink}>User Agreement</Text>
              </TouchableOpacity>
              <Text style={styles.agreementText}> & </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                <Text style={styles.agreementLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Preserved Email/Password Form and Signup code (for later reuse)
      <View style={{ display: 'none' }}>
        <TextInput label="Email" value="" onChangeText={() => {}} />
        <TextInput label="Password" value="" onChangeText={() => {}} />
        <Button title="Sign in" onPress={() => {}} />
        <SocialAuthButtons onPressGoogle={handleGoogleSignIn} />
      </View>
      */}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#104441',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },

  // Central Brand / Logo
  brandArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCardWrapper: {
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  logoCard: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: '#F5FAF8', // Off-white with a soft green touch
    borderWidth: 2.5,
    borderColor: '#DCEFE7', // Soft seafoam green-touch border
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#104441',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logoTagPill: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#176B67',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  logoTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  appTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginTop: 4,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBE5DE',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: -0.1,
  },

  // Lower Action Buttons
  actionsSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  googlePillButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5FAF8', // Off-white with delicate green touch
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DCEFE7', // Soft seafoam green border
    shadowColor: '#104441',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  googlePillButtonLoading: {
    opacity: 0.85,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#176B67', // Worqy deep primary teal
    letterSpacing: -0.2,
  },

  // Account Button Styling (Ready for reactivation)
  accountPillButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  accountIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#193A38',
    letterSpacing: -0.2,
  },

  // Quick Login
  quickLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  quickLoginText: {
    fontSize: 14,
    color: '#CBE5DE',
  },
  quickLoginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  // Agreement Footer
  agreementContainer: {
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  agreementText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
  },
  agreementLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  agreementLink: {
    fontSize: 12,
    color: '#70B7A8', // Soft mint seafoam
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});