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
import {
  Plus,
  Search,
  X,
  FolderKanban,
  ArrowLeft,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useProject } from '../../hooks/useProject';
import { ProjectCard } from './components/ProjectCard';
import { ProjectItem, ProjectFilterStatus } from './types';
import { GlobalQuickSwitcher } from '../../components/GlobalQuickSwitcher';

const projectFilterTabs: { label: string; value: ProjectFilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Planning', value: 'Planning' },
  { label: 'Completed', value: 'Completed' },
  { label: 'On Hold', value: 'On Hold' },
];

export const ProjectsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    projects,
    deleteProject,
    refresh: refreshProjects,
  } = useProject();

  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] =
    useState<ProjectFilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProjects();
    } catch (e) {
      console.warn('Failed to refresh projects:', e);
    } finally {
      setRefreshing(false);
    }
  }, [refreshProjects]);

  const inProgressProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'In Progress').length,
    [projects]
  );

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) {
        return false;
      }
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

  const handleAddProject = () => {
    navigation.navigate('AddEditProject');
  };

  const handleDeleteProject = (project: ProjectItem) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This will also remove all associated tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(project.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                {navigation.canGoBack() && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                  >
                    <ArrowLeft size={20} color={colors.text} strokeWidth={2.4} />
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={styles.screenTitle}>Projects</Text>
                  <Text style={styles.screenSubtitle}>
                    {projects.length} projects • {inProgressProjectsCount} in progress
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddProject}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add new project"
              >
                <Plus size={22} color={colors.white} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#94A3B8" />
              <RNTextInput
                style={styles.searchInput}
                placeholder="Search projects by name, client..."
                placeholderTextColor="#94A3B8"
                value={projectSearch}
                onChangeText={setProjectSearch}
              />
              {projectSearch ? (
                <TouchableOpacity onPress={() => setProjectSearch('')}>
                  <X size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterTabsWrapper}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={projectFilterTabs}
                keyExtractor={(chip) => chip.value}
                contentContainerStyle={styles.filterTabsContent}
                renderItem={({ item: chip }) => {
                  const isActive = projectStatusFilter === chip.value;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        isActive && styles.filterChipActive,
                      ]}
                      onPress={() => setProjectStatusFilter(chip.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && styles.filterChipTextActive,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemPadding}>
            <ProjectCard
              project={item}
              onPress={() =>
                navigation.navigate('ProjectDetail', {
                  projectId: item.id,
                })
              }
              onEdit={() =>
                navigation.navigate('AddEditProject', {
                  projectId: item.id,
                  isEdit: true,
                })
              }
              onDelete={() => handleDeleteProject(item)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <FolderKanban size={32} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>No Projects Found</Text>
            <Text style={styles.emptySubtitle}>
              {projectSearch.trim() || projectStatusFilter !== 'all'
                ? 'Try adjusting your search or filter filters.'
                : 'Get started by creating your first project.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={handleAddProject}
              activeOpacity={0.8}
            >
              <Plus size={16} color={colors.white} />
              <Text style={styles.emptyAddBtnText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <GlobalQuickSwitcher currentRoute="Projects" />
    </View>
  );
};

export default ProjectsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  filterTabsWrapper: {
    marginBottom: 12,
  },
  filterTabsContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  itemPadding: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

