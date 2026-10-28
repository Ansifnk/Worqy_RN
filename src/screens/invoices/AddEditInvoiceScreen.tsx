import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  User,
  Briefcase,
} from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { colors } from '../../utils/colors';
import { useInvoice } from '../../hooks/useInvoice';
import { useClient } from '../../hooks/useClient';
import { useProject } from '../../hooks/useProject';
import { SelectDropdown } from '../../components/SelectDropdown';
import {
  InvoiceStatus,
  InvoiceItem,
  InvoiceFormData,
} from './types';
import { formatCurrency } from './components/InvoiceItemCard';

const PAYMENT_TERMS_OPTIONS = [
  'Due on receipt',
  'Net 7 days',
  'Net 14 days',
  'Net 30 days',
  'Net 60 days',
];

const STATUS_OPTIONS: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue'];

const CLIENT_COLORS = ['#16A34A', '#6366F1', '#059669', '#1F2937', '#0284C7', '#D97706', '#9333EA'];

export const AddEditInvoiceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { invoiceId, isEdit } = route.params || {};

  const { invoices, addInvoice, updateInvoice } = useInvoice();
  const { clients } = useClient();
  const { projects } = useProject();

  const existingInvoice = useMemo(
    () => (invoiceId ? invoices.find((inv) => inv.id === invoiceId) : null),
    [invoices, invoiceId]
  );

  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [issueDate, setIssueDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(14, 'day').format('YYYY-MM-DD'));
  const [paymentTerms, setPaymentTerms] = useState('Net 14 days');
  const [status, setStatus] = useState<InvoiceStatus>('Draft');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', title: 'Consulting Services', quantity: 1, rate: 10000, amount: 10000 },
  ]);
  const [taxRate, setTaxRate] = useState('18');
  const [notes, setNotes] = useState('Thank you for your business!');
  const [saving, setSaving] = useState(false);

  // Picker states
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'issue' | 'due'>('issue');
  const [showClientSelector, setShowClientSelector] = useState(false);

  // Generate a new invoice number if creating fresh
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.invoiceNumber || '');
      setClientName(existingInvoice.clientName || '');
      setClientEmail(existingInvoice.clientEmail || '');
      setClientId(existingInvoice.clientId || '');
      setProjectId(existingInvoice.projectId || '');
      setProjectName(existingInvoice.projectName || '');
      setIssueDate(existingInvoice.issueDate || dayjs().format('YYYY-MM-DD'));
      setDueDate(existingInvoice.dueDate || dayjs().add(14, 'day').format('YYYY-MM-DD'));
      setPaymentTerms(existingInvoice.paymentTerms || 'Net 14 days');
      setStatus(existingInvoice.status || 'Draft');
      setItems(
        existingInvoice.items && existingInvoice.items.length > 0
          ? existingInvoice.items
          : [{ id: '1', title: '', quantity: 1, rate: 0, amount: 0 }]
      );
      setTaxRate(String(existingInvoice.taxRate ?? 18));
      setNotes(existingInvoice.notes ?? 'Thank you for your business!');
    } else {
      // Auto-generate invoice number based on count
      const nextNum = (invoices.length + 19).toString().padStart(3, '0');
      const year = dayjs().year();
      setInvoiceNumber(`INV-${year}-${nextNum}`);
      if (route.params?.prefillClientId) {
        setClientId(route.params.prefillClientId);
        setClientName(route.params.prefillClientName || '');
        setClientEmail(route.params.prefillClientEmail || '');
      }
      if (route.params?.prefillProjectId) {
        setProjectId(route.params.prefillProjectId);
        setProjectName(route.params.prefillProject || '');
      }
    }
  }, [existingInvoice, invoices.length, route.params]);

  // Handle client selection from existing clients
  const handleSelectClient = (c: any) => {
    setClientId(c.id);
    setClientName(c.name || c.companyName || '');
    setClientEmail(c.email || '');
    setShowClientSelector(false);
  };

  // Add line item
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      title: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Update line item
  const handleUpdateItem = (
    index: number,
    field: 'title' | 'quantity' | 'rate',
    val: any
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };

      if (field === 'title') {
        target.title = val;
      } else if (field === 'quantity') {
        const qty = parseFloat(val) || 0;
        target.quantity = qty;
        target.amount = Math.round(qty * (target.rate || 0));
      } else if (field === 'rate') {
        const rate = parseFloat(val) || 0;
        target.rate = rate;
        target.amount = Math.round((target.quantity || 1) * rate);
      }

      copy[index] = target;
      return copy;
    });
  };

  // Delete line item
  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      Alert.alert('Required', 'An invoice must have at least one item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.amount || 0), 0);
  }, [items]);

  const numericTaxRate = parseFloat(taxRate) || 0;
  const taxAmount = Math.round((subtotal * numericTaxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  // Date picker handlers
  const handleOpenDatePicker = (target: 'issue' | 'due') => {
    setDatePickerTarget(target);
    setIsDatePickerOpen(true);
  };

  const handleDateConfirm = (date: Date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    if (datePickerTarget === 'issue') {
      setIssueDate(formatted);
    } else {
      setDueDate(formatted);
    }
    setIsDatePickerOpen(false);
  };

  // Save handler
  const handleSave = async () => {
    if (!invoiceNumber.trim()) {
      Alert.alert('Validation Error', 'Invoice Number is required.');
      return;
    }
    if (!clientName.trim()) {
      Alert.alert('Validation Error', 'Client Name is required.');
      return;
    }
    const hasValidItem = items.some((it) => it.title.trim().length > 0 && it.amount > 0);
    if (!hasValidItem) {
      Alert.alert('Validation Error', 'Please specify at least one valid item with a title and rate.');
      return;
    }

    setSaving(true);

    const randomColor =
      CLIENT_COLORS[Math.floor(Math.random() * CLIENT_COLORS.length)];
    const avatarLetter = (clientName.trim()[0] || 'C').toUpperCase();

    const payload: InvoiceFormData = {
      invoiceNumber: invoiceNumber.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientId: clientId || undefined,
      projectId: projectId || undefined,
      projectName: projectName || undefined,
      issueDate,
      dueDate,
      paymentTerms,
      status,
      items: items.map((it) => ({
        ...it,
        title: it.title.trim() || 'Service Item',
      })),
      subtotal,
      taxRate: numericTaxRate,
      taxAmount,
      total: grandTotal,
      notes: notes.trim(),
      avatarColor: existingInvoice?.avatarColor || randomColor,
      avatarLetter: existingInvoice?.avatarLetter || avatarLetter,
    };

    try {
      if (isEdit && existingInvoice) {
        await updateInvoice(existingInvoice.id, payload);
        Alert.alert('Success', 'Invoice updated successfully!');
      } else {
        await addInvoice(payload);
        Alert.alert('Success', 'Invoice created successfully!');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />

        {/* Top Header */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#1C1917" />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>
            {isEdit ? 'Edit Invoice' : 'New Invoice'}
          </Text>

          <TouchableOpacity
            style={[styles.saveTopBtn, saving ? styles.saveDisabled : undefined]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Invoice Number & Status Row */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Invoice Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Invoice Number</Text>
              <TextInput
                style={styles.textInput}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
                placeholder="INV-2026-001"
                placeholderTextColor="#A8A29E"
              />
            </View>

            {/* Status Pills */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusPillsRow}>
                {STATUS_OPTIONS.map((st) => {
                  const isSelected = status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusPill,
                        isSelected && styles.statusPillActive,
                      ]}
                      onPress={() => setStatus(st)}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isSelected && styles.statusPillTextActive,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Client Details */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionHeader}>Client Information</Text>
              {clients.length > 0 && (
                <TouchableOpacity
                  style={styles.selectExistingBtn}
                  onPress={() => setShowClientSelector(!showClientSelector)}
                >
                  <Text style={styles.selectExistingText}>
                    {showClientSelector ? 'Hide List' : 'Select Client'}
                  </Text>
                  <ChevronDown size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            {showClientSelector && clients.length > 0 && (
              <View style={styles.clientsDropdown}>
                {clients.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.clientDropdownItem}
                    onPress={() => handleSelectClient(c)}
                  >
                    <User size={16} color="#78716C" />
                    <View style={styles.clientDropdownTextContainer}>
                      <Text style={styles.clientDropdownName}>{c.name}</Text>
                      {c.email ? (
                        <Text style={styles.clientDropdownEmail}>{c.email}</Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Name *</Text>
              <TextInput
                style={styles.textInput}
                value={clientName}
                onChangeText={setClientName}
                placeholder="e.g. Bricado"
                placeholderTextColor="#A8A29E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client Email</Text>
              <TextInput
                style={styles.textInput}
                value={clientEmail}
                onChangeText={setClientEmail}
                placeholder="hello@bricado.com"
                placeholderTextColor="#A8A29E"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Optional Project Association */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Associated Project (Optional)</Text>
              <SelectDropdown
                placeholder="Select Project..."
                options={[
                  { label: 'None (No Project)', value: '', description: 'Not linked to any project' },
                  ...projects.map((p) => ({
                    label: p.name + (p.clientName ? ` (${p.clientName})` : ''),
                    value: p.id,
                    description: p.status,
                  })),
                ]}
                value={projectId}
                onChange={(val) => {
                  setProjectId(val);
                  const p = projects.find((item) => item.id === val);
                  setProjectName(p?.name || '');
                  if (p?.clientId && !clientId) {
                    setClientId(p.clientId);
                    setClientName(p.clientName || clientName);
                  }
                }}
                leftIcon={<Briefcase size={18} color="#78716C" />}
                sheetTitle="Select Project"
              />
            </View>
          </View>

          {/* Dates & Terms */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Dates & Terms</Text>

            <View style={styles.datesRow}>
              <View style={[styles.inputGroup, styles.flexCol]}>
                <Text style={styles.inputLabel}>Issue Date</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => handleOpenDatePicker('issue')}
                >
                  <Calendar size={16} color="#78716C" />
                  <Text style={styles.dateValue}>
                    {dayjs(issueDate).format('DD MMM YYYY')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, styles.flexCol]}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity
                  style={styles.dateSelector}
                  onPress={() => handleOpenDatePicker('due')}
                >
                  <Calendar size={16} color="#78716C" />
                  <Text style={styles.dateValue}>
                    {dayjs(dueDate).format('DD MMM YYYY')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Terms */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Terms</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.termsScroll}
              >
                {PAYMENT_TERMS_OPTIONS.map((term) => {
                  const isSelected = paymentTerms === term;
                  return (
                    <TouchableOpacity
                      key={term}
                      style={[
                        styles.termPill,
                        isSelected && styles.termPillActive,
                      ]}
                      onPress={() => setPaymentTerms(term)}
                    >
                      <Text
                        style={[
                          styles.termPillText,
                          isSelected && styles.termPillTextActive,
                        ]}
                      >
                        {term}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Line Items */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionHeader}>Line Items</Text>
              <TouchableOpacity
                style={styles.addItemHeaderBtn}
                onPress={handleAddItem}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={styles.addItemHeaderText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.itemBox}>
                <View style={styles.itemBoxHeader}>
                  <Text style={styles.itemIndexLabel}>Item #{index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.itemTitleInput}
                  value={item.title}
                  onChangeText={(val) => handleUpdateItem(index, 'title', val)}
                  placeholder="Item description (e.g. UI/UX Design)"
                  placeholderTextColor="#A8A29E"
                />

                <View style={styles.itemNumbersRow}>
                  <View style={styles.qtyColumn}>
                    <Text style={styles.subInputLabel}>Qty</Text>
                    <TextInput
                      style={styles.numberInput}
                      value={String(item.quantity || '')}
                      onChangeText={(val) =>
                        handleUpdateItem(index, 'quantity', val)
                      }
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor="#A8A29E"
                    />
                  </View>

                  <View style={styles.rateColumn}>
                    <Text style={styles.subInputLabel}>Unit Price (₹)</Text>
                    <TextInput
                      style={styles.numberInput}
                      value={String(item.rate || '')}
                      onChangeText={(val) =>
                        handleUpdateItem(index, 'rate', val)
                      }
                      keyboardType="numeric"
                      placeholder="10000"
                      placeholderTextColor="#A8A29E"
                    />
                  </View>

                  <View style={styles.totalColumn}>
                    <Text style={styles.subInputLabel}>Total</Text>
                    <Text style={styles.itemRowTotal}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Tax & Financial Totals */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Summary & Tax</Text>

            <View style={styles.summaryItemRow}>
              <Text style={styles.summaryRowLabel}>Subtotal</Text>
              <Text style={styles.summaryRowValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryItemRow}>
              <View style={styles.taxLabelContainer}>
                <Text style={styles.summaryRowLabel}>Tax Rate (%)</Text>
                <TextInput
                  style={styles.taxInput}
                  value={taxRate}
                  onChangeText={setTaxRate}
                  keyboardType="numeric"
                  placeholder="18"
                />
              </View>
              <Text style={styles.summaryRowValue}>{formatCurrency(taxAmount)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryItemRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Thank you for your business!"
              placeholderTextColor="#A8A29E"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving ? styles.saveDisabled : undefined]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEdit ? 'Update Invoice' : 'Create Invoice'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerOpen}
          mode="date"
          date={
            datePickerTarget === 'issue'
              ? dayjs(issueDate).toDate()
              : dayjs(dueDate).toDate()
          }
          onConfirm={handleDateConfirm}
          onCancel={() => setIsDatePickerOpen(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  saveTopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDisabled: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectExistingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectExistingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  clientsDropdown: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clientDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  clientDropdownTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  clientDropdownName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  clientDropdownEmail: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  statusPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
  },
  statusPillActive: {
    backgroundColor: colors.primary,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusPillTextActive: {
    color: colors.white,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexCol: {
    flex: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  termsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  termPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
  },
  termPillActive: {
    backgroundColor: colors.primary,
  },
  termPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  termPillTextActive: {
    color: colors.white,
  },
  addItemHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addItemHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  itemBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemIndexLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  itemTitleInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  itemNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyColumn: {
    flex: 1,
  },
  rateColumn: {
    flex: 2,
    marginHorizontal: 8,
  },
  totalColumn: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  subInputLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemRowTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 6,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taxLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    color: colors.text,
    width: 44,
    textAlign: 'center',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddEditInvoiceScreen;
