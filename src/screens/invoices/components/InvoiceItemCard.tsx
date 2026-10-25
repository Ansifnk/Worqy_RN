import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { Invoice } from '../types';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';

interface InvoiceItemCardProps {
  item: Invoice;
  onPress: () => void;
  onMorePress?: () => void;
  actions?: ActionMenuItem[];
}

export const formatCurrency = (amount: number): string => {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
};

export const InvoiceItemCard: React.FC<InvoiceItemCardProps> = ({
  item,
  onPress,
  onMorePress,
  actions,
}) => {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>


        {/* Middle Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.invoiceNumber} numberOfLines={1}>
            {item.invoiceNumber}
          </Text>
          <Text style={styles.clientName} numberOfLines={1}>
            {item.clientName}
          </Text>
        </View>

        {/* Right Info: Amount & Status Badge */}
        <View style={styles.amountStatusContainer}>
          <Text style={styles.amountText}>
            {formatCurrency(item.subtotal || item.total)}
          </Text>
          <View style={styles.badgeWrapper}>
            <InvoiceStatusBadge status={item.status} size="small" />
          </View>
        </View>

        {/* More options */}
        {actions && actions.length > 0 ? (
          <ThreeDotsMenu
            actions={actions}
            title={item.invoiceNumber}
            iconSize={18}
            iconColor={colors.textSecondary}
            buttonStyle={styles.moreButton}
          />
        ) : (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={onMorePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  clientName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  amountStatusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 6,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  badgeWrapper: {
    alignItems: 'flex-end',
  },
  moreButton: {
    padding: 4,
    marginLeft: 2,
  },
});

export default InvoiceItemCard;
