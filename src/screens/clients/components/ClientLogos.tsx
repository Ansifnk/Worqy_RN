import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

;

interface ClientLogoProps {
  type: string;
  name?: string;
  size?: number;
}

export const ClientLogo: React.FC<ClientLogoProps> = ({
  type,
  name = '',
  size = 48,
}) => {
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: size * 0.3 },
  ];

  return (
    <View style={[containerStyle, styles.defaultBg]}>
      <Text style={[styles.defaultText, { fontSize: size * 0.4 }]}>
        {name ? name.substring(0, 2).toUpperCase() : 'CU'}
      </Text>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  defaultBg: {
    backgroundColor: '#262626',
  },
  defaultText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ClientLogo;
