import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../../utils/colors';

interface HomeHeaderProps {
  userName?: string;
  avatarUrl?: string;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Hitesh',
  avatarUrl,
  onMenuPress,
  onProfilePress,
}) => {
  const greeting = getGreeting();
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : 'H';

  return (
    <View style={styles.container}>
      {/* Top Action Row: 4-square Grid Launcher (Left) + Profile Avatar (Right) */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.gridButton}
          onPress={onMenuPress}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Workspace Menu"
        >
          {/* Exact 2x2 rounded square dots matching the reference image */}
          <View style={styles.gridIconContainer}>
            <View style={styles.gridIconRow}>
              <View style={styles.gridDot} />
              <View style={styles.gridDot} />
            </View>
            <View style={styles.gridIconRow}>
              <View style={styles.gridDot} />
              <View style={styles.gridDot} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="User Profile"
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Greeting Title */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingSub}>{greeting}</Text>
        <Text style={styles.greetingTitle}>
          {userName} <Text style={styles.waveEmoji}>👋</Text>
        </Text>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIconContainer: {
    gap: 3.5,
  },
  gridIconRow: {
    flexDirection: 'row',
    gap: 3.5,
  },
  gridDot: {
    width: 6.8,
    height: 6.8,
    borderRadius: 2.2,
    backgroundColor: '#18181B',
  },
  avatarButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  greetingContainer: {
    gap: 3,
  },
  greetingSub: {
    fontSize: 16.5,
    color: '#6B7280',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.5,
  },
  waveEmoji: {
    fontSize: 26,
  },
});
