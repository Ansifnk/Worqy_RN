import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { ChevronLeft, Sparkle } from 'lucide-react-native';
import { colors } from '../utils/colors';

export interface AuthHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  showBack?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showBack ? (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={22} color={colors.text} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <View style={styles.leftSparkle}>
            <Sparkle size={16} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rightSparkle}>
            <Sparkle size={22} color={colors.primary} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default AuthHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
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
  headerBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
});
