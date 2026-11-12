import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  Check,
  Users,
  FolderKanban,
  Receipt,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import CircularProgress from './CircularProgress';
import EqualizerBars from './EqualizerBars';

interface HomeThemeBentoProps {
  tasksRemaining?: number;
  clientsCount?: number;
  clientsSubtitle?: string;
  activeProjectsCount?: number;
  projectProgress?: number;
  invoicesText?: string;
  invoicesSubtitle?: string;
  aiStatusText?: string;
  aiSubtitle?: string;
  upcomingTitle?: string;
  upcomingTime?: string;
  onNavigateTasks?: () => void;
  onNavigateClients?: () => void;
  onNavigateProjects?: () => void;
  onNavigateInvoices?: () => void;
  onNavigateAI?: () => void;
  onNavigateUpcoming?: () => void;
}

export const HomeThemeBento: React.FC<HomeThemeBentoProps> = ({
  tasksRemaining = 12,
  clientsCount = 24,
  clientsSubtitle = 'Active Accounts',
  activeProjectsCount = 4,
  projectProgress = 68,
  invoicesText = '6 Due',
  invoicesSubtitle = 'This Month',
  aiStatusText = 'Ready',
  aiSubtitle = 'Smart Copilot',
  upcomingTitle = 'Design Review Meeting',
  upcomingTime = 'Today, 2:00 PM',
  onNavigateTasks,
  onNavigateClients,
  onNavigateProjects,
  onNavigateInvoices,
  onNavigateAI,
  onNavigateUpcoming,
}) => {
  // Mini sparkline equalizer bars matching the reference design
  const invoiceBars = [0.25, 0.45, 0.2, 0.6, 0.35, 0.7, 0.3, 0.5, 0.9, 0.65];
  const aiSoundwaveBars = [0.3, 0.55, 0.25, 0.7, 0.4, 0.85, 0.35, 0.6, 0.95, 0.5];

  return (
    <View style={styles.container}>
      {/* Row 1: Tasks (Left) & Clients (Right - Replaces Calendar) */}
      <View style={styles.twoColumnRow}>
        {/* Tasks Card */}
        <TouchableOpacity
          style={[styles.halfCard, { backgroundColor: colors.cardPurpleBg }]}
          onPress={onNavigateTasks}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Tasks: ${tasksRemaining} remaining`}
        >
          <View style={styles.cardHeaderWithIcon}>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardLabel}>Tasks</Text>
              <Text style={styles.statValue}>{tasksRemaining}</Text>
              <Text style={styles.statSub}>Remaining</Text>
            </View>

            <View style={[styles.iconSquircle, { backgroundColor: colors.cardPurpleIcon }]}>
              <Check size={22} color={colors.white} strokeWidth={2.8} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Clients Card (Replaces Calendar) */}
        <TouchableOpacity
          style={[styles.halfCard, { backgroundColor: colors.cardPeachBg }]}
          onPress={onNavigateClients}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Clients: ${clientsCount} ${clientsSubtitle}`}
        >
          <View style={styles.cardHeaderWithIcon}>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardLabel}>Clients</Text>
              <Text style={styles.statValue}>{clientsCount}</Text>
              <Text style={styles.statSub} numberOfLines={1}>
                {clientsSubtitle}
              </Text>
            </View>

            <View style={[styles.iconSquircle, { backgroundColor: colors.cardPeachIcon }]}>
              <Users size={21} color={colors.cardPeachAccent} strokeWidth={2.2} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 2: Wide Projects Card with Folder + Circular Progress Ring */}
      <TouchableOpacity
        style={[styles.wideCard, { backgroundColor: colors.cardGreenBg }]}
        onPress={onNavigateProjects}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={`Projects: ${activeProjectsCount} active, ${projectProgress}% progress`}
      >
        <View style={styles.projectsLeftCol}>
          <Text style={styles.cardLabel}>Projects</Text>
          <Text style={styles.statValue}>{activeProjectsCount}</Text>
          <Text style={styles.statSub}>Active Projects</Text>
        </View>

        <View style={styles.projectsRightGroup}>
          <View style={[styles.iconSquircle, { backgroundColor: colors.cardGreenIcon }]}>
            <FolderKanban size={22} color={colors.cardGreenAccent} strokeWidth={2.2} />
          </View>
          <CircularProgress
            size={56}
            strokeWidth={5}
            progress={projectProgress}
            color="#22C55E"
            trackColor="#DCFCE7"
          />
        </View>
      </TouchableOpacity>

      {/* Row 3: Invoices (Left - Replaces Focus Time) & AI Assistant (Right - Replaces Completed) */}
      <View style={styles.twoColumnRow}>
        {/* Invoices Card (Replaces Focus Time) */}
        <TouchableOpacity
          style={[styles.halfCard, { backgroundColor: colors.cardBlueBg }]}
          onPress={onNavigateInvoices}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Invoices: ${invoicesText} ${invoicesSubtitle}`}
        >
          <View style={styles.cardHeaderWithIcon}>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardLabel}>Invoices</Text>
              <Text style={[styles.statValue, styles.statValueCompact]}>{invoicesText}</Text>
              <Text style={styles.statSub}>{invoicesSubtitle}</Text>
            </View>

            <View style={[styles.iconSquircle, { backgroundColor: colors.cardBlueIcon }]}>
              <Receipt size={20} color={colors.white} strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <EqualizerBars
              bars={invoiceBars}
              baseColor="#BFDBFE"
              accentColor="#3B82F6"
              height={22}
            />
          </View>
        </TouchableOpacity>

        {/* AI Assistant Card (Replaces Completed) */}
        <TouchableOpacity
          style={[styles.halfCard, { backgroundColor: colors.cardMintBg }]}
          onPress={onNavigateAI}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`AI Assistant: ${aiStatusText} ${aiSubtitle}`}
        >
          <View style={styles.cardHeaderWithIcon}>
            <View style={styles.cardContentCol}>
              <Text style={styles.cardLabel}>AI Assistant</Text>
              <Text style={[styles.statValue, styles.statValueCompact]}>{aiStatusText}</Text>
              <Text style={styles.statSub}>{aiSubtitle}</Text>
            </View>

            <View style={[styles.iconSquircle, { backgroundColor: colors.cardMintIcon }]}>
              <Sparkles size={20} color={colors.cardMintAccent} strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <EqualizerBars
              bars={aiSoundwaveBars}
              baseColor="#BBF7D0"
              accentColor="#22C55E"
              height={22}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 4: Wide Upcoming Card */}
      <TouchableOpacity
        style={[
          styles.wideCard,
          styles.upcomingCard,
          { backgroundColor: colors.cardYellowBg, borderColor: colors.cardYellowBorder },
        ]}
        onPress={onNavigateUpcoming}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={`Upcoming: ${upcomingTitle}, ${upcomingTime}`}
      >
        <View style={[styles.iconSquircle, { backgroundColor: colors.cardYellowIcon }]}>
          <Users size={22} color={colors.cardYellowAccent} strokeWidth={2.2} />
        </View>

        <View style={styles.upcomingContentCol}>
          <Text style={styles.upcomingLabel}>Upcoming</Text>
          <Text style={styles.upcomingTitle} numberOfLines={1}>
            {upcomingTitle}
          </Text>
          <Text style={styles.upcomingTime} numberOfLines={1}>
            {upcomingTime}
          </Text>
        </View>

        <View style={styles.chevronCircle}>
          <ChevronRight size={18} color="#57534E" strokeWidth={2.2} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default HomeThemeBento;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 24,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    minHeight: 126,
    justifyContent: 'space-between',
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContentCol: {
    flex: 1,
    paddingRight: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subtleText,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkText,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  statValueCompact: {
    fontSize: 21,
    lineHeight: 28,
  },
  statSub: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedText,
    marginTop: 1,
  },
  iconSquircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartWrapper: {
    marginTop: 8,
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  projectsLeftCol: {
    flex: 1,
  },
  projectsRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upcomingCard: {
    borderWidth: 1,
    paddingVertical: 14,
  },
  upcomingContentCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  upcomingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cardYellowAccent,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  upcomingTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.darkText,
    letterSpacing: -0.2,
  },
  upcomingTime: {
    fontSize: 12.5,
    color: colors.subtleText,
    fontWeight: '500',
    marginTop: 2,
  },
  chevronCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
