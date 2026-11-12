import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface TodayFocusCardProps {
  title?: string;
  progressPercentage?: number;
  dueText?: string;
  onPress?: () => void;
}

export const TodayFocusCard: React.FC<TodayFocusCardProps> = ({
  title = 'UI/UX Portfolio Design',
  progressPercentage = 75,
  dueText = 'Due in 3h 45m',
  onPress,
}) => {
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Today's Focus: ${title}, ${clampedProgress}% completed`}
    >
      {/* Top Header: Label + Progress Badge */}
      <View style={styles.topRow}>
        <Text style={styles.cardLabel}>Today's Focus</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{`${Math.round(clampedProgress)}%`}</Text>
        </View>
      </View>

      {/* Task / Project Focus Title */}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {/* Horizontal Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${clampedProgress}%` }]} />
      </View>

      {/* Due / Time Status */}
      <View style={styles.bottomRow}>
        <Clock size={14} color={colors.subtleText} strokeWidth={2} />
        <Text style={styles.dueText}>{dueText}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TodayFocusCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFF1F6',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtleText,
    letterSpacing: -0.1,
  },
  badge: {
    backgroundColor: '#F3F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6C5CE7',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkText,
    letterSpacing: -0.3,
    lineHeight: 24,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#F0F1F7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontSize: 12.5,
    color: colors.subtleText,
    fontWeight: '500',
  },
});

