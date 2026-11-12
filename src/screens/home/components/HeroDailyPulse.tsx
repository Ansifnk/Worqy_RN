import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle2, ArrowRight, Plus, Sparkles, Folder } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface HeroDailyPulseProps {
  hasTask: boolean;
  title?: string;
  projectName?: string;
  priority?: string;
  progressPercentage?: number;
  dueText?: string;
  checklistSummary?: string;
  onPress?: () => void;
  onCreateTask?: () => void;
}

export const HeroDailyPulse: React.FC<HeroDailyPulseProps> = ({
  hasTask,
  title = 'UI/UX Portfolio Design',
  projectName,
  priority = 'High',
  progressPercentage = 75,
  dueText = 'Due in 3h 45m',
  checklistSummary,
  onPress,
  onCreateTask,
}) => {
  const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100);

  if (!hasTask) {
    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.focusHeaderLeft}>
            <View style={styles.focusDotTeal} />
            <Text style={styles.cardLabel}>TODAY'S PULSE</Text>
          </View>
          <View style={styles.allClearBadge}>
            <Sparkles size={12} color="#059669" />
            <Text style={styles.allClearBadgeText}>All Caught Up</Text>
          </View>
        </View>

        <Text style={styles.emptyTitle}>Ready to plan today's priorities?</Text>
        <Text style={styles.emptySubtitle}>
          Set your key focus task to keep track of deadlines, subtasks, and progress.
        </Text>

        <TouchableOpacity
          style={styles.createTaskButton}
          onPress={onCreateTask || onPress}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Create your focus task"
        >
          <Plus size={16} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.createTaskButtonText}>Set Focus Task</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`Today's Focus: ${title}, ${clampedProgress}% completed, ${dueText}`}
    >
      {/* Top Header: Label with Dot + Progress Badge */}
      <View style={styles.topRow}>
        <View style={styles.focusHeaderLeft}>
          <View style={styles.focusDotPurple} />
          <Text style={styles.cardLabel}>TODAY'S FOCUS</Text>
          {Boolean(priority) && (
            <View style={styles.priorityPill}>
              <Text style={styles.priorityPillText}>{priority.toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{`${Math.round(clampedProgress)}%`}</Text>
        </View>
      </View>

      {/* Task Title */}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      {/* Project or Checklist info if available */}
      {(Boolean(projectName) || Boolean(checklistSummary)) && (
        <View style={styles.metaRow}>
          {Boolean(projectName) && (
            <View style={styles.projectTag}>
              <Folder size={12} color="#6366F1" strokeWidth={2} />
              <Text style={styles.projectTagText} numberOfLines={1}>
                {projectName}
              </Text>
            </View>
          )}
          {Boolean(checklistSummary) && (
            <Text style={styles.checklistSummaryText}>{checklistSummary}</Text>
          )}
        </View>
      )}

      {/* Horizontal Sleek Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${clampedProgress}%` }]} />
      </View>

      {/* Bottom Status & Quick Action */}
      <View style={styles.bottomRow}>
        <View style={styles.dueWrapper}>
          <Clock size={14} color="#64748B" strokeWidth={2} />
          <Text style={styles.dueText}>{dueText}</Text>
        </View>

        <View style={styles.openTaskAction}>
          <Text style={styles.openTaskText}>View task</Text>
          <ArrowRight size={13} color="#6366F1" strokeWidth={2.4} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default HeroDailyPulse;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 19,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  focusDotPurple: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
  },
  focusDotTeal: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  cardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  priorityPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 2,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.3,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: -0.2,
  },
  allClearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  allClearBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    lineHeight: 25,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  projectTagText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  checklistSummaryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  openTaskAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openTaskText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  createTaskButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
});

