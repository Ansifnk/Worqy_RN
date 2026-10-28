import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, FileQuestion } from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useInvoice } from '../../hooks/useInvoice';
import { Invoice, InvoiceFilterStatus, InvoiceStatus } from './types';
import InvoiceSearchBar from './components/InvoiceSearchBar';
import InvoiceFilterTabs from './components/InvoiceFilterTabs';
import InvoiceItemCard from './components/InvoiceItemCard';
import { LoadingView } from '../../components/LoadingView';
import { ActionMenuItem } from '../../components/ThreeDotsMenu';

interface InvoicesScreenProps {
  embedded?: boolean;
}

export const InvoicesScreen: React.FC<InvoicesScreenProps> = ({ embedded = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    invoices,
    loading,
    deleteInvoice,
    updateInvoiceStatus,
    refresh,
  } = useInvoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<InvoiceFilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Dynamic counts for filter pills
  const counts = useMemo(() => {
    const all = invoices.length;
    const draft = invoices.filter((inv) => inv.status === 'Draft').length;
    const sent = invoices.filter((inv) => inv.status === 'Sent').length;
    const paid = invoices.filter((inv) => inv.status === 'Paid').length;
    const overdue = invoices.filter((inv) => inv.status === 'Overdue').length;
    return { all, draft, sent, paid, overdue };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      // Status filter
      if (activeFilter !== 'all' && item.status !== activeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = item.invoiceNumber.toLowerCase().includes(query);
        const matchClient = item.clientName.toLowerCase().includes(query);
        const matchTerms = item.paymentTerms?.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        return matchNumber || matchClient || matchTerms || matchNotes;
      }

      return true;
    });
  }, [invoices, activeFilter, searchQuery]);

  const handleAddInvoice = () => {
    navigation.navigate('AddEditInvoice', { isEdit: false });
  };

  const handleInvoicePress = (item: Invoice) => {
    navigation.navigate('InvoiceDetail', { invoiceId: item.id });
  };

  const handleEditInvoice = (item: Invoice) => {
    navigation.navigate('AddEditInvoice', { invoiceId: item.id, isEdit: true });
  };

  const handleDeleteInvoice = (item: Invoice) => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete "${item.invoiceNumber}" for ${item.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(item.id);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete invoice');
            }
          },
        },
      ]
    );
  };

  const handleChangeStatus = (item: Invoice) => {
    const statuses: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue'];
    Alert.alert(
      'Change Status',
      `Update status for ${item.invoiceNumber}`,
      [
        ...statuses.map((st) => ({
          text: st === item.status ? `✓ ${st}` : st,
          onPress: async () => {
            try {
              await updateInvoiceStatus(item.id, st);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to update status');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleMorePress = (item: Invoice) => {
    Alert.alert(item.invoiceNumber, item.clientName, [
      { text: 'View Details', onPress: () => handleInvoicePress(item) },
      { text: 'Edit Invoice', onPress: () => handleEditInvoice(item) },
      { text: 'Change Status', onPress: () => handleChangeStatus(item) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDeleteInvoice(item),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getInvoiceActions = useCallback(
    (item: Invoice): ActionMenuItem[] => [
      {
        id: 'details',
        title: 'View Details',
        onPress: () => handleInvoicePress(item),
      },
      {
        id: 'edit',
        title: 'Edit Invoice',
        onPress: () => handleEditInvoice(item),
      },
      {
        id: 'status',
        title: 'Change Status',
        subactions: (['Draft', 'Sent', 'Paid', 'Overdue'] as InvoiceStatus[]).map((st) => ({
          id: `status_${st}`,
          title: st,
          state: (st === item.status ? 'on' : 'off') as 'on' | 'off',
          onPress: async () => {
            try {
              await updateInvoiceStatus(item.id, st);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to update status');
            }
          },
        })),
      },
      {
        id: 'delete',
        title: 'Delete Invoice',
        destructive: true,
        onPress: () => handleDeleteInvoice(item),
      },
    ],
    [handleInvoicePress, handleEditInvoice, updateInvoiceStatus, handleDeleteInvoice]
  );

  const handleSortPress = () => {
    Alert.alert('Filter & Sort', 'Select sorting order:', [
      { text: 'Newest to Oldest', onPress: () => { } },
      { text: 'Amount: High to Low', onPress: () => { } },
      { text: 'Amount: Low to High', onPress: () => { } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading && invoices.length === 0) {
    return <LoadingView message="Loading invoices..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: embedded ? 0 : insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddInvoice}
          activeOpacity={0.8}
        >
          <Plus size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <InvoiceSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={handleSortPress}
      />

      {/* Horizontal Filter Tabs */}
      <InvoiceFilterTabs
        activeFilter={activeFilter}
        counts={counts}
        onSelectFilter={setActiveFilter}
      />

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <InvoiceItemCard
            item={item}
            onPress={() => handleInvoicePress(item)}
            actions={getInvoiceActions(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileQuestion size={44} color={colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No results matching "${searchQuery}"`
                : 'Tap the + button to create your first invoice'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default InvoicesScreen;
