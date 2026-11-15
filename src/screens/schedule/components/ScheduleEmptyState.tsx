import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Calendar,
  Plus,
  Video,
  FileText,
  AlertCircle,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ScheduleType } from '../types';
import { ScheduleEmptyTimelineSlot } from './ScheduleTimelineItem';

interface ScheduleEmptyStateProps {
  onAddPress: () => void;
  onQuickAdd: (type: ScheduleType) => void;
  onSlotPress: (timeSlot: string) => void;
}

const DEFAULT_HOURS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
];

export const ScheduleEmptyState: React.FC<ScheduleEmptyStateProps> = ({
  onAddPress,
  onQuickAdd,
  onSlotPress,
}) => {
  const [showSlots, setShowSlots] = useState(false);

  return (
    <View style={styles.container}>
      {/* Friendly Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <Calendar size={32} color={colors.primary} strokeWidth={2} />
        </View>

        <Text style={styles.title}>No Events Scheduled</Text>
        <Text style={styles.subtitle}>
          Your schedule is clear for this day. Plan ahead or take time to focus.
        </Text>

        {/* Primary Add Event Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add New Event"
        >
          <Plus size={18} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.addButtonText}>Add New Event</Text>
        </TouchableOpacity>

        {/* Quick Type Shortcuts */}
        <View style={styles.quickShortcuts}>
          <Text style={styles.quickShortcutsLabel}>Quick Add:</Text>
          <View style={styles.shortcutRow}>
            <TouchableOpacity
              style={[styles.shortcutChip, styles.meetingChip]}
              onPress={() => onQuickAdd('Meeting')}
              activeOpacity={0.7}
            >
              <Video size={13} color="#6D28D9" strokeWidth={2.2} />
              <Text style={[styles.shortcutText, styles.meetingText]}>
                Meeting
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutChip, styles.taskChip]}
              onPress={() => onQuickAdd('Task')}
              activeOpacity={0.7}
            >
              <FileText size={13} color="#15803D" strokeWidth={2.2} />
              <Text style={[styles.shortcutText, styles.taskText]}>
                Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutChip, styles.deadlineChip]}
              onPress={() => onQuickAdd('Deadline')}
              activeOpacity={0.7}
            >
              <AlertCircle size={13} color="#B45309" strokeWidth={2.2} />
              <Text style={[styles.shortcutText, styles.deadlineText]}>
                Deadline
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutChip, styles.reminderChip]}
              onPress={() => onQuickAdd('Reminder')}
              activeOpacity={0.7}
            >
              <Bell size={13} color="#0369A1" strokeWidth={2.2} />
              <Text style={[styles.shortcutText, styles.reminderText]}>
                Reminder
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle to view empty time slots */}
        <TouchableOpacity
          style={styles.toggleSlotsButton}
          onPress={() => setShowSlots((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.toggleSlotsText}>
            {showSlots ? 'Hide timeline slots' : 'View timeline slots'}
          </Text>
          {showSlots ? (
            <ChevronUp size={14} color={colors.textSecondary} strokeWidth={2} />
          ) : (
            <ChevronDown size={14} color={colors.textSecondary} strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {/* Expandable Hour Slots */}
      {showSlots && (
        <View style={styles.slotsContainer}>
          <Text style={styles.slotsHeader}>Tap a time slot to schedule:</Text>
          {DEFAULT_HOURS.map((hour, idx) => (
            <ScheduleEmptyTimelineSlot
              key={hour}
              time={hour}
              isLast={idx === DEFAULT_HOURS.length - 1}
              onPress={() => onSlotPress(hour)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ScheduleEmptyState;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAF4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  quickShortcuts: {
    marginTop: 22,
    width: '100%',
    alignItems: 'center',
  },
  quickShortcutsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  shortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  shortcutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meetingChip: {
    backgroundColor: '#EDE9FE',
  },
  meetingText: {
    color: '#6D28D9',
  },
  taskChip: {
    backgroundColor: '#DCFCE7',
  },
  taskText: {
    color: '#15803D',
  },
  deadlineChip: {
    backgroundColor: '#FEF3C7',
  },
  deadlineText: {
    color: '#B45309',
  },
  reminderChip: {
    backgroundColor: '#E0F2FE',
  },
  reminderText: {
    color: '#0369A1',
  },
  toggleSlotsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  toggleSlotsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  slotsContainer: {
    marginTop: 24,
  },
  slotsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
});
