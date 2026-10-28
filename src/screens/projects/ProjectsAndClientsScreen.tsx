import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput as RNTextInput,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Search, X, Briefcase, Users, FolderKanban } from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useProject } from '../../hooks/useProject';
import { ProjectCard } from './components/ProjectCard';
import { ProjectItem, ProjectFormData, ProjectFilterStatus } from './types';
import { ClientsScreen } from '../clients/ClientsScreen';

export const ProjectsAndClientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Top bar segmented tab: 'projects' or 'clients'
  const [topTab, setTopTab] = useState<'projects' | 'clients'>('projects');

  // Project state
  const {
    projects,
    loading: projectsLoading,
    deleteProject,
    refresh: refreshProjects,
  } = useProject();

  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectFilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProjects();
    setRefreshing(false);
  }, [refreshProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Status filter
      if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) {
        return false;
      }
      // Search filter
      if (projectSearch.trim().length > 0) {
        const q = projectSearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        const matchesClient = p.clientName?.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesClient;
      }
      return true;
    });
  }, [projects, projectStatusFilter, projectSearch]);


  const handleDeleteProject = useCallback(
    (item: ProjectItem) => {
      Alert.alert(
        'Delete Project',
        `Are you sure you want to delete "${item.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteProject(item.id);
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete project');
              }
            },
          },
        ]
      );
    },
    [deleteProject]
  );

  const filterTabs: { label: string; value: ProjectFilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Segmented Bar: [ Projects | Clients ] */}
      <View style={styles.topSegmentedWrapper}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'projects' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('projects');
            }}
            activeOpacity={0.8}
          >
            <FolderKanban
              size={16}
              color={topTab === 'projects' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'projects' && styles.segmentBtnTextActive,
              ]}
            >
              Projects ({projects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'clients' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('clients');
            }}
            activeOpacity={0.8}
          >
            <Users
              size={16}
              color={topTab === 'clients' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'clients' && styles.segmentBtnTextActive,
              ]}
            >
              Clients
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Selected View */}
      {topTab === 'clients' ? (
        <View style={styles.clientsEmbeddedContainer}>
          <ClientsScreen />
        </View>
      ) : (
        <View style={styles.projectsViewContainer}>
          {/* Projects Header */}
          <View style={styles.projectsHeaderRow}>
            <View>
              <Text style={styles.screenTitle}>Projects</Text>
              <Text style={styles.screenSubtitle}>
                {projects.length} total • {projects.filter((p) => p.status === 'In Progress').length} in progress
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEditProject')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Add project"
            >
              <Plus size={20} color={colors.white} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#94A3B8" />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Search projects, clients..."
              placeholderTextColor="#94A3B8"
              value={projectSearch}
              onChangeText={setProjectSearch}
              clearButtonMode="while-editing"
            />
            {projectSearch ? (
              <TouchableOpacity onPress={() => setProjectSearch('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Status Filter Tabs */}
          <View style={styles.filterTabsWrapper}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterTabs}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.filterTabsContent}
              renderItem={({ item }) => {
                const isActive = projectStatusFilter === item.value;
                return (
                  <TouchableOpacity
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setProjectStatusFilter(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Project List */}
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 90 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
                onEdit={() => navigation.navigate('AddEditProject', { projectId: item.id, isEdit: true })}
                onDelete={() => handleDeleteProject(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <FolderKanban size={36} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>
                  {projectSearch ? 'No matching projects' : 'No projects yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {projectSearch
                    ? 'Try searching with a different keyword or clear filters.'
                    : 'Create your first project to organize tasks, meetings, and invoices.'}
                </Text>
                {!projectSearch ? (
                  <TouchableOpacity
                    style={styles.emptyAddBtn}
                    onPress={() => navigation.navigate('AddEditProject')}
                    activeOpacity={0.8}
                  >
                    <Plus size={16} color={colors.white} />
                    <Text style={styles.emptyAddBtnText}>Create Project</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topSegmentedWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  clientsEmbeddedContainer: {
    flex: 1,
  },
  projectsViewContainer: {
    flex: 1,
  },
  projectsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: '100%',
  },
  filterTabsWrapper: {
    marginTop: 12,
    marginBottom: 4,
  },
  filterTabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
