import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Alert,
  Text,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../utils/colors';
import ClientsHeader from './components/ClientsHeader';
import ClientSearchBar from './components/ClientSearchBar';
import ClientFilterTabs, { FilterStatus } from './components/ClientFilterTabs';
import ClientItemCard from './components/ClientItemCard';
import ClientFormModal from './components/ClientFormModal';
import { ClientItem, ClientFormData } from './types';
import { useClient } from '../../hooks/useClient';
import { LoadingView } from '../../components/LoadingView';

export const ClientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { clients, loading, error, addClient, updateClient, deleteClient, refresh } = useClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for Add / Edit
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const counts = useMemo(() => {
    const all = clients.length;
    const active = clients.filter((c) => c.status === 'Active').length;
    const completed = clients.filter((c) => c.status === 'Completed').length;
    return { all, active, completed };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((item) => {
      // Filter by tab
      if (activeTab === 'active' && item.status !== 'Active') return false;
      if (activeTab === 'completed' && item.status !== 'Completed') return false;

      // Filter by search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesCompany = item.companyName?.toLowerCase().includes(query);
        const matchesEmail = item.email?.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesCompany || matchesEmail;
      }

      return true;
    });
  }, [clients, searchQuery, activeTab]);

  const handleAddClientPress = () => {
    setEditingClient(null);
    setIsFormModalVisible(true);
  };

  const handleEditClientPress = (item: ClientItem) => {
    setEditingClient(item);
    setIsFormModalVisible(true);
  };

  const handleDeleteClientPress = (item: ClientItem) => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to remove "${item.name}"? This action cannot be undone.`,
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
  };

  const handleClientPress = (item: ClientItem) => {
    Alert.alert(
      item.name,
      `${item.category || item.clientType}\nStatus: ${item.status}\nEmail: ${
        item.email || 'None'
      }\nPhone: ${item.phone || 'None'}`
    );
  };

  const handleOptionsPress = (item: ClientItem) => {
    Alert.alert(item.name, 'Client Options', [
      {
        text: 'View Details',
        onPress: () => handleClientPress(item),
      },
      {
        text: 'Edit Client',
        onPress: () => handleEditClientPress(item),
      },
      {
        text: 'Delete Client',
        style: 'destructive',
        onPress: () => handleDeleteClientPress(item),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data);
        Alert.alert('Client Updated', `"${data.name}" has been updated successfully.`);
      } else {
        await addClient(data);
        Alert.alert('Client Added', `"${data.name}" has been added to your client list.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save client');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 12) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Title and Add Button */}
      <ClientsHeader onAddPress={handleAddClientPress} />

      {/* Search Input Bar */}
      <ClientSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Horizontal Filter Tabs: All, Active, Completed */}
      <ClientFilterTabs
        selectedTab={activeTab}
        onSelectTab={setActiveTab}
        counts={counts}
      />

      {/* Clients List */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClientItemCard
            item={item}
            onPress={() => handleClientPress(item)}
            onOptionsPress={() => handleOptionsPress(item)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom + 80, 100) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          loading ? (
            <LoadingView message="Loading clients..." style={styles.emptyContainer} />
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Unable to load clients</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No clients found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? `No clients matching "${searchQuery}"`
                  : 'No clients available yet. Tap "+ New Client" to add one.'}
              </Text>
            </View>
          )
        }
      />

      {/* Reusable Add / Edit Client Form Modal */}
      <ClientFormModal
        visible={isFormModalVisible}
        onClose={() => setIsFormModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={editingClient}
      />
    </View>
  );
};

export default ClientsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
