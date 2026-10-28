import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Briefcase,
  Users,
  Calendar,
  IndianRupee,
  CheckSquare,
  ListTodo,
  Receipt,
  Plus,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useProject } from '../../hooks/useProject';
import { useTask } from '../../hooks/useTask';
import { useSchedule } from '../../hooks/useSchedule';
import { useInvoice } from '../../hooks/useInvoice';
import { ProjectItem, ProjectFormData } from './types';
import { getProjectStatusColors, formatINR } from './components/ProjectCard';
import ThreeDotsMenu, { ActionMenuItem } from '../../components/ThreeDotsMenu';

type ProjectTabKey = 'overview' | 'tasks' | 'schedules' | 'invoices';

export const ProjectDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { projectId } = route.params || {};

  const { projects, updateProject, deleteProject } = useProject();
  const { tasks, toggleTaskComplete } = useTask();
  const { schedules } = useSchedule();
  const { invoices } = useInvoice();

  const [activeTab, setActiveTab] = useState<ProjectTabKey>('overview');

  const project: ProjectItem | undefined = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  // Associated tasks
  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks.filter(
      (t) =>
        t.projectId === project.id ||
        (t.projectName && t.projectName.trim().toLowerCase() === project.name.trim().toLowerCase()) ||
        (t.project && t.project.trim().toLowerCase() === project.name.trim().toLowerCase())
    );
  }, [tasks, project]);

  // Associated schedules
  const projectSchedules = useMemo(() => {
    if (!project) return [];
    return schedules.filter(
      (s) =>
        s.projectId === project.id ||
        (s.projectName && s.projectName.trim().toLowerCase() === project.name.trim().toLowerCase())
    );
  }, [schedules, project]);

  // Associated invoices
  const projectInvoices = useMemo(() => {
    if (!project) return [];
    return invoices.filter(
      (inv) =>
        inv.projectId === project.id ||
        (inv.projectName && inv.projectName.trim().toLowerCase() === project.name.trim().toLowerCase())
    );
  }, [invoices, project]);

  const taskCompletionRate = useMemo(() => {
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === 'Done').length;
    return Math.round((completed / projectTasks.length) * 100);
  }, [projectTasks]);

  const totalBilled = useMemo(() => {
    return projectInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  }, [projectInvoices]);


  const handleDelete = useCallback(() => {
    if (!project) return;
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  }, [project, deleteProject, navigation]);

  const menuActions: ActionMenuItem[] = [
    {
      id: 'edit',
      title: 'Edit Project',
      image: Platform.select({ ios: 'pencil', android: 'ic_menu_edit' }),
      onPress: () => navigation.navigate('AddEditProject', { projectId: project?.id, isEdit: true }),
    },
    {
      id: 'delete',
      title: 'Delete Project',
      destructive: true,
      image: Platform.select({ ios: 'trash', android: 'ic_menu_delete' }),
      onPress: handleDelete,
    },
  ];

  if (!project) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Project not found or deleted.</Text>
        </View>
      </View>
    );
  }

  const statusColors = getProjectStatusColors(project.status);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Project Details
        </Text>
        <ThreeDotsMenu
          actions={menuActions}
          iconSize={22}
          iconColor={colors.text}
          buttonStyle={styles.moreButton}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroIconBadge, { backgroundColor: project.color ? `${project.color}20` : '#176B6720' }]}>
              <Briefcase size={24} color={project.color || colors.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{project.status}</Text>
            </View>
          </View>

          <Text style={styles.projectName}>{project.name}</Text>

          {project.clientName ? (
            <TouchableOpacity
              style={styles.clientLink}
              onPress={() => {
                if (project.clientId) {
                  navigation.navigate('ClientDetail', { clientId: project.clientId });
                }
              }}
              activeOpacity={0.7}
            >
              <Users size={14} color={colors.primary} />
              <Text style={styles.clientLinkText}>{project.clientName}</Text>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>
          ) : null}

          {project.description ? (
            <Text style={styles.description}>{project.description}</Text>
          ) : null}

          {/* Quick Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Budget</Text>
              <Text style={styles.metricValue}>
                {project.budget ? formatINR(project.budget) : 'Not set'}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Task Progress</Text>
              <Text style={styles.metricValue}>{taskCompletionRate}%</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Invoiced</Text>
              <Text style={styles.metricValue}>{formatINR(totalBilled)}</Text>
            </View>
          </View>

          {/* Timeline */}
          {project.startDate || project.endDate ? (
            <View style={styles.timelineRow}>
              <Calendar size={14} color={colors.textSecondary} />
              <Text style={styles.timelineText}>
                {project.startDate && project.endDate
                  ? `${dayjs(project.startDate).format('DD MMM YYYY')} — ${dayjs(project.endDate).format('DD MMM YYYY')}`
                  : project.startDate
                  ? `Started ${dayjs(project.startDate).format('DD MMM YYYY')}`
                  : `Target ${dayjs(project.endDate).format('DD MMM YYYY')}`}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Segmented Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tasks')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              Tasks ({projectTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'schedules' && styles.tabButtonActive]}
            onPress={() => setActiveTab('schedules')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'schedules' && styles.tabTextActive]}>
              Calendar ({projectSchedules.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'invoices' && styles.tabButtonActive]}
            onPress={() => setActiveTab('invoices')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
              Invoices ({projectInvoices.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Project Tasks</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('TaskDetail', { isNew: true, prefillProject: project.name, prefillProjectId: project.id })}
                style={styles.addMiniBtn}
              >
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addMiniBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>

            {projectTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tasks linked to this project yet.</Text>
              </View>
            ) : (
              projectTasks.slice(0, 3).map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.itemRow}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                >
                  <TouchableOpacity
                    onPress={() => toggleTaskComplete(t.id)}
                    style={[styles.taskCheckbox, t.status === 'Done' && styles.taskCheckboxDone]}
                  >
                    {t.status === 'Done' ? <CheckSquare size={16} color={colors.white} /> : null}
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemTitle, t.status === 'Done' && styles.itemTitleDone]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Text style={styles.itemSub}>{t.dueDate ? dayjs(t.dueDate).format('DD MMM') : 'No due date'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Invoices Preview */}
            <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Linked Invoices</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddEditInvoice', { prefillClientId: project.clientId, prefillClientName: project.clientName })}
                style={styles.addMiniBtn}
              >
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addMiniBtnText}>Create Invoice</Text>
              </TouchableOpacity>
            </View>

            {projectInvoices.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No invoices linked to this project.</Text>
              </View>
            ) : (
              projectInvoices.slice(0, 3).map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={styles.itemRow}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                >
                  <Receipt size={20} color={colors.primary} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{inv.invoiceNumber}</Text>
                    <Text style={styles.itemSub}>{inv.clientName}</Text>
                  </View>
                  <Text style={styles.itemAmount}>{formatINR(inv.total)}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>All Tasks</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('TaskDetail', { isNew: true, prefillProject: project.name, prefillProjectId: project.id })}
                style={styles.addMiniBtn}
              >
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addMiniBtnText}>New Task</Text>
              </TouchableOpacity>
            </View>

            {projectTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tasks created for this project yet.</Text>
              </View>
            ) : (
              projectTasks.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.itemRow}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                >
                  <TouchableOpacity
                    onPress={() => toggleTaskComplete(t.id)}
                    style={[styles.taskCheckbox, t.status === 'Done' && styles.taskCheckboxDone]}
                  >
                    {t.status === 'Done' ? <CheckSquare size={16} color={colors.white} /> : null}
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemTitle, t.status === 'Done' && styles.itemTitleDone]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Text style={styles.itemSub}>Priority: {t.priority} • Due: {t.dueDate ? dayjs(t.dueDate).format('DD MMM') : 'N/A'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'schedules' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Calendar & Meetings</Text>
            </View>

            {projectSchedules.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No meetings or deadlines scheduled for this project.</Text>
              </View>
            ) : (
              projectSchedules.map((s) => (
                <View key={s.id} style={styles.itemRow}>
                  <Clock size={18} color={colors.primary} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{s.title}</Text>
                    <Text style={styles.itemSub}>{dayjs(s.date).format('DD MMM YYYY')} at {s.startTime}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'invoices' && (
          <View style={styles.tabSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Invoices</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddEditInvoice', { prefillClientId: project.clientId, prefillClientName: project.clientName })}
                style={styles.addMiniBtn}
              >
                <Plus size={14} color={colors.primary} />
                <Text style={styles.addMiniBtnText}>New Invoice</Text>
              </TouchableOpacity>
            </View>

            {projectInvoices.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No invoices associated with this project.</Text>
              </View>
            ) : (
              projectInvoices.map((inv) => (
                <TouchableOpacity
                  key={inv.id}
                  style={styles.itemRow}
                  onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                >
                  <Receipt size={20} color={colors.primary} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{inv.invoiceNumber}</Text>
                    <Text style={styles.itemSub}>{inv.status} • {dayjs(inv.issueDate).format('DD MMM YYYY')}</Text>
                  </View>
                  <Text style={styles.itemAmount}>{formatINR(inv.total)}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  moreButton: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  clientLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  clientLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  timelineText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  tabSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addMiniBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  itemSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});
