import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import dayjs from 'dayjs';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  AlertCircle,
  Bell,
  Utensils,
  CheckSquare,
  Users,
  Briefcase,
  AlignLeft,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { BottomSheet } from '../../../components/BottomSheet';
import { Button } from '../../../components/Button';
import { ScheduleItem, ScheduleType } from '../types';
import { parseTimeToMinutes } from '../../../hooks/useSchedule';

interface ScheduleDetailModalProps {
  visible: boolean;
  item: ScheduleItem | null;
  onClose: () => void;
  onEdit: (item: ScheduleItem) => void;
  onDelete: (item: ScheduleItem) => void;
}

const getTypeConfig = (type: ScheduleType) => {
  switch (type) {
    case 'Meeting':
      return {
        label: 'Meeting',
        icon: Video,
        textColor: '#6D28D9',
        bgColor: '#EDE9FE',
        borderColor: '#DDD6FE',
      };
    case 'Task':
      return {
        label: 'Task',
        icon: FileText,
        textColor: '#15803D',
        bgColor: '#DCFCE7',
        borderColor: '#BBF7D0',
      };
    case 'Deadline':
      return {
        label: 'Deadline',
        icon: AlertCircle,
        textColor: '#B45309',
        bgColor: '#FEF3C7',
        borderColor: '#FDE68A',
      };
    case 'Reminder':
      return {
        label: 'Reminder',
        icon: Bell,
        textColor: '#0369A1',
        bgColor: '#E0F2FE',
        borderColor: '#BAE6FD',
      };
    case 'Break':
      return {
        label: 'Break / Personal',
        icon: Utensils,
        textColor: '#785340',
        bgColor: '#F2EAE1',
        borderColor: '#E7DDD3',
      };
    default:
      return {
        label: 'Event',
        icon: CheckSquare,
        textColor: colors.primary,
        bgColor: '#EAF4F2',
        borderColor: '#CCE4DF',
      };
  }
};

const formatDuration = (startTime?: string, endTime?: string): string | null => {
  if (!startTime || !endTime) return null;
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  const diff = endMin - startMin;
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} mins`;
};

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  visible,
  item,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!item) return null;

  const typeConfig = getTypeConfig(item.type);
  const TypeIcon = typeConfig.icon;
  const duration = formatDuration(item.startTime, item.endTime);
  const formattedDate = dayjs(item.date).format('dddd, MMMM D, YYYY');

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      maxHeightRatio={0.85}
      headerRight={
        <View
          style={[
            styles.typePill,
            {
              backgroundColor: typeConfig.bgColor,
              borderColor: typeConfig.borderColor,
            },
          ]}
        >
          <TypeIcon size={13} color={typeConfig.textColor} strokeWidth={2.4} />
          <Text style={[styles.typeText, { color: typeConfig.textColor }]}>
            {typeConfig.label}
          </Text>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{item.title}</Text>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.iconCircle}>
              <Calendar size={18} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.cardCol}>
              <Text style={styles.cardLabel}>Date</Text>
              <Text style={styles.cardValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardRow}>
            <View style={styles.iconCircle}>
              <Clock size={18} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.cardCol}>
              <Text style={styles.cardLabel}>Time & Duration</Text>
              <View style={styles.timeRow}>
                <Text style={styles.cardValue}>
                  {item.startTime || 'Not set'}
                  {item.endTime ? ` - ${item.endTime}` : ''}
                </Text>
                {duration && (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{duration}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Client & Project Information */}
        {(item.clientName || item.projectName) && (
          <View style={styles.card}>
            {item.clientName && (
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, styles.clientIconCircle]}>
                  <Users size={18} color="#6D28D9" strokeWidth={2.2} />
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>Client</Text>
                  <Text style={styles.cardValue}>{item.clientName}</Text>
                </View>
              </View>
            )}

            {item.clientName && item.projectName && <View style={styles.cardDivider} />}

            {item.projectName && (
              <View style={styles.cardRow}>
                <View style={[styles.iconCircle, styles.projectIconCircle]}>
                  <Briefcase size={18} color="#0369A1" strokeWidth={2.2} />
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>Project</Text>
                  <Text style={styles.cardValue}>{item.projectName}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {item.notes ? (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconCircle, styles.notesIconCircle]}>
                <AlignLeft size={18} color={colors.textSecondary} strokeWidth={2.2} />
              </View>
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>Notes</Text>
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Edit Event"
            leftIcon={<Pencil size={18} color={colors.white} strokeWidth={2.2} />}
            onPress={() => {
              onClose();
              onEdit(item);
            }}
            style={styles.editButton}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              onClose();
              onDelete(item);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete Event"
          >
            <Trash2 size={18} color={colors.error} strokeWidth={2.2} />
            <Text style={styles.deleteButtonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

export default ScheduleDetailModal;

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 18,
    marginTop: 4,
    lineHeight: 28,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientIconCircle: {
    backgroundColor: '#EDE9FE',
  },
  projectIconCircle: {
    backgroundColor: '#E0F2FE',
  },
  notesIconCircle: {
    backgroundColor: '#F3F4F6',
  },
  cardCol: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationBadge: {
    backgroundColor: '#EAF4F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
    marginLeft: 52,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  actionsContainer: {
    marginTop: 10,
    gap: 12,
  },
  editButton: {
    width: '100%',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },
});
