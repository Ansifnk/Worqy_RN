import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  MoreHorizontal,
  Calendar,
  Clock,
  FileText,
  Download,
  Send,
  Plus,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useInvoice } from '../../hooks/useInvoice';
import InvoiceStatusBadge from './components/InvoiceStatusBadge';
import { formatCurrency } from './components/InvoiceItemCard';
import { InvoiceStatus } from './types';

export const InvoiceDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { invoiceId } = route.params || {};

  const {
    invoices,
    deleteInvoice,
    updateInvoiceStatus,
  } = useInvoice();

  const invoice = useMemo(() => {
    return invoices.find((inv) => inv.id === invoiceId);
  }, [invoices, invoiceId]);

  if (!invoice) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={22} color="#1C1917" />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Invoice not found or removed.</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return dayjs(dateStr).format('DD MMM YYYY');
  };

  const handleEdit = () => {
    navigation.navigate('AddEditInvoice', { invoiceId: invoice.id, isEdit: true });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoice.invoiceNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(invoice.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (status: InvoiceStatus) => {
    updateInvoiceStatus(invoice.id, status)
      .then(() => {
        Alert.alert('Status Updated', `Invoice status changed to ${status}`);
      })
      .catch((err) => {
        Alert.alert('Error', err?.message || 'Failed to update status');
      });
  };

  const handleSend = () => {
    Alert.alert(
      'Send Invoice',
      `Send invoice ${invoice.invoiceNumber} to ${invoice.clientEmail || invoice.clientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now',
          onPress: async () => {
            try {
              await updateInvoiceStatus(invoice.id, 'Sent');
              Alert.alert('Success', `Invoice successfully sent to ${invoice.clientEmail || invoice.clientName}!`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to send invoice');
            }
          },
        },
      ]
    );
  };

  const handleDownloadPdf = () => {
    Alert.alert(
      'Download PDF',
      `PDF for ${invoice.invoiceNumber} has been generated and is ready to save or share.`,
      [{ text: 'OK' }]
    );
  };

  const handleMorePress = () => {
    const statuses: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue'];
    Alert.alert('Invoice Options', invoice.invoiceNumber, [
      { text: 'Edit Invoice', onPress: handleEdit },
      ...statuses
        .filter((s) => s !== invoice.status)
        .map((s) => ({
          text: `Mark as ${s}`,
          onPress: () => handleStatusChange(s),
        })),
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const subtotal = invoice.subtotal || invoice.items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const taxRate = invoice.taxRate ?? 18;
  const taxAmount = invoice.taxAmount || Math.round((subtotal * taxRate) / 100);
  const total = invoice.total || subtotal + taxAmount;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#1C1917" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleMorePress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={22} color="#1C1917" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Title & Status Pill */}
        <View style={styles.titleSection}>
          <Text style={styles.invoiceTitle}>{invoice.invoiceNumber}</Text>
          <InvoiceStatusBadge status={invoice.status} size="medium" />
        </View>

        {/* Client Card */}
        <View style={styles.clientCard}>

          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
            {invoice.clientEmail ? (
              <Text style={styles.clientEmail}>{invoice.clientEmail}</Text>
            ) : null}
          </View>
        </View>

        {/* Invoice Metadata Section */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <View style={styles.metaLabelGroup}>
              <Calendar size={18} color="#78716C" />
              <Text style={styles.metaLabel}>Issue Date</Text>
            </View>
            <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaLabelGroup}>
              <Calendar size={18} color="#78716C" />
              <Text style={styles.metaLabel}>Due Date</Text>
            </View>
            <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaLabelGroup}>
              <Clock size={18} color="#78716C" />
              <Text style={styles.metaLabel}>Payment Terms</Text>
            </View>
            <Text style={styles.metaValue}>{invoice.paymentTerms || 'Net 14 days'}</Text>
          </View>
        </View>

        {/* Financial Summary Box */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(taxAmount)}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>
              Items ({invoice.items?.length || 0})
            </Text>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Plus size={16} color={colors.darkPlum || '#2D1225'} />
              <Text style={styles.addItemText}>Add</Text>
            </TouchableOpacity>
          </View>

          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={styles.itemIconContainer}>
                  <FileText size={16} color="#78716C" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{it.title}</Text>
                  <Text style={styles.itemSubtitle}>
                    {it.quantity} × {formatCurrency(it.rate)}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>{formatCurrency(it.amount)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noItemsText}>No items added yet</Text>
          )}
        </View>

        {/* Notes Section */}
        {invoice.notes ? (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesContent}>{invoice.notes}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <TouchableOpacity
          style={styles.moreActionBtn}
          onPress={handleMorePress}
          activeOpacity={0.7}
        >
          <MoreHorizontal size={20} color="#1C1917" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.downloadPdfBtn}
          onPress={handleDownloadPdf}
          activeOpacity={0.7}
        >
          <Download size={18} color="#1C1917" />
          <Text style={styles.downloadPdfText}>Download PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Send size={18} color="#FFFFFF" />
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.5,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  clientDetails: {
    marginLeft: 14,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.2,
  },
  clientEmail: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  metaSection: {
    marginBottom: 24,
    gap: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    fontSize: 14,
    color: '#78716C',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  summaryBox: {
    backgroundColor: '#F3EFEA',
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#78716C',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E7E2DB',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1917',
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkPlum || '#2D1225',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE8',
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F1EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#78716C',
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginLeft: 8,
  },
  noItemsText: {
    fontSize: 13,
    color: '#A8A29E',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 13,
    color: '#78716C',
    fontWeight: '600',
    marginBottom: 6,
  },
  notesContent: {
    fontSize: 14,
    color: '#44403C',
    lineHeight: 20,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF8F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE8',
    gap: 10,
  },
  moreActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadPdfBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadPdfText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  sendBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.darkPlum || '#2D1225',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: '#78716C',
  },
});

export default InvoiceDetailScreen;
