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
  Wallet,
  FileSpreadsheet,
  FileQuestion,
  ArrowRight,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useInvoice } from '../../hooks/useInvoice';
import { Invoice, InvoiceFilterStatus, InvoiceStatus } from './types';
import InvoiceSearchBar from './components/InvoiceSearchBar';
import InvoiceFilterTabs from './components/InvoiceFilterTabs';
import InvoiceItemCard from './components/InvoiceItemCard';
import { QuotationItem, QuoteStatus } from './QuotationsScreen';

type FinanceSectionItem =
  | { type: 'controls'; id: string }
  | { type: 'invoice'; data: Invoice; id: string }
  | { type: 'quotation'; data: QuotationItem; id: string }
  | { type: 'empty'; id: string };



export const FinanceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Active sub-tab
  const [topTab, setTopTab] = useState<'invoices' | 'quotations'>(
    route.params?.initialTab === 'quotations' ? 'quotations' : 'invoices'
  );

  // Invoices state
  const {
    invoices,
    deleteInvoice,
    updateInvoiceStatus,
    refresh: refreshInvoices,
  } = useInvoice();

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] =
    useState<InvoiceFilterStatus>('all');

  // Quotations state
  const [quotes, setQuotes] = useState<QuotationItem[]>([]);
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<QuoteStatus>('All');

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshInvoices();
    setRefreshing(false);
  }, [refreshInvoices]);

  // Invoice dynamic counts
  const invoiceCounts = useMemo(() => {
    const all = invoices.length;
    const draft = invoices.filter((inv) => inv.status === 'Draft').length;
    const sent = invoices.filter((inv) => inv.status === 'Sent').length;
    const paid = invoices.filter((inv) => inv.status === 'Paid').length;
    const overdue = invoices.filter((inv) => inv.status === 'Overdue').length;
    return { all, draft, sent, paid, overdue };
  }, [invoices]);

  // Quotation dynamic counts
  const quoteCounts = useMemo(() => {
    const all = quotes.length;
    const sent = quotes.filter((q) => q.status === 'Sent').length;
    const accepted = quotes.filter((q) => q.status === 'Accepted').length;
    const draft = quotes.filter((q) => q.status === 'Draft').length;
    const declined = quotes.filter((q) => q.status === 'Declined').length;
    return { all, sent, accepted, draft, declined };
  }, [quotes]);

  // Statistics calculation
  const totalInvoicedAmount = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0),
    [invoices]
  );
  const totalPipelineAmount = useMemo(
    () =>
      quotes
        .filter((q) => q.status === 'Accepted' || q.status === 'Sent')
        .reduce((sum, q) => sum + (Number(q.amount) || 0), 0),
    [quotes]
  );

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      if (invoiceStatusFilter !== 'all' && item.status !== invoiceStatusFilter) {
        return false;
      }
      if (invoiceSearch.trim().length > 0) {
        const query = invoiceSearch.toLowerCase().trim();
        const matchNum = item.invoiceNumber.toLowerCase().includes(query);
        const matchClient = item.clientName.toLowerCase().includes(query);
        const matchProject = item.projectName?.toLowerCase().includes(query) ?? false;
        return matchNum || matchClient || matchProject;
      }
      return true;
    });
  }, [invoices, invoiceStatusFilter, invoiceSearch]);

  // Filtered Quotations
  const filteredQuotes = useMemo(() => {
    return quotes.filter((item) => {
      if (quoteStatusFilter !== 'All' && item.status !== quoteStatusFilter) {
        return false;
      }
      if (quoteSearch.trim().length > 0) {
        const q = quoteSearch.toLowerCase().trim();
        const matchNum = item.quotationNumber.toLowerCase().includes(q);
        const matchClient = item.clientName.toLowerCase().includes(q);
        const matchProject = item.projectName?.toLowerCase().includes(q) ?? false;
        return matchNum || matchClient || matchProject;
      }
      return true;
    });
  }, [quotes, quoteStatusFilter, quoteSearch]);

  // Section data mapping for SectionList
  const sections = useMemo(() => {
    if (topTab === 'invoices') {
      const items: FinanceSectionItem[] = [
        { type: 'controls', id: '__controls_invoices__' },
      ];
      if (filteredInvoices.length === 0) {
        items.push({ type: 'empty', id: '__empty_invoices__' });
      } else {
        filteredInvoices.forEach((inv) => {
          items.push({ type: 'invoice', data: inv, id: inv.id });
        });
      }
      return [{ title: 'finance_content', data: items }];
    } else {
      const items: FinanceSectionItem[] = [
        { type: 'controls', id: '__controls_quotes__' },
      ];
      if (filteredQuotes.length === 0) {
        items.push({ type: 'empty', id: '__empty_quotes__' });
      } else {
        filteredQuotes.forEach((q) => {
          items.push({ type: 'quotation', data: q, id: q.id });
        });
      }
      return [{ title: 'finance_content', data: items }];
    }
  }, [topTab, filteredInvoices, filteredQuotes]);

  // Invoice action handlers
  const handleInvoicePress = useCallback(
    (item: Invoice) => {
      navigation.navigate('InvoiceDetail', { invoiceId: item.id });
    },
    [navigation]
  );

  const handleEditInvoice = useCallback(
    (item: Invoice) => {
      navigation.navigate('AddEditInvoice', { invoiceId: item.id, isEdit: true });
    },
    [navigation]
  );

  const handleDeleteInvoice = useCallback(
    (item: Invoice) => {
      Alert.alert(
        'Delete Invoice',
        `Are you sure you want to delete invoice "${item.invoiceNumber}"?`,
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
    },
    [deleteInvoice]
  );

  const getInvoiceActions = useCallback(
    (item: Invoice) => [
      {
        id: 'view',
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

  // Quotation action handlers
  const handleConvertToInvoice = (quote: QuotationItem) => {
    Alert.alert(
      'Convert to Invoice',
      `Generate an Invoice from ${quote.quotationNumber} for ${quote.clientName}?`,
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
                projectName: 'Proposal Estimate',
                amount: 60000,
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
      : Alert.alert('New Quotation', 'Creating quotation estimate proposal.');
  };

  const handleTopAddPress = () => {
    if (topTab === 'invoices') {
      navigation.navigate('AddEditInvoice', { isEdit: false });
    } else {
      handleAddQuotation();
    }
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

  const quoteFilterTabs: { label: string; value: QuoteStatus; count: number }[] = [
    { label: 'All', value: 'All', count: quoteCounts.all },
    { label: 'Sent', value: 'Sent', count: quoteCounts.sent },
    { label: 'Accepted', value: 'Accepted', count: quoteCounts.accepted },
    { label: 'Draft', value: 'Draft', count: quoteCounts.draft },
    { label: 'Declined', value: 'Declined', count: quoteCounts.declined },
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
        /* 1. Finance Header & 2. Statistics Banner scroll up together */
        ListHeaderComponent={
          <View style={styles.headerAndBannerContainer}>
            {/* Finance Header */}
            <View style={styles.financeHeaderRow}>
              <View>
                <Text style={styles.screenTitle}>Finance</Text>
                <Text style={styles.screenSubtitle}>
                  {invoices.length} invoices • {quotes.length} quotations
                </Text>
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleTopAddPress}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Add invoice or quotation"
              >
                <Plus size={22} color={colors.white} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Statistics Banner */}
            <View style={styles.statsBannerContainer}>
              <View style={styles.statsRow}>
                {/* Invoices Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'invoices' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('invoices')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
                      <Wallet size={16} color="#059669" />
                    </View>
                    <View
                      style={[
                        styles.statPill,
                        { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
                      ]}
                    >
                      <Text style={[styles.statPillText, { color: '#059669' }]}>
                        {invoiceCounts.paid} Paid
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>
                    ₹{totalInvoicedAmount >= 1000 ? `${(totalInvoicedAmount / 1000).toFixed(0)}k` : totalInvoicedAmount}
                  </Text>
                  <Text style={styles.statTitle}>Invoiced Total</Text>
                </TouchableOpacity>

                {/* Quotations Card */}
                <TouchableOpacity
                  style={[
                    styles.statCard,
                    topTab === 'quotations' && styles.statCardSelected,
                  ]}
                  onPress={() => setTopTab('quotations')}
                  activeOpacity={0.85}
                >
                  <View style={styles.statCardHeader}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#EEF2FF' }]}>
                      <FileSpreadsheet size={16} color="#4F46E5" />
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statPillText}>
                        {quoteCounts.accepted} Accepted
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statNumber}>
                    ₹{totalPipelineAmount >= 1000 ? `${(totalPipelineAmount / 1000).toFixed(0)}k` : totalPipelineAmount}
                  </Text>
                  <Text style={styles.statTitle}>Pipeline Value</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        /* 3. Sticky Tab Switch: Invoices vs Quotations */
        renderSectionHeader={() => (
          <View style={styles.stickyTabsWrapper}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  topTab === 'invoices' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('invoices');
                }}
                activeOpacity={0.8}
              >
                <Wallet
                  size={16}
                  color={
                    topTab === 'invoices' ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    topTab === 'invoices' && styles.segmentBtnTextActive,
                  ]}
                >
                  Invoices ({invoices.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  topTab === 'quotations' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setTopTab('quotations');
                }}
                activeOpacity={0.8}
              >
                <FileSpreadsheet
                  size={16}
                  color={
                    topTab === 'quotations' ? colors.primary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    topTab === 'quotations' && styles.segmentBtnTextActive,
                  ]}
                >
                  Quotations ({quotes.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        /* 4. Selected Tab's Data */
        renderItem={({ item }) => {
          if (item.type === 'controls') {
            if (topTab === 'invoices') {
              return (
                <View style={styles.controlsWrapper}>
                  {/* Search Bar */}
                  <InvoiceSearchBar
                    value={invoiceSearch}
                    onChangeText={setInvoiceSearch}
                  />

                  {/* Filter Tabs */}
                  <InvoiceFilterTabs
                    activeFilter={invoiceStatusFilter}
                    counts={invoiceCounts}
                    onSelectFilter={setInvoiceStatusFilter}
                  />
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
                      placeholder="Search quote number, client..."
                      placeholderTextColor="#94A3B8"
                      value={quoteSearch}
                      onChangeText={setQuoteSearch}
                    />
                    {quoteSearch ? (
                      <TouchableOpacity onPress={() => setQuoteSearch('')}>
                        <X size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Filter Chips */}
                  <View style={styles.filterTabsWrapper}>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={quoteFilterTabs}
                      keyExtractor={(chip) => chip.value}
                      contentContainerStyle={styles.filterTabsContent}
                      renderItem={({ item: chip }) => {
                        const isActive = quoteStatusFilter === chip.value;
                        return (
                          <TouchableOpacity
                            style={[
                              styles.filterChip,
                              isActive && styles.filterChipActive,
                            ]}
                            onPress={() => setQuoteStatusFilter(chip.value)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.filterChipText,
                                isActive && styles.filterChipTextActive,
                              ]}
                            >
                              {chip.label} ({chip.count})
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

          if (item.type === 'invoice') {
            return (
              <View style={styles.itemPadding}>
                <InvoiceItemCard
                  item={item.data}
                  onPress={() => handleInvoicePress(item.data)}
                  actions={getInvoiceActions(item.data)}
                />
              </View>
            );
          }

          if (item.type === 'quotation') {
            const statusStyle = getStatusColor(item.data.status);
            return (
              <View style={styles.itemPadding}>
                <TouchableOpacity
                  style={styles.quoteCard}
                  onPress={() => handleQuoteOptions(item.data)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.quoteNumberBadge}>
                      <FileSpreadsheet size={14} color={colors.primary} />
                      <Text style={styles.quoteNumberText}>
                        {item.data.quotationNumber}
                      </Text>
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
                        {item.data.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.clientName}>{item.data.clientName}</Text>
                  {item.data.projectName ? (
                    <Text style={styles.projectName}>{item.data.projectName}</Text>
                  ) : null}

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.validUntilLabel}>Valid until</Text>
                      <Text style={styles.validUntilText}>{item.data.validUntil}</Text>
                    </View>

                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>Estimated</Text>
                      <Text style={styles.amountValue}>
                        {item.data.currency}
                        {item.data.amount.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {item.data.status === 'Accepted' && (
                    <TouchableOpacity
                      style={styles.convertBtn}
                      onPress={() => handleConvertToInvoice(item.data)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.convertBtnText}>Convert to Invoice</Text>
                      <ArrowRight size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            );
          }

          if (item.type === 'empty') {
            const isInvoices = topTab === 'invoices';
            return (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  {isInvoices ? (
                    <Wallet size={36} color={colors.primary} />
                  ) : (
                    <FileQuestion size={36} color={colors.primary} />
                  )}
                </View>
                <Text style={styles.emptyTitle}>
                  {isInvoices
                    ? invoiceSearch
                      ? 'No matching invoices'
                      : invoiceStatusFilter !== 'all'
                        ? `No ${invoiceStatusFilter} invoices`
                        : 'No invoices yet'
                    : quoteSearch
                      ? 'No matching quotations'
                      : 'No quotations yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {isInvoices
                    ? invoiceSearch
                      ? 'Try adjusting your search query.'
                      : 'Create your first invoice to bill clients and receive payments.'
                    : quoteSearch
                      ? 'Try searching with another quote number or client name.'
                      : 'Create professional estimates & quotes to send to prospective clients.'}
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={handleTopAddPress}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.white} />
                  <Text style={styles.emptyAddBtnText}>
                    {isInvoices ? 'Create Invoice' : 'Create Quotation'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }

          return null;
        }}
      />
    </View>
  );
};

export default FinanceScreen;

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
  financeHeaderRow: {
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
    paddingTop: 4,
    paddingBottom: 4,
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
  quoteCard: {
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
    paddingTop: 50,
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
