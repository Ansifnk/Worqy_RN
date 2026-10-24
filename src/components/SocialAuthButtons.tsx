import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../utils/colors';

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

export interface SocialAuthButtonsProps {
  dividerText?: string;
  onPressGoogle?: () => void;
  onPressApple?: () => void;
  onPressFacebook?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  dividerText = 'or sign in with',
  onPressGoogle,
  onPressApple,
  onPressFacebook,
  disabled = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{dividerText}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons Row */}
      <View style={styles.socialButtonsRow}>
        <TouchableOpacity
          style={styles.socialCircleBtn}
          activeOpacity={0.8}
          onPress={onPressGoogle}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <GoogleSocialIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialCircleBtn}
          activeOpacity={0.8}
          onPress={onPressApple}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <AppleSocialIcon />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialCircleBtn}
          activeOpacity={0.8}
          onPress={onPressFacebook}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Continue with Facebook"
        >
          <FacebookSocialIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SocialAuthButtons;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
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
