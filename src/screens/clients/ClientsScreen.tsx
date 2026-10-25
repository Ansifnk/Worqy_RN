import React, { useState, useMemo } from 'react';
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
import ClientItemCard, { ClientItem } from './components/ClientItemCard';

const CLIENTS_DATA: ClientItem[] = [
  {
    id: 'c-1',
    name: 'Bricado',
    category: 'Active Project',
    status: 'Active',
    logoType: 'bricado',
  },
  {
    id: 'c-2',
    name: 'NKT Electronics',
    category: 'Website Development',
    status: 'Active',
    logoType: 'nkt',
  },
  {
    id: 'c-3',
    name: 'Britauria',
    category: 'Mobile App',
    status: 'Completed',
    logoType: 'britauria',
  },
  {
    id: 'c-4',
    name: 'Teckito',
    category: 'UI/UX Design',
    status: 'Active',
    logoType: 'teckito',
  },
  {
    id: 'c-5',
    name: 'Pantone Consultants',
    category: 'Maintenance',
    status: 'Active',
    logoType: 'pantone',
  },
  {
    id: 'c-6',
    name: 'Indian Breeze',
    category: 'E-commerce',
    status: 'On Hold',
    logoType: 'indianBreeze',
  },
  {
    id: 'c-7',
    name: 'Kanshub',
    category: 'Consultation',
    status: 'Active',
    logoType: 'kanshub',
  },
  {
    id: 'c-8',
    name: 'Apex Studio',
    category: 'Brand Identity',
    status: 'Active',
    logoType: 'apex',
  },
  {
    id: 'c-9',
    name: 'Zenith Health',
    category: 'Health Tech Platform',
    status: 'Active',
    logoType: 'zenith',
  },
  {
    id: 'c-10',
    name: 'Lumina Labs',
    category: 'AI Research',
    status: 'Active',
    logoType: 'lumina',
  },
  {
    id: 'c-11',
    name: 'Nova Robotics',
    category: 'Automation System',
    status: 'Completed',
    logoType: 'nova',
  },
  {
    id: 'c-12',
    name: 'Solaria Clean',
    category: 'Renewable Energy',
    status: 'Completed',
    logoType: 'solaria',
  },
];

export const ClientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');

  const counts = useMemo(() => {
    const all = CLIENTS_DATA.length;
    const active = CLIENTS_DATA.filter((c) => c.status === 'Active').length;
    const completed = CLIENTS_DATA.filter((c) => c.status === 'Completed').length;
    return { all, active, completed };
  }, []);

  const filteredClients = useMemo(() => {
    return CLIENTS_DATA.filter((item) => {
      // Filter by tab
      if (activeTab === 'active' && item.status !== 'Active') return false;
      if (activeTab === 'completed' && item.status !== 'Completed') return false;

      // Filter by search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        return matchesName || matchesCategory;
      }

      return true;
    });
  }, [searchQuery, activeTab]);

  const handleAddClientPress = () => {
    // Just a placeholder button per user instructions - no screen or action
    Alert.alert('Add Client', 'Add Client functionality will be implemented soon.');
  };

  const handleClientPress = (item: ClientItem) => {
    Alert.alert(item.name, `${item.category}\nStatus: ${item.status}`);
  };

  const handleOptionsPress = (item: ClientItem) => {
    Alert.alert(item.name, 'Client Actions', [
      { text: 'View Details', onPress: () => {} },
      { text: 'Edit Client', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? `No clients matching "${searchQuery}"`
                : 'No clients available in this category'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default ClientsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.warmBackground || '#FAF8F5',
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
    color: '#1C1917',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8A847E',
    textAlign: 'center',
  },
});
