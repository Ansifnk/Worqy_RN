import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface InvoiceClientAvatarProps {
  letter?: string;
  name?: string;
  color?: string;
  size?: number;
}

export const InvoiceClientAvatar: React.FC<InvoiceClientAvatarProps> = ({
  letter,
  name,
  color = '#16A34A',
  size = 40,
}) => {
  const displayChar = (letter || name?.[0] || 'C').toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.44) }]}>
        {displayChar}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default InvoiceClientAvatar;
