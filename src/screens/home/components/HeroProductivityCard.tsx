import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface HeroProductivityCardProps {
  tasksCount?: number;
  meetingsCount?: number;
  activeClientsCount?: number;
  onPressAnalytics?: () => void;
}

export const HeroProductivityCard: React.FC<HeroProductivityCardProps> = ({
  tasksCount = 3,
  meetingsCount = 2,
  activeClientsCount = 4,
  onPressAnalytics,
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Decorative ambient subtle circle glow */}
      <View style={styles.glowCircle} pointerEvents="none" />

      {/* Top Section: Title & Trend Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.heroTitle}>Let’s make</Text>
          <Text style={styles.heroTitle}>today productive!</Text>
        </View>

        <TouchableOpacity
          style={styles.trendBadge}
          onPress={onPressAnalytics}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Productivity analytics"
        >
          <TrendingUp size={24} color={colors.accent} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Bottom Section: 3 Stats Counters */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{tasksCount}</Text>
          <Text style={styles.metricLabel}>Tasks</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{meetingsCount}</Text>
          <Text style={styles.metricLabel}>Meetings</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{activeClientsCount}</Text>
          <Text style={styles.metricLabel}>Active Clients</Text>
        </View>
      </View>
    </View>
  );
};

export default HeroProductivityCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#134E4A', // Deep Worqy teal tone for premium contrast
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    marginHorizontal: 20,
    marginBottom: 26,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 8,
  },
  glowCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.secondary,
    opacity: 0.12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  trendBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 4,
    letterSpacing: -0.1,
  },
});
