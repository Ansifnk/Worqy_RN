import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';

export type AnalyticsViewMode = 'status' | 'priority';

interface TaskAnalyticsHeroProps {
  totalTasks: number;
  completedCount: number;
  inProgressCount: number;
  todoCount: number;
  highPriorityCount?: number;
  mediumPriorityCount?: number;
  lowPriorityCount?: number;
  overdueCount?: number;
  dueTodayCount?: number;
  onPress?: () => void;
  onCreateTask?: () => void;
}

export const TaskAnalyticsHero: React.FC<TaskAnalyticsHeroProps> = ({
  totalTasks,
  completedCount,
  inProgressCount,
  todoCount,
  highPriorityCount = 0,
  mediumPriorityCount = 0,
  lowPriorityCount = 0,
  overdueCount = 0,
  dueTodayCount = 0,
  onPress,
  onCreateTask,
}) => {
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>('status');

  const completionRate =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Donut SVG parameters
  const size = 108;
  const strokeWidth = 11;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build segments dynamically based on active view mode
  const segments = React.useMemo(() => {
    if (totalTasks === 0) return [];

    if (viewMode === 'status') {
      const list = [
        { key: 'completed', count: completedCount, color: '#10B981', label: 'Done' },
        { key: 'inProgress', count: inProgressCount, color: '#F59E0B', label: 'In Progress' },
        { key: 'todo', count: todoCount, color: '#6366F1', label: 'To Do' },
      ].filter((s) => s.count > 0);

      const nonZero = list.length;
      const gap = nonZero > 1 ? 3 : 0;

      let accumulated = 0;
      return list.map((item) => {
        const ratio = item.count / totalTasks;
        const arcLength = Math.max(0, circumference * ratio - gap);
        const offset = accumulated;
        accumulated += circumference * ratio;
        return {
          ...item,
          ratio,
          arcLength,
          offset,
        };
      });
    }

    // Priority view mode
    const list = [
      { key: 'high', count: highPriorityCount, color: '#EF4444', label: 'High' },
      { key: 'medium', count: mediumPriorityCount, color: '#F59E0B', label: 'Medium' },
      { key: 'low', count: lowPriorityCount, color: '#10B981', label: 'Low' },
    ].filter((s) => s.count > 0);

    const nonZero = list.length;
    const gap = nonZero > 1 ? 3 : 0;

    let accumulated = 0;
    return list.map((item) => {
      const ratio = item.count / totalTasks;
      const arcLength = Math.max(0, circumference * ratio - gap);
      const offset = accumulated;
      accumulated += circumference * ratio;
      return {
        ...item,
        ratio,
        arcLength,
        offset,
      };
    });
  }, [
    totalTasks,
    viewMode,
    completedCount,
    inProgressCount,
    todoCount,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
    circumference,
  ]);

  // Proportional horizontal bar widths
  const calcBarWidth = (count: number) => {
    if (totalTasks === 0) return '0%';
    return `${Math.max(4, Math.round((count / totalTasks) * 100))}%`;
  };

  // If no tasks exist, show a motivating empty state
  if (totalTasks === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.headerLeft}>
            <View style={styles.pulseDotGreen} />
            <Text style={styles.cardLabel}>TASK ANALYTICS</Text>
          </View>
          <View style={styles.emptyBadge}>
            <Sparkles size={12} color="#059669" />
            <Text style={styles.emptyBadgeText}>No Tasks Yet</Text>
          </View>
        </View>

        <Text style={styles.emptyTitle}>Ready to boost your workflow?</Text>
        <Text style={styles.emptySubtitle}>
          Add your daily tasks to track completion velocity, pending workload, and stay on top of deadlines.
        </Text>

        <TouchableOpacity
          style={styles.createTaskButton}
          onPress={onCreateTask || onPress}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Create your first task"
        >
          <Plus size={16} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.createTaskButtonText}>Add First Task</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Task Analytics: ${completionRate}% completed, ${completedCount} done, ${totalTasks - completedCount} pending`}
    >
      {/* Top Header: Badge, Segment Toggle & Completion Rate */}
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconChip}>
            <TrendingUp size={13} color="#176B67" strokeWidth={2.4} />
          </View>
          <Text style={styles.cardLabel}>TASK ANALYTICS</Text>
        </View>

        {/* View Mode Toggle: Status vs Priority */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              viewMode === 'status' && styles.modeToggleButtonActive,
            ]}
            onPress={() => setViewMode('status')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeToggleText,
                viewMode === 'status' && styles.modeToggleTextActive,
              ]}
            >
              Status
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              viewMode === 'priority' && styles.modeToggleButtonActive,
            ]}
            onPress={() => setViewMode('priority')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeToggleText,
                viewMode === 'priority' && styles.modeToggleTextActive,
              ]}
            >
              Priority
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Section: Left SVG Donut Chart + Right Stats Breakdown */}
      <View style={styles.chartAndStatsRow}>
        {/* SVG Multi-Segment Donut Chart */}
        <View style={styles.donutWrapper}>
          <Svg width={size} height={size}>
            {/* Background Track Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Dynamic Donut Arcs */}
            <G rotation="-90" origin={`${center}, ${center}`}>
              {segments.map((seg) => (
                <Circle
                  key={seg.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg.arcLength} ${circumference}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </G>
          </Svg>

          {/* Center Callout */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={styles.donutCenter}>
              {viewMode === 'status' ? (
                <>
                  <Text style={styles.donutCenterValue}>{`${completionRate}%`}</Text>
                  <Text style={styles.donutCenterLabel}>DONE</Text>
                </>
              ) : (
                <>
                  <Text style={styles.donutCenterValue}>{highPriorityCount}</Text>
                  <Text style={styles.donutCenterLabel}>HIGH PRI</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right Stats Breakdown */}
        <View style={styles.statsColumn}>
          {viewMode === 'status' ? (
            <>
              {/* Completed */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotGreen]} />
                  <Text style={styles.statItemLabel}>Completed</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{completedCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((completedCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              {/* In Progress */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotAmber]} />
                  <Text style={styles.statItemLabel}>In Progress</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{inProgressCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((inProgressCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              {/* To Do / Pending */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotIndigo]} />
                  <Text style={styles.statItemLabel}>To Do</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{todoCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((todoCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* High Priority */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotRed]} />
                  <Text style={styles.statItemLabel}>High Priority</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{highPriorityCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((highPriorityCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              {/* Medium Priority */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotAmber]} />
                  <Text style={styles.statItemLabel}>Medium Priority</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{mediumPriorityCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((mediumPriorityCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>

              {/* Low Priority */}
              <View style={styles.statItemRow}>
                <View style={styles.statItemLeft}>
                  <View style={[styles.statDot, styles.dotGreen]} />
                  <Text style={styles.statItemLabel}>Low Priority</Text>
                </View>
                <View style={styles.statItemRight}>
                  <Text style={styles.statItemValue}>{lowPriorityCount}</Text>
                  <Text style={styles.statItemShare}>
                    {totalTasks > 0 ? `${Math.round((lowPriorityCount / totalTasks) * 100)}%` : '0%'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Segmented Horizontal Proportion Bar */}
      <View style={styles.proportionBarTrack}>
        {viewMode === 'status' ? (
          <>
            {completedCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barGreen,
                  { width: calcBarWidth(completedCount) },
                ]}
              />
            )}
            {inProgressCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barAmber,
                  { width: calcBarWidth(inProgressCount) },
                ]}
              />
            )}
            {todoCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barIndigo,
                  { width: calcBarWidth(todoCount) },
                ]}
              />
            )}
          </>
        ) : (
          <>
            {highPriorityCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barRed,
                  { width: calcBarWidth(highPriorityCount) },
                ]}
              />
            )}
            {mediumPriorityCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barAmber,
                  { width: calcBarWidth(mediumPriorityCount) },
                ]}
              />
            )}
            {lowPriorityCount > 0 && (
              <View
                style={[
                  styles.proportionBarFill,
                  styles.barGreen,
                  { width: calcBarWidth(lowPriorityCount) },
                ]}
              />
            )}
          </>
        )}
      </View>

      {/* Bottom Insights & Quick Link */}
      <View style={styles.bottomRow}>
        <View style={styles.insightsBadgesRow}>
          {overdueCount > 0 ? (
            <View style={styles.overdueBadge}>
              <AlertCircle size={12} color="#DC2626" />
              <Text style={styles.overdueBadgeText}>
                {overdueCount} Overdue
              </Text>
            </View>
          ) : null}

          {dueTodayCount > 0 ? (
            <View style={styles.dueTodayBadge}>
              <Clock size={12} color="#2563EB" />
              <Text style={styles.dueTodayBadgeText}>
                {dueTodayCount} Due Today
              </Text>
            </View>
          ) : null}

          {overdueCount === 0 && dueTodayCount === 0 ? (
            <View style={styles.onTrackBadge}>
              <CheckCircle2 size={12} color="#059669" />
              <Text style={styles.onTrackBadgeText}>
                {totalTasks - completedCount === 0
                  ? 'All tasks finished!'
                  : `${totalTasks - completedCount} pending · On track`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.viewTasksAction}>
          <Text style={styles.viewTasksText}>View tasks</Text>
          <ArrowRight size={13} color="#176B67" strokeWidth={2.4} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskAnalyticsHero;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
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
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconChip: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#E6F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDotGreen: {
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
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2.5,
  },
  modeToggleButton: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  modeToggleButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  chartAndStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  donutWrapper: {
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  donutCenterLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  statsColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  statItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statItemLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  statItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  statItemShare: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    minWidth: 26,
    textAlign: 'right',
  },
  proportionBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
    marginBottom: 12,
  },
  proportionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  insightsBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  overdueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  dueTodayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  dueTodayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  onTrackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  onTrackBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  viewTasksAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingLeft: 8,
  },
  viewTasksText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#176B67',
  },
  emptyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  emptyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#176B67',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  createTaskButtonText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.white,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotAmber: {
    backgroundColor: '#F59E0B',
  },
  dotIndigo: {
    backgroundColor: '#6366F1',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  barGreen: {
    backgroundColor: '#10B981',
  },
  barAmber: {
    backgroundColor: '#F59E0B',
  },
  barIndigo: {
    backgroundColor: '#6366F1',
  },
  barRed: {
    backgroundColor: '#EF4444',
  },
});
