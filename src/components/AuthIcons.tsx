import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Sparkle,
} from 'lucide-react-native';
import { colors } from '../utils/colors';

interface IconProps {
  color?: string;
  size?: number;
}

/**
 * Envelope / Mail Icon using Lucide
 */
export const MailIcon: React.FC<IconProps> = ({
  color = colors.textSecondary,
  size = 20,
}) => {
  return <Mail size={size} color={color} strokeWidth={2} />;
};

/**
 * Phone Receiver / Mobile Icon using Lucide
 */
export const PhoneIcon: React.FC<IconProps> = ({
  color = colors.textSecondary,
  size = 20,
}) => {
  return <Phone size={size} color={color} strokeWidth={2} />;
};

/**
 * Padlock Icon using Lucide
 */
export const LockIcon: React.FC<IconProps> = ({
  color = colors.textSecondary,
  size = 20,
}) => {
  return <Lock size={size} color={color} strokeWidth={2} />;
};

/**
 * Eye Toggle Icon for Password Visibility using Lucide
 */
export const EyeIcon: React.FC<{ visible: boolean; color?: string; size?: number }> = ({
  visible,
  color = colors.textSecondary,
  size = 20,
}) => {
  return visible ? (
    <Eye size={size} color={color} strokeWidth={2} />
  ) : (
    <EyeOff size={size} color={color} strokeWidth={2} />
  );
};

/**
 * Back Chevron Arrow using Lucide
 */
export const BackChevronIcon: React.FC<IconProps> = ({
  color = colors.text,
  size = 22,
}) => {
  return <ChevronLeft size={size} color={color} strokeWidth={2.4} />;
};

/**
 * Decorative Outline Sparkle/Star using Lucide
 */
export const DecorativeSparkle: React.FC<{ size?: number; color?: string; style?: object }> = ({
  size = 20,
  color = colors.accent,
  style,
}) => {
  return (
    <View style={style}>
      <Sparkle size={size} color={color} strokeWidth={2} />
    </View>
  );
};

/**
 * Google 'G' Icon
 */
export const GoogleSocialIcon: React.FC = () => {
  return (
    <View style={styles.socialIconContainer}>
      <Text style={styles.googleLetter}>G</Text>
    </View>
  );
};

/**
 * Apple Icon
 */
export const AppleSocialIcon: React.FC = () => {
  return (
    <View style={styles.socialIconContainer}>
      <View style={styles.appleStem} />
      <View style={styles.appleBody} />
    </View>
  );
};

/**
 * Facebook 'f' Icon
 */
export const FacebookSocialIcon: React.FC = () => {
  return (
    <View style={styles.socialIconContainer}>
      <Text style={styles.facebookLetter}>f</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
