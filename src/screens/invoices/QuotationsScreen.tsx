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
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Plus,
  Search,
  X,
  FileCheck2,
  FileSpreadsheet,
  ArrowRight,
  MoreVertical,
  Calendar,
  Building2,
  FileQuestion,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';

export type QuoteStatus = 'All' | 'Draft' | 'Sent' | 'Accepted' | 'Declined';

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  clientName: string;
  projectName?: string;
  amount: number;
  currency: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
  issueDate: string;
  validUntil: string;
  notes?: string;
}


interface QuotationsScreenProps {
  embedded?: boolean;
}

export const QuotationsScreen: React.FC<QuotationsScreenProps> = ({ embedded = false }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [quotes, setQuotes] = useState<QuotationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<QuoteStatus>('All');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate slight delay for smooth UX
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  }, []);

  const counts = useMemo(() => {
    const all = quotes.length;
    const sent = quotes.filter((q) => q.status === 'Sent').length;
    const accepted = quotes.filter((q) => q.status === 'Accepted').length;
    const draft = quotes.filter((q) => q.status === 'Draft').length;
    const declined = quotes.filter((q) => q.status === 'Declined').length;
    return { all, sent, accepted, draft, declined };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((item) => {
      if (activeFilter !== 'All' && item.status !== activeFilter) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchNum = item.quotationNumber.toLowerCase().includes(q);
        const matchClient = item.clientName.toLowerCase().includes(q);
        const matchProject = item.projectName?.toLowerCase().includes(q) ?? false;
        return matchNum || matchClient || matchProject;
      }
      return true;
    });
  }, [quotes, activeFilter, searchQuery]);

  const handleAddQuotation = () => {
    Alert.prompt
      ? Alert.prompt(
        'New Quotation',
        'Enter client name for this quote:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create',
            onPress: (clientName?: string) => {
              if (!clientName?.trim()) return;
              const newQ: QuotationItem = {
                id: String(Date.now()),
                quotationNumber: `QTN-2026-00${quotes.length + 1}`,
                clientName: clientName.trim(),
                projectName: 'New Project Proposal',
                amount: 50000,
                currency: '₹',
                status: 'Draft',
                issueDate: new Date().toISOString().split('T')[0],
                validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              };
              setQuotes((prev) => [newQ, ...prev]);
            },
          },
        ],
        'plain-text'
      )
      : Alert.alert('New Quotation', 'Create a new quotation from template or client profile.');
  };

  const handleConvertToInvoice = (quote: QuotationItem) => {
    Alert.alert(
      'Convert to Invoice',
      `Would you like to generate an Invoice from ${quote.quotationNumber} for ${quote.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate Invoice',
          onPress: () => {
            navigation.navigate('AddEditInvoice', {
              isEdit: false,
              initialData: {
                clientName: quote.clientName,
                total: quote.amount,
                note: `Generated from Quotation ${quote.quotationNumber}`,
              },
            });
          },
        },
      ]
    );
  };

  const handleQuoteOptions = (quote: QuotationItem) => {
    Alert.alert(quote.quotationNumber, `Client: ${quote.clientName}`, [
      {
        text: 'Convert to Invoice',
        onPress: () => handleConvertToInvoice(quote),
      },
      {
        text: 'Mark as Accepted',
        onPress: () => {
          setQuotes((prev) =>
            prev.map((q) => (q.id === quote.id ? { ...q, status: 'Accepted' } : q))
          );
        },
      },
      {
        text: 'Mark as Sent',
        onPress: () => {
          setQuotes((prev) =>
            prev.map((q) => (q.id === quote.id ? { ...q, status: 'Sent' } : q))
          );
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getStatusColor = (status: QuotationItem['status']) => {
    switch (status) {
      case 'Accepted':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Sent':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Draft':
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
      case 'Declined':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
    }
  };

  const filterTabs: { label: string; value: QuoteStatus; count: number }[] = [
    { label: 'All', value: 'All', count: counts.all },
    { label: 'Sent', value: 'Sent', count: counts.sent },
    { label: 'Accepted', value: 'Accepted', count: counts.accepted },
    { label: 'Draft', value: 'Draft', count: counts.draft },
    { label: 'Declined', value: 'Declined', count: counts.declined },
  ];

  return (
    <View style={[styles.container, { paddingTop: embedded ? 0 : insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Quotations</Text>
          <Text style={styles.headerSubtitle}>
            {counts.all} estimates • ₹
            {quotes
              .filter((q) => q.status === 'Accepted' || q.status === 'Sent')
              .reduce((sum, q) => sum + q.amount, 0)
              .toLocaleString()}{' '}
            pipeline
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddQuotation}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add quotation"
        >
          <Plus size={22} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#94A3B8" />
        <RNTextInput
          style={styles.searchInput}
          placeholder="Search quote number, client..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterTabs}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterTabsContent}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.value;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {item.label} ({item.count})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Quotations List */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          const statusStyle = getStatusColor(item.status);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleQuoteOptions(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.quoteNumberBadge}>
                  <FileSpreadsheet size={14} color={colors.primary} />
                  <Text style={styles.quoteNumberText}>{item.quotationNumber}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: statusStyle.bg,
                      borderColor: statusStyle.border,
                    },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.clientName}>{item.clientName}</Text>
              {item.projectName ? (
                <Text style={styles.projectName}>{item.projectName}</Text>
              ) : null}

              <View style={styles.cardDivider} />

              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.validUntilLabel}>Valid until</Text>
                  <Text style={styles.validUntilText}>{item.validUntil}</Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Estimated</Text>
                  <Text style={styles.amountValue}>
                    {item.currency}
                    {item.amount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {item.status === 'Accepted' && (
                <TouchableOpacity
                  style={styles.convertBtn}
                  onPress={() => handleConvertToInvoice(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.convertBtnText}>Convert to Invoice</Text>
                  <ArrowRight size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <FileQuestion size={40} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching quotations' : 'No quotations yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term or clear the filter.'
                : 'Create professional estimates & quotes to send to prospective clients.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default QuotationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteNumberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  quoteNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  projectName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validUntilLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  validUntilText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 12,
    gap: 6,
  },
  convertBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  },
});
