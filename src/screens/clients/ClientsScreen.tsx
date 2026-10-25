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
import ClientItemCard from './components/ClientItemCard';
import ClientFormModal from './components/ClientFormModal';
import { ClientItem, ClientFormData } from './types';

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: 'c-1',
    name: 'Bricado',
    category: 'Active Project',
    status: 'Active',
    logoType: 'bricado',
    clientType: 'Company',
    companyName: 'Bricado Group Inc.',
    email: 'contact@bricado.com',
    phone: '+1 (415) 890-2341',
    tags: ['VIP', 'Enterprise'],
    clientSource: 'Referral',
  },
  {
    id: 'c-2',
    name: 'NKT Electronics',
    category: 'Website Development',
    status: 'Active',
    logoType: 'nkt',
    clientType: 'Company',
    companyName: 'NKT Tech Corp',
    email: 'hello@nktelectronics.com',
    phone: '+1 (512) 432-8711',
    tags: ['Long-term'],
    clientSource: 'Website',
  },
  {
    id: 'c-3',
    name: 'Britauria',
    category: 'Mobile App',
    status: 'Completed',
    logoType: 'britauria',
    clientType: 'Company',
    companyName: 'Britauria Labs',
    email: 'team@britauria.io',
    phone: '+44 20 7946 0991',
    tags: ['Completed'],
    clientSource: 'LinkedIn',
  },
  {
    id: 'c-4',
    name: 'Teckito',
    category: 'UI/UX Design',
    status: 'Active',
    logoType: 'teckito',
    clientType: 'Company',
    companyName: 'Teckito Studio',
    email: 'info@teckito.com',
    tags: ['High Priority'],
    clientSource: 'Referral',
  },
  {
    id: 'c-5',
    name: 'Pantone Consultants',
    category: 'Maintenance',
    status: 'Active',
    logoType: 'pantone',
    clientType: 'Company',
    companyName: 'Pantone Global',
    email: 'consult@pantone.com',
    tags: ['Long-term'],
    clientSource: 'Direct Outreach',
  },
  {
    id: 'c-6',
    name: 'Indian Breeze',
    category: 'E-commerce',
    status: 'On Hold',
    logoType: 'indianBreeze',
    clientType: 'Company',
    companyName: 'Indian Breeze Retail Ltd.',
    email: 'support@indianbreeze.in',
    clientSource: 'Website',
  },
  {
    id: 'c-7',
    name: 'Kanshub',
    category: 'Consultation',
    status: 'Active',
    logoType: 'kanshub',
    clientType: 'Company',
    companyName: 'Kanshub Digital',
    email: 'team@kanshub.com',
    clientSource: 'Referral',
  },
  {
    id: 'c-8',
    name: 'Apex Studio',
    category: 'Brand Identity',
    status: 'Active',
    logoType: 'apex',
    clientType: 'Company',
    companyName: 'Apex Creative Co.',
    email: 'design@apexstudio.com',
    tags: ['VIP'],
    clientSource: 'LinkedIn',
  },
  {
    id: 'c-9',
    name: 'Zenith Health',
    category: 'Health Tech Platform',
    status: 'Active',
    logoType: 'zenith',
    clientType: 'Company',
    companyName: 'Zenith Healthcare',
    email: 'info@zenithhealth.org',
    tags: ['Enterprise'],
    clientSource: 'Referral',
  },
  {
    id: 'c-10',
    name: 'Lumina Labs',
    category: 'AI Research',
    status: 'Active',
    logoType: 'lumina',
    clientType: 'Company',
    companyName: 'Lumina AI Inc',
    email: 'research@luminalabs.ai',
    tags: ['High Priority'],
    clientSource: 'Conference',
  },
  {
    id: 'c-11',
    name: 'Nova Robotics',
    category: 'Automation System',
    status: 'Completed',
    logoType: 'nova',
    clientType: 'Company',
    companyName: 'Nova Automations',
    email: 'support@novarobotics.com',
    clientSource: 'Referral',
  },
  {
    id: 'c-12',
    name: 'Solaria Clean',
    category: 'Renewable Energy',
    status: 'Completed',
    logoType: 'solaria',
    clientType: 'Company',
    companyName: 'Solaria Energy Corp',
    email: 'contact@solariaclean.com',
    clientSource: 'Website',
  },
];

export const ClientsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<ClientItem[]>(INITIAL_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');

  // Modal State for Add / Edit
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

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
          onPress: () => {
            setClients((prev) => prev.filter((c) => c.id !== item.id));
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

  const handleFormSubmit = (data: ClientFormData) => {
    if (editingClient) {
      // Edit existing client
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                ...data,
                category:
                  data.companyName ||
                  (data.clientType === 'Company' ? 'Enterprise' : 'Personal Client'),
              }
            : c
        )
      );
      Alert.alert('Client Updated', `"${data.name}" has been updated successfully.`);
    } else {
      // Add new client
      const newClient: ClientItem = {
        ...data,
        id: `client-${Date.now()}`,
        category:
          data.companyName ||
          (data.clientType === 'Company' ? 'Enterprise' : 'Personal Client'),
        logoType: 'custom',
      };
      setClients((prev) => [newClient, ...prev]);
      Alert.alert('Client Added', `"${data.name}" has been added to your client list.`);
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
