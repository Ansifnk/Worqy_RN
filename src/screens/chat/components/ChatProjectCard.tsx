import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Briefcase,
  Users,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ProjectItem } from '../../projects/types';
import { getProjectStatusColors, formatINR } from '../../projects/components/ProjectCard';

interface ChatProjectCardProps {
  project: ProjectItem;
  onEdit: (project: ProjectItem) => void;
  onDelete: (projectId: string, projectName: string) => void;
  onOpen: (project: ProjectItem) => void;
  isDeleted?: boolean;
}

export const ChatProjectCard: React.FC<ChatProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onOpen,
  isDeleted = false,
}) => {
  const statusCfg = getProjectStatusColors(project.status);
  const formattedBudget = formatINR(project.budget);

  if (isDeleted) {
    return (
      <View style={[styles.cardContainer, styles.deletedCard]}>
        <View style={styles.deletedRow}>
          <Trash2 size={16} color={colors.textSecondary} />
          <Text style={styles.deletedText}>
            Project &quot;{project.name || ''}&quot; was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Briefcase size={18} color="#176B67" strokeWidth={2.2} />
          </View>
          <View style={styles.projectTitleWrapper}>
            <Text style={styles.projectName} numberOfLines={1}>
              {project.name}
            </Text>
            {project.clientName ? (
              <View style={styles.clientSubtitleRow}>
                <Users size={12} color={colors.textSecondary} />
                <Text style={styles.clientSubtitle} numberOfLines={1}>
                  {project.clientName}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusCfg.bg,
              borderColor: statusCfg.border,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusCfg.text }]}>
            {project.status}
          </Text>
        </View>
      </View>

      {/* Description */}
      {project.description ? (
        <Text style={styles.descriptionText} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      {/* Metrics Row: Dates, Budget */}
      <View style={styles.metaRow}>
        {project.startDate || project.endDate ? (
          <View style={styles.metaChip}>
            <Calendar size={12} color="#64748B" />
            <Text style={styles.metaText}>
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
      </View>

      {/* Card Actions */}
      <View style={styles.actionsFooter}>
        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => onOpen(project)}
          activeOpacity={0.7}
        >
          <ExternalLink size={13} color={colors.primary} />
          <Text style={styles.openBtnText}>View Details</Text>
        </TouchableOpacity>

        <View style={styles.actionButtonsRight}>
          <TouchableOpacity
            style={styles.actionMiniBtn}
            onPress={() => onEdit(project)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#475569" />
            <Text style={styles.actionMiniText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionMiniBtn, styles.deleteMiniBtn]}
            onPress={() => onDelete(project.id, project.name)}
            activeOpacity={0.7}
          >
            <Trash2 size={13} color="#DC2626" />
            <Text style={[styles.actionMiniText, styles.deleteMiniText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  deletedCard: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  projectTitleWrapper: {
    flex: 1,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  clientSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  clientSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 12,
    color: '#64748B',
    paddingHorizontal: 12,
    paddingBottom: 8,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  metaText: {
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
  actionsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFBFD',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  actionMiniText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  deleteMiniBtn: {
    backgroundColor: '#FEF2F2',
  },
  deleteMiniText: {
    color: '#DC2626',
  },
});
