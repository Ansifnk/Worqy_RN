import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Briefcase, Calendar, CheckSquare, IndianRupee, Layers, Users } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ProjectItem, ProjectStatus } from '../types';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';

interface ProjectCardProps {
  project: ProjectItem;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const getProjectStatusColors = (status: ProjectStatus) => {
  switch (status) {
    case 'In Progress':
      return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
    case 'Planning':
      return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' };
    case 'Completed':
      return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
    case 'On Hold':
      return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    case 'Cancelled':
      return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
    default:
      return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
  }
};

export const formatINR = (amount?: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  onEdit,
  onDelete,
}) => {
  const statusColors = getProjectStatusColors(project.status);
  const formattedBudget = formatINR(project.budget);

  const menuActions: ActionMenuItem[] = [
    {
      id: 'view',
      title: 'View Details',
      image: Platform.select({ ios: 'eye', android: 'ic_menu_view' }),
      onPress: () => onPress?.(),
    },
    {
      id: 'edit',
      title: 'Edit Project',
      image: Platform.select({ ios: 'pencil', android: 'ic_menu_edit' }),
      onPress: () => onEdit?.(),
    },
    {
      id: 'delete',
      title: 'Delete Project',
      destructive: true,
      image: Platform.select({ ios: 'trash', android: 'ic_menu_delete' }),
      onPress: () => onDelete?.(),
    },
  ];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Project: ${project.name}`}
    >
      {/* Top Row: Icon + Title + Status + Menu */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={[styles.projectIconBadge, { backgroundColor: project.color ? `${project.color}15` : '#176B6715' }]}>
            <Briefcase size={18} color={project.color || colors.primary} />
          </View>
          <View style={styles.titleTextWrapper}>
            <Text style={styles.titleText} numberOfLines={1}>
              {project.name}
            </Text>
            {project.clientName ? (
              <View style={styles.clientRow}>
                <Users size={12} color={colors.textSecondary} />
                <Text style={styles.clientNameText} numberOfLines={1}>
                  {project.clientName}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.topRightWrapper}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: statusColors.bg,
                borderColor: statusColors.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {project.status}
            </Text>
          </View>
          <ThreeDotsMenu
            actions={menuActions}
            iconSize={18}
            iconColor={colors.textSecondary}
            buttonStyle={styles.menuButton}
          />
        </View>
      </View>

      {/* Description if present */}
      {project.description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      {/* Footer Info Row: Dates, Budget, Counts */}
      <View style={styles.footerRow}>
        {project.startDate || project.endDate ? (
          <View style={styles.metaChip}>
            <Calendar size={13} color={colors.textSecondary} />
            <Text style={styles.metaChipText}>
              {project.startDate && project.endDate
                ? `${project.startDate} → ${project.endDate}`
                : project.startDate || project.endDate}
            </Text>
          </View>
        ) : null}

        {formattedBudget ? (
          <View style={[styles.metaChip, styles.budgetChip]}>
            <Text style={styles.budgetText}>{formattedBudget}</Text>
          </View>
        ) : null}

        {project.tasksCount !== undefined && project.tasksCount > 0 ? (
          <View style={styles.metaChip}>
            <CheckSquare size={13} color={colors.textSecondary} />
            <Text style={styles.metaChipText}>{project.tasksCount} Tasks</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  projectIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleTextWrapper: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  clientNameText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topRightWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  metaChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  budgetChip: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  budgetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
});
