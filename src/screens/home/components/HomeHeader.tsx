import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import dayjs from 'dayjs';
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
  userName = 'Ansif',
  avatarUrl,
  onMenuPress,
  onProfilePress,
}) => {
  const greeting = getGreeting();
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : 'A';
  const todayFormatted = dayjs().format('dddd, MMM D');

  return (
    <View style={styles.container}>

      {/* Greeting Title */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingSub}>{greeting}</Text>
        <Text style={styles.greetingTitle}>
          {userName} <Text style={styles.waveEmoji}>👋</Text>
        </Text>
      </View>
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
        {/* Active status indicator dot */}
        <View style={styles.activeStatusDot} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
    backgroundColor: '#0F172A',
  },
  datePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: -0.1,
  },
  avatarButton: {
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0369A1',
  },
  activeStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: colors.white,
  },
  greetingContainer: {
    gap: 2,
  },
  greetingSub: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  greetingTitle: {
    fontSize: 29,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  waveEmoji: {
    fontSize: 26,
  },
});
