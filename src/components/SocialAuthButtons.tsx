import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../utils/colors';

export const GoogleSocialIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

/* Kept for later reuse
const AppleSocialIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={colors.text || '#171717'}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.64 1.35-.57.65-1.06 1.71-.93 2.73 1.01.08 2.04-.49 2.65-1.23z" />
  </Svg>
);

const FacebookSocialIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);
*/

export interface SocialAuthButtonsProps {
  dividerText?: string;
  onPressGoogle?: () => void;
  onPressApple?: () => void;
  onPressFacebook?: () => void;
  disabled?: boolean;
  googleLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  dividerText: _dividerText = 'or sign in with',
  onPressGoogle,
  onPressApple: _onPressApple,
  onPressFacebook: _onPressFacebook,
  disabled = false,
  googleLoading = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Divider - Commented out for now (Only Google login active) */}
      {/*
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>
      */}

      {/* Prominent Google Sign In Button */}
      <TouchableOpacity
        style={[styles.googleFullBtn, googleLoading && styles.googleFullBtnLoading]}
        activeOpacity={0.8}
        onPress={onPressGoogle}
        disabled={disabled || googleLoading}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        {googleLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={styles.googleContentRow}>
            <GoogleSocialIcon size={20} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Social Buttons Row (Circular layout with Apple & Facebook) - Commented out for now
      <View style={styles.socialButtonsRow}>
        <TouchableOpacity
          style={[styles.socialCircleBtn, googleLoading && styles.socialCircleBtnLoading]}
          activeOpacity={0.7}
          onPress={onPressGoogle}
          disabled={disabled || googleLoading}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          {googleLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <GoogleSocialIcon />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialCircleBtn}
          activeOpacity={0.7}
          onPress={onPressApple}
          disabled={disabled || googleLoading}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <AppleSocialIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialCircleBtn}
          activeOpacity={0.7}
          onPress={onPressFacebook}
          disabled={disabled || googleLoading}
          accessibilityRole="button"
          accessibilityLabel="Continue with Facebook"
        >
          <FacebookSocialIcon />
        </TouchableOpacity>
      </View>
      */}
    </View>
  );
};

export default SocialAuthButtons;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // Full-width Google button styling
  googleFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.2,
    borderColor: colors.border,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  googleFullBtnLoading: {
    borderColor: colors.primary,
  },
  googleContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  socialCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  socialCircleBtnLoading: {
    borderColor: colors.primary,
  },
});
