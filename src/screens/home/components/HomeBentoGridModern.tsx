import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  CheckSquare,
  Users,
  FolderKanban,
  Receipt,
  Sparkles,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  CalendarCheck,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import CircularProgress from './CircularProgress';

interface HomeBentoGridModernProps {
  tasksRemaining: number;
  highPriorityTasksCount?: number;
  clientsCount: number;
  activeClientsCount: number;
  projectsCount: number;
  activeProjectsCount: number;
  projectProgress: number;
  invoicesSummary: string;
  invoicesCount: number;
  upcomingTitle?: string;
  upcomingTime?: string;
  onNavigateTasks: () => void;
  onNavigateClients: () => void;
  onNavigateProjects: () => void;
  onNavigateInvoices: () => void;
  onNavigateAI: () => void;
  onNavigateSchedule: () => void;
  onAddSchedule?: () => void;
}

export const HomeBentoGridModern: React.FC<HomeBentoGridModernProps> = ({
  tasksRemaining,
  highPriorityTasksCount = 0,
  clientsCount,
  activeClientsCount,
  projectsCount,
  activeProjectsCount,
  projectProgress,
  invoicesSummary,
  invoicesCount,
  upcomingTitle,
  upcomingTime,
  onNavigateTasks,
  onNavigateClients,
  onNavigateProjects,
  onNavigateInvoices,
  onNavigateAI,
  onNavigateSchedule,
  onAddSchedule,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>WORKSPACE HUB</Text>
      </View>

      {/* Row 1: Tasks (Left) & Clients (Right) */}
      <View style={styles.twoColumnRow}>
        {/* Tasks Card */}
        <TouchableOpacity
          style={styles.halfCard}
          onPress={onNavigateTasks}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Tasks: ${tasksRemaining} active`}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <CheckSquare size={19} color="#6366F1" strokeWidth={2.2} />
            </View>
            <View style={styles.pillBadgePurple}>
              <Text style={styles.pillBadgePurpleText}>
                {tasksRemaining > 0 ? `${tasksRemaining} due` : 'Done'}
              </Text>
            </View>
          </View>

          <View style={styles.metricWrapper}>
            <Text style={styles.metricNumber}>{tasksRemaining}</Text>
            <Text style={styles.metricLabel}>Active Tasks</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerTagText} numberOfLines={1}>
              {highPriorityTasksCount > 0
                ? `${highPriorityTasksCount} high priority`
                : 'To-do & backlog'}
            </Text>
            <ArrowUpRight size={13} color="#6366F1" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* Clients Card */}
        <TouchableOpacity
          style={styles.halfCard}
          onPress={onNavigateClients}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Clients: ${clientsCount} total`}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Users size={19} color="#D97706" strokeWidth={2.2} />
            </View>
            <View style={styles.pillBadgeAmber}>
              <Text style={styles.pillBadgeAmberText}>
                {activeClientsCount > 0 ? `${activeClientsCount} active` : 'CRM'}
              </Text>
            </View>
          </View>

          <View style={styles.metricWrapper}>
            <Text style={styles.metricNumber}>{clientsCount}</Text>
            <Text style={styles.metricLabel}>Client Accounts</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerTagText} numberOfLines={1}>
              Directory & CRM
            </Text>
            <ArrowUpRight size={13} color="#D97706" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 2: Full Width Projects Spotlight */}
      <TouchableOpacity
        style={styles.projectsWideCard}
        onPress={onNavigateProjects}
        activeOpacity={0.84}
        accessibilityRole="button"
        accessibilityLabel={`Projects: ${activeProjectsCount} active, ${projectProgress}% health`}
      >
        <View style={styles.projectsLeftCol}>
          <View style={styles.projectsHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <FolderKanban size={20} color="#059669" strokeWidth={2.2} />
            </View>
            <View style={styles.pillBadgeEmerald}>
              <Text style={styles.pillBadgeEmeraldText}>
                {activeProjectsCount > 0 ? `${activeProjectsCount} In Progress` : 'Projects'}
              </Text>
            </View>
          </View>

          <Text style={styles.projectsTitle}>
            {activeProjectsCount > 0
              ? `${activeProjectsCount} Active Projects`
              : `${projectsCount} Total Projects`}
          </Text>
          <Text style={styles.projectsSubtitle}>
            {projectsCount > 0
              ? `${projectsCount} workspaces • Health index`
              : 'Create workspaces & manage deliverables'}
          </Text>
        </View>

        <View style={styles.projectsRightCol}>
          <CircularProgress
            size={58}
            strokeWidth={5.5}
            progress={projectProgress}
            color="#10B981"
            trackColor="#D1FAE5"
          />
        </View>
      </TouchableOpacity>

      {/* Row 3: Invoices (Left) & AI Assistant (Right) */}
      <View style={styles.twoColumnRow}>
        {/* Invoices Card */}
        <TouchableOpacity
          style={styles.halfCard}
          onPress={onNavigateInvoices}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`Invoices: ${invoicesSummary}`}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
              <Receipt size={19} color="#0284C7" strokeWidth={2.2} />
            </View>
            <View style={styles.pillBadgeBlue}>
              <Text style={styles.pillBadgeBlueText}>
                {invoicesCount > 0 ? `${invoicesCount} total` : 'Finance'}
              </Text>
            </View>
          </View>

          <View style={styles.metricWrapper}>
            <Text style={[styles.metricNumber, styles.metricNumberCompact]}>
              {invoicesSummary}
            </Text>
            <Text style={styles.metricLabel}>Billing & Cash</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerTagText} numberOfLines={1}>
              Invoices & payments
            </Text>
            <ArrowUpRight size={13} color="#0284C7" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* AI Assistant Copilot Card */}
        <TouchableOpacity
          style={[styles.halfCard, styles.aiCardBorder]}
          onPress={onNavigateAI}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Worqy AI Copilot assistant"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
              <Sparkles size={19} color="#7C3AED" strokeWidth={2.2} />
            </View>
            <View style={styles.pillBadgeViolet}>
              <View style={styles.aiLiveDot} />
              <Text style={styles.pillBadgeVioletText}>Online</Text>
            </View>
          </View>

          <View style={styles.metricWrapper}>
            <Text style={[styles.metricNumber, styles.metricNumberCompact]}>Copilot</Text>
            <Text style={styles.metricLabel}>Worqy Assistant</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.footerTagText} numberOfLines={1}>
              Draft, plan & analyze
            </Text>
            <ArrowUpRight size={13} color="#7C3AED" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 4: Next Up / Upcoming Agenda Card */}
      {Boolean(upcomingTitle) ? (
        <TouchableOpacity
          style={styles.upcomingCardActive}
          onPress={onNavigateSchedule}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel={`Next Up: ${upcomingTitle}${upcomingTime ? `, ${upcomingTime}` : ''}`}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <Calendar size={20} color="#D97706" strokeWidth={2.2} />
          </View>

          <View style={styles.upcomingContentCol}>
            <View style={styles.upcomingTagRow}>
              <Text style={styles.upcomingBadgeLabel}>NEXT UP</Text>
              {Boolean(upcomingTime) && (
                <Text style={styles.upcomingTimePill}>{upcomingTime}</Text>
              )}
            </View>
            <Text style={styles.upcomingTitleText} numberOfLines={1}>
              {upcomingTitle}
            </Text>
          </View>

          <View style={styles.chevronButton}>
            <ChevronRight size={17} color="#475569" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.upcomingCardClear}
          onPress={onNavigateSchedule}
          activeOpacity={0.84}
          accessibilityRole="button"
          accessibilityLabel="Schedule is clear today. Tap to plan event."
        >
          <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
            <CalendarCheck size={20} color="#059669" strokeWidth={2.2} />
          </View>

          <View style={styles.upcomingContentCol}>
            <Text style={styles.clearScheduleTitle}>No meetings scheduled today</Text>
            <Text style={styles.clearScheduleSubtitle}>
              Great time for deep uninterrupted focus
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addEventButton}
            onPress={onAddSchedule || onNavigateSchedule}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Add Schedule Event"
          >
            <Plus size={14} color="#059669" strokeWidth={2.4} />
            <Text style={styles.addEventButtonText}>Plan</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeBentoGridModern;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 13,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  systemStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 142,
  },
  aiCardBorder: {
    borderColor: '#E0E7FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBadgePurple: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillBadgePurpleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pillBadgeAmber: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillBadgeAmberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  pillBadgeBlue: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillBadgeBlueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  pillBadgeViolet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  pillBadgeVioletText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  metricWrapper: {
    marginVertical: 4,
  },
  metricNumber: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  metricNumberCompact: {
    fontSize: 21,
    lineHeight: 28,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
    marginRight: 4,
  },
  projectsWideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  projectsLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  projectsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pillBadgeEmerald: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  pillBadgeEmeraldText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  projectsTitle: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  projectsSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  projectsRightCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  upcomingCardClear: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  upcomingContentCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  upcomingTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  upcomingBadgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.6,
  },
  upcomingTimePill: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  upcomingTitleText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  clearScheduleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  clearScheduleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  chevronButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  addEventButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});

