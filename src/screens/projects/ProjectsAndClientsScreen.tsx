import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput as RNTextInput,
  RefreshControl,
  Keyboard,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Plus,
  Search,
  X,
  Users,
  FolderKanban,
  CheckCircle2,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useProject } from '../../hooks/useProject';
import { useClient } from '../../hooks/useClient';
import { ProjectCard } from './components/ProjectCard';
import { ProjectItem, ProjectFilterStatus } from './types';
import { ClientItemCard } from '../clients/components/ClientItemCard';
import { ClientFormModal } from '../clients/components/ClientFormModal';
import { ClientItem, ClientFormData } from '../clients/types';

type ClientFilterStatus = 'all' | 'active' | 'completed';

type WorkSectionItem =
  | { type: 'controls'; id: string }
  | { type: 'project'; data: ProjectItem; id: string }
  | { type: 'client'; data: ClientItem; id: string }
  | { type: 'empty'; id: string };

export const ProjectsAndClientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Active sub-tab
  const [topTab, setTopTab] = useState<'projects' | 'clients'>(
    route.params?.initialTab === 'clients' ? 'clients' : 'projects'
  );

  // Projects state
  const {
    projects,
    deleteProject,
    refresh: refreshProjects,
  } = useProject();

  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] =
    useState<ProjectFilterStatus>('all');

  // Clients state
  const {
    clients,
    addClient,
    updateClient,
    deleteClient,
    refresh: refreshClients,
  } = useClient();

  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] =
    useState<ClientFilterStatus>('all');

  // Modal State for Add / Edit Client
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProjects(), refreshClients()]);
    setRefreshing(false);
  }, [refreshProjects, refreshClients]);

  // Statistics calculation
  const inProgressProjectsCount = useMemo(
    () => projects.filter((p) => p.status === 'In Progress').length,
    [projects]
  );
  const activeClientsCount = useMemo(
    () => clients.filter((c) => c.status === 'Active').length,
    [clients]
  );

  // Filtered Projects
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

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((item) => {
      if (clientStatusFilter === 'active' && item.status !== 'Active') return false;
      if (clientStatusFilter === 'completed' && item.status !== 'Completed') return false;

      if (clientSearch.trim().length > 0) {
        const q = clientSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category?.toLowerCase().includes(q);
        const matchesCompany = item.companyName?.toLowerCase().includes(q);
        const matchesEmail = item.email?.toLowerCase().includes(q);
        return matchesName || matchesCategory || matchesCompany || matchesEmail;
      }
      return true;
    });
  }, [clients, clientSearch, clientStatusFilter]);

  // Section data mapping
  const sections = useMemo(() => {
    if (topTab === 'projects') {
      const items: WorkSectionItem[] = [
        { type: 'controls', id: '__controls_projects__' },
      ];
      if (filteredProjects.length === 0) {
        items.push({ type: 'empty', id: '__empty_projects__' });
      } else {
        filteredProjects.forEach((p) => {
          items.push({ type: 'project', data: p, id: p.id });
        });
      }
      return [{ title: 'work_content', data: items }];
    } else {
      const items: WorkSectionItem[] = [
        { type: 'controls', id: '__controls_clients__' },
      ];
      if (filteredClients.length === 0) {
        items.push({ type: 'empty', id: '__empty_clients__' });
      } else {
        filteredClients.forEach((c) => {
          items.push({ type: 'client', data: c, id: c.id });
        });
      }
      return [{ title: 'work_content', data: items }];
    }
  }, [topTab, filteredProjects, filteredClients]);

  // Project action handlers
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

  // Client action handlers
  const handleAddClientPress = () => {
    setEditingClient(null);
    setIsClientModalVisible(true);
  };

  const handleEditClientPress = useCallback((item: ClientItem) => {
    setEditingClient(item);
    setIsClientModalVisible(true);
  }, []);

  const handleDeleteClient = useCallback(
    (item: ClientItem) => {
      Alert.alert(
        'Delete Client',
        `Are you sure you want to remove "${item.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteClient(item.id);
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete client');
              }
            },
          },
        ]
      );
    },
    [deleteClient]
  );

  const getClientActions = useCallback(
    (item: ClientItem) => [
      {
        id: 'details',
        title: 'View Details',
        onPress: () => navigation.navigate('ClientDetail', { clientId: item.id }),
      },
      {
        id: 'edit',
        title: 'Edit Client',
        onPress: () => handleEditClientPress(item),
      },
      {
        id: 'delete',
        title: 'Delete Client',
        destructive: true,
        onPress: () => handleDeleteClient(item),
      },
    ],
    [navigation, handleEditClientPress, handleDeleteClient]
  );

  const handleClientFormSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
        Alert.alert('Client Updated', `"${data.name}" has been updated.`);
      } else {
        await addClient(data);
        Alert.alert('Client Added', `"${data.name}" has been added.`);
      }
      setIsClientModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save client');
    }
  };

  // Work Header Add Button
  const handleTopAddPress = () => {
    if (topTab === 'projects') {
      navigation.navigate('AddEditProject');
    } else {
      handleAddClientPress();
    }
  };

  // Filter chips definitions
  const projectFilterTabs: { label: string; value: ProjectFilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
  ];

  const clientFilterTabs: { label: string; value: ClientFilterStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        /* 1. Header & 2. Statistics Banner scroll up together */
        ListHeaderComponent={
          <View style={styles.headerAndBannerContainer}>
            {/* Work Header */}
            <View style={styles.workHeaderRow}>
              <View>
                <Text style={styles.screenTitle}>Work</Text>
                <Text style={styles.screenSubtitle}>
                  {projects.length} projects • {clients.length} clients
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleTopAddPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add new item"
              >
                <Plus size={22} color={colors.white} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Statistics Banner */}
            <View style={styles.statsBannerContainer}>
              <View style={styles.statsRow}>
                {/* Projects Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'projects' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('projects')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
                      <FolderKanban size={16} color="#4F46E5" />
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statPillText}>
                        {inProgressProjectsCount} In Progress
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>{projects.length}</Text>
                  <Text style={styles.statTitle}>Total Projects</Text>
                </TouchableOpacity>

                {/* Clients Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'clients' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('clients')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
                      <Users size={16} color="#059669" />
                    </View>
                    <View
                      style={[
                        styles.statPill,
                        { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                      ]}
                    >
                      <Text style={[styles.statPillText, { color: '#059669' }]}>
                        {activeClientsCount} Active
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>{clients.length}</Text>
                  <Text style={styles.statTitle}>Client Accounts</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        /* 3. Sticky Tab Switch: Projects vs Clients */
        renderSectionHeader={() => (
          <View style={styles.stickyTabsWrapper}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  topTab === 'projects' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('projects');
                }}
                activeOpacity={0.8}
              >
                <FolderKanban
                  size={16}
                  color={
                    topTab === 'projects' ? colors.primary : colors.textSecondary
                  }
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
                style={[
                  styles.segmentBtn,
                  topTab === 'clients' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('clients');
                }}
                activeOpacity={0.8}
              >
                <Users
                  size={16}
                  color={
                    topTab === 'clients' ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    topTab === 'clients' && styles.segmentBtnTextActive,
                  ]}
                >
                  Clients ({clients.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        /* 4. Selected Tab's Data */
        renderItem={({ item }) => {
          if (item.type === 'controls') {
            if (topTab === 'projects') {
              return (
                <View style={styles.controlsWrapper}>
                  {/* Search Input */}
                  <View style={styles.searchContainer}>
                    <Search size={18} color="#94A3B8" />
                    <RNTextInput
                      style={styles.searchInput}
                      placeholder="Search projects, clients..."
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
              );
            } else {
              return (
                <View style={styles.controlsWrapper}>
                  {/* Search Input */}
                  <View style={styles.searchContainer}>
                    <Search size={18} color="#94A3B8" />
                    <RNTextInput
                      style={styles.searchInput}
                      placeholder="Search clients, company, email..."
                      placeholderTextColor="#94A3B8"
                      value={clientSearch}
                      onChangeText={setClientSearch}
                    />
                    {clientSearch ? (
                      <TouchableOpacity onPress={() => setClientSearch('')}>
                        <X size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Filter Chips */}
                  <View style={styles.filterTabsWrapper}>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={clientFilterTabs}
                      keyExtractor={(chip) => chip.value}
                      contentContainerStyle={styles.filterTabsContent}
                      renderItem={({ item: chip }) => {
                        const isActive = clientStatusFilter === chip.value;
                        const count =
                          chip.value === 'all'
                            ? clients.length
                            : chip.value === 'active'
                            ? clients.filter((c) => c.status === 'Active').length
                            : clients.filter((c) => c.status === 'Completed').length;
                        return (
                          <TouchableOpacity
                            style={[
                              styles.filterChip,
                              isActive && styles.filterChipActive,
                            ]}
                            onPress={() => setClientStatusFilter(chip.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.filterChipText,
                                isActive && styles.filterChipTextActive,
                              ]}
                            >
                              {chip.label} ({count})
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </View>
                </View>
              );
            }
          }

          if (item.type === 'project') {
            return (
              <View style={styles.itemPadding}>
                <ProjectCard
                  project={item.data}
                  onPress={() =>
                    navigation.navigate('ProjectDetail', {
                      projectId: item.data.id,
                    })
                  }
                  onEdit={() =>
                    navigation.navigate('AddEditProject', {
                      projectId: item.data.id,
                      isEdit: true,
                    })
                  }
                  onDelete={() => handleDeleteProject(item.data)}
                />
              </View>
            );
          }

          if (item.type === 'client') {
            return (
              <View style={styles.itemPadding}>
                <ClientItemCard
                  item={item.data}
                  onPress={() =>
                    navigation.navigate('ClientDetail', {
                      clientId: item.data.id,
                    })
                  }
                  actions={getClientActions(item.data)}
                />
              </View>
            );
          }

          if (item.type === 'empty') {
            const isProj = topTab === 'projects';
            return (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  {isProj ? (
                    <FolderKanban size={36} color={colors.primary} />
                  ) : (
                    <Users size={36} color={colors.primary} />
                  )}
                </View>
                <Text style={styles.emptyTitle}>
                  {isProj
                    ? projectSearch
                      ? 'No matching projects'
                      : 'No projects yet'
                    : clientSearch
                    ? 'No matching clients'
                    : 'No clients yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isProj
                    ? projectSearch
                      ? 'Try searching with another keyword or change filter.'
                      : 'Create your first project to track tasks, schedules, and deliverables.'
                    : clientSearch
                    ? 'Try searching with another name or company.'
                    : 'Add clients to organize deals, projects, and billing easily.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={handleTopAddPress}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.white} />
                  <Text style={styles.emptyAddBtnText}>
                    {isProj ? 'Create Project' : 'Add Client'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

          return null;
        }}
      />

      {/* Add / Edit Client Modal */}
      <ClientFormModal
        visible={isClientModalVisible}
        onClose={() => setIsClientModalVisible(false)}
        onSubmit={handleClientFormSubmit}
        initialData={editingClient}
      />
    </View>
  );
};

export default ProjectsAndClientsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 90,
  },
  headerAndBannerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  workHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 12,
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
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  statsBannerContainer: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FAF5FF',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  statPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  stickyTabsWrapper: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
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
  controlsWrapper: {
    paddingTop: 12,
    paddingBottom: 6,
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
    marginBottom: 6,
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
  itemPadding: {
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
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
