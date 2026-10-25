import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { ClientLogo } from './ClientLogos';
import { colors } from '../../../utils/colors';
import { ClientItem, ClientStatus } from '../types';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';

export type { ClientItem, ClientStatus };

interface ClientItemCardProps {
  item: ClientItem;
  onPress?: () => void;
  onOptionsPress?: () => void;
  actions?: ActionMenuItem[];
}

export const ClientItemCard: React.FC<ClientItemCardProps> = ({
  item,
  onPress,
  onOptionsPress,
  actions,
}) => {
  const getBadgeStyle = () => {
    switch (item.status) {
      case 'Active':
        return {
          bg: colors.statusActiveBg || '#EAF6EE',
          text: colors.statusActiveText || '#238349',
        };
      case 'Lead':
        return {
          bg: '#EBF4FF',
          text: '#2563EB',
        };
      case 'Inactive':
        return {
          bg: '#F1F5F9',
          text: '#64748B',
        };
      case 'Completed':
        return {
          bg: colors.statusCompletedBg || '#EAF1FA',
          text: colors.statusCompletedText || '#3566B8',
        };
      case 'On Hold':
        return {
          bg: colors.statusOnHoldBg || '#FEF3E6',
          text: colors.statusOnHoldText || '#BA6F18',
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.category}, status: ${item.status}`}
    >
      {/* Client Avatar / Logo */}
      <View style={styles.logoWrapper}>
        <ClientLogo type={item.logoType || 'custom'} name={item.name} size={50} />
      </View>

      {/* Info: Name & Project category */}
      <View style={styles.infoContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.categoryText} numberOfLines={1}>
          {item.category}
        </Text>
      </View>

      {/* Status Pill Badge */}
      <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
        <Text style={[styles.statusText, { color: badgeStyle.text }]}>
          {item.status}
        </Text>
      </View>

      {/* Options Menu */}
      {actions && actions.length > 0 ? (
        <ThreeDotsMenu
          actions={actions}
          title={item.name}
          iconSize={18}
          iconColor={colors.textSecondary}
          buttonStyle={styles.optionsButton}
        />
      ) : (
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={onOptionsPress}
          hitSlop={{ top: 12, bottom: 12, left: 10, right: 12 }}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ClientItemCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  categoryText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  optionsButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
