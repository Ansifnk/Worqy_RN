import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  FolderKanban,
  Users,
  CheckSquare,
  Calendar,
  Receipt,
  FileText,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface HomeBentoGridProps {
  projectsCount?: number;
  activeProjectsCount?: number;
  clientsCount?: number;
  activeClientsCount?: number;
  pendingTasksCount?: number;
  todayMeetingsCount?: number;
  invoicesCount?: number;
  onNavigateProjects: () => void;
  onNavigateClients: () => void;
  onNavigateTasks: () => void;
  onNavigateSchedule: () => void;
  onNavigateInvoices: () => void;
  onNavigateQuotations: () => void;
  onOpenAI: () => void;
}

export const HomeBentoGrid: React.FC<HomeBentoGridProps> = ({
  projectsCount = 0,
  activeProjectsCount = 0,
  clientsCount = 0,
  activeClientsCount = 0,
  pendingTasksCount = 0,
  todayMeetingsCount = 0,
  invoicesCount = 0,
  onNavigateProjects,
  onNavigateClients,
  onNavigateTasks,
  onNavigateSchedule,
  onNavigateInvoices,
  onNavigateQuotations,
  onOpenAI,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workspace Features</Text>
        <Text style={styles.sectionSubtitle}>Direct access to each tool</Text>
      </View>

      <View style={styles.grid}>
        {/* 1. Projects */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#CCFBF1' }]}
          onPress={onNavigateProjects}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Projects"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F0FDFA' }]}>
              <FolderKanban size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color={colors.primary} strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Projects</Text>
          <Text style={styles.cardMetric}>
            {activeProjectsCount > 0 ? `${activeProjectsCount} in progress` : `${projectsCount} total`}
          </Text>
        </TouchableOpacity>

        {/* 2. Clients */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#D1FAE5' }]}
          onPress={onNavigateClients}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Clients"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Users size={20} color="#059669" strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color="#059669" strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Clients</Text>
          <Text style={styles.cardMetric}>
            {clientsCount} clients • {activeClientsCount} active
          </Text>
        </TouchableOpacity>

        {/* 3. Tasks */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#E0E7FF' }]}
          onPress={onNavigateTasks}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Tasks"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
              <CheckSquare size={20} color="#6366F1" strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color="#6366F1" strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Tasks</Text>
          <Text style={styles.cardMetric}>{pendingTasksCount} pending tasks</Text>
        </TouchableOpacity>

        {/* 4. Schedule */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#E0F2FE' }]}
          onPress={onNavigateSchedule}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Schedule"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
              <Calendar size={20} color="#0284C7" strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color="#0284C7" strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Schedule</Text>
          <Text style={styles.cardMetric}>
            {todayMeetingsCount > 0 ? `${todayMeetingsCount} events today` : 'Calendar view'}
          </Text>
        </TouchableOpacity>

        {/* 5. Invoices */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#FEF3C7' }]}
          onPress={onNavigateInvoices}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Invoices"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FFFBEB' }]}>
              <Receipt size={20} color="#D97706" strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color="#D97706" strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Invoices</Text>
          <Text style={styles.cardMetric}>{invoicesCount} invoices</Text>
        </TouchableOpacity>

        {/* 6. Quotations */}
        <TouchableOpacity
          style={[styles.featureCard, { borderColor: '#FFEDD5' }]}
          onPress={onNavigateQuotations}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Quotations"
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
              <FileText size={20} color="#EA580C" strokeWidth={2.2} />
            </View>
            <View style={styles.arrowCircle}>
              <ArrowUpRight size={14} color="#EA580C" strokeWidth={2.4} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Quotations</Text>
          <Text style={styles.cardMetric}>Estimates & proposals</Text>
        </TouchableOpacity>

        {/* 7. AI Copilot (Wide Banner) */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={onOpenAI}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open AI Copilot"
        >
          <View style={styles.aiLeftContent}>
            <View style={styles.aiIconBox}>
              <Sparkles size={20} color={colors.accent} strokeWidth={2.4} />
            </View>
            <View style={styles.aiTextGroup}>
              <Text style={styles.aiTitle}>Worqy AI Copilot</Text>
              <Text style={styles.aiSubtitle}>
                Draft invoices, plan tasks & get instant answers
              </Text>
            </View>
          </View>

          <View style={styles.aiArrowBtn}>
            <ChevronRight size={18} color={colors.white} strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeBentoGrid;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardMetric: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 3,
  },
  aiBanner: {
    width: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 2,
  },
  aiLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextGroup: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  aiSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    lineHeight: 15,
  },
  aiArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
