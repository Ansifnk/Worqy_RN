import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import dayjs from 'dayjs';
import {
  Receipt,
  User,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { Invoice } from '../../invoices/types';

interface ChatInvoiceCardProps {
  invoice: Invoice;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoiceId: string, invoiceNumber: string) => void;
  onOpen: (invoice: Invoice) => void;
  isDeleted?: boolean;
}

const getStatusConfig = (status?: string) => {
  const norm = (status || 'Draft').toLowerCase();

  if (norm === 'paid') {
    return {
      label: 'Paid',
      bg: '#DCFCE7',
      text: '#15803D',
      borderColor: '#BBF7D0',
    };
  }
  if (norm === 'overdue') {
    return {
      label: 'Overdue',
      bg: '#FEE2E2',
      text: '#B91C1C',
      borderColor: '#FECACA',
    };
  }
  if (norm === 'sent' || norm === 'pending') {
    return {
      label: norm === 'sent' ? 'Sent' : 'Pending',
      bg: '#FEF3C7',
      text: '#B45309',
      borderColor: '#FDE68A',
    };
  }
  return {
    label: 'Draft',
    bg: '#F1F5F9',
    text: '#475569',
    borderColor: '#E2E8F0',
  };
};

const formatRupees = (amount?: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const ChatInvoiceCard: React.FC<ChatInvoiceCardProps> = ({
  invoice,
  onEdit,
  onDelete,
  onOpen,
  isDeleted = false,
}) => {
  const statusCfg = getStatusConfig(invoice.status);
  const formattedDueDate = invoice.dueDate
    ? dayjs(invoice.dueDate).format('MMM D, YYYY')
    : 'No due date';

  const displayTotal = formatRupees(invoice.total);

  if (isDeleted) {
    return (
      <View style={[styles.cardContainer, styles.deletedCard]}>
        <View style={styles.deletedRow}>
          <Trash2 size={16} color={colors.textSecondary} />
          <Text style={styles.deletedText}>
            Invoice {invoice.invoiceNumber || ''} was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <Receipt size={18} color="#0D9488" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.invoiceNumber} numberOfLines={1}>
              {invoice.invoiceNumber || 'Invoice'}
            </Text>
          </View>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusTag,
            { backgroundColor: statusCfg.bg, borderColor: statusCfg.borderColor },
          ]}
        >
          <Text style={[styles.statusTagText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountText}>{displayTotal}</Text>
      </View>

      {/* Client Row & Due Date */}
      <View style={styles.metaRow}>
        {Boolean(invoice.clientName) && (
          <View style={styles.metaBadge}>
            <User size={13} color={colors.primary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {invoice.clientName}
            </Text>
          </View>
        )}

        <View style={styles.metaBadge}>
          <Calendar size={13} color={colors.textSecondary} strokeWidth={2} />
          <Text style={styles.metaText}>Due: {formattedDueDate}</Text>
        </View>
      </View>

      {/* Action Buttons Divider & Toolbar */}
      <View style={styles.actionsDivider} />

      <View style={styles.actionsContainer}>
        {/* Edit Button */}
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => onEdit(invoice)}
          activeOpacity={0.7}
          accessibilityLabel="Edit invoice"
        >
          <Edit3 size={13} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.actionBtnEditText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => onDelete(invoice.id, invoice.invoiceNumber)}
          activeOpacity={0.7}
          accessibilityLabel="Delete invoice"
        >
          <Trash2 size={13} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.actionBtnDeleteText}>Delete</Text>
        </TouchableOpacity>

        {/* Open Button */}
        <TouchableOpacity
          style={styles.actionBtnOpen}
          onPress={() => onOpen(invoice)}
          activeOpacity={0.8}
          accessibilityLabel="Open invoice details"
        >
          <ExternalLink size={13} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.actionBtnOpenText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInvoiceCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    backgroundColor: '#F0FDFA',
    padding: 12,
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deletedCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    paddingVertical: 10,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  actionsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.2)',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  actionBtnOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
