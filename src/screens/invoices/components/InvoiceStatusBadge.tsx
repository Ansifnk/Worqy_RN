import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { InvoiceStatus } from '../types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'small' | 'medium';
}

export const getStatusColors = (status: InvoiceStatus) => {
  switch (status) {
    case 'Draft':
      return { bg: '#FEF0DC', text: '#D97706' };
    case 'Sent':
      return { bg: '#EDE9FE', text: '#6C47C8' };
    case 'Paid':
      return { bg: '#EAF6EE', text: '#238349' };
    case 'Overdue':
      return { bg: '#FDE8E8', text: '#D64545' };
    default:
      return { bg: '#F3F4F6', text: '#4B5563' };
  }
};

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const { bg, text } = getStatusColors(status);
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badgeSmall : styles.badgeMedium,
        { backgroundColor: bg },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isSmall ? styles.badgeTextSmall : styles.badgeTextMedium,
          { color: text },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeMedium: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  badgeText: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  badgeTextSmall: {
    fontSize: 11,
  },
  badgeTextMedium: {
    fontSize: 13,
  },
});

export default InvoiceStatusBadge;
