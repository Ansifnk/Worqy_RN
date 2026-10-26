import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface HomeHeaderProps {
  userName?: string;
  avatarUrl?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Ansif',
  avatarUrl,
  onNotificationPress,
  onProfilePress,
}) => {
  const greeting = getGreeting();
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : 'A';

  return (
    <View style={styles.container}>
      {/* User Greeting & Left Avatar */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </View>

        <View style={styles.greetingWrapper}>
          <Text style={styles.greetingText}>
            {greeting} <Text style={styles.waveEmoji}>👋</Text>
          </Text>
          <Text style={styles.userNameText} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Top Right Actions: Notification + Profile Button */}
      <View style={styles.headerRightActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Bell size={21} color={colors.text} strokeWidth={2} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <User size={21} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.surfaceSecondary,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  greetingWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  waveEmoji: {
    fontSize: 13,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
