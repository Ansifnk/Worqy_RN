import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../utils/colors';

export interface LoadingViewProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullscreen?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message,
  size = 'small',
  color = colors.primary,
  style,
  textStyle,
  fullscreen = false,
}) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen, style]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={[styles.message, textStyle]}>{message}</Text> : null}
    </View>
  );
};

export default LoadingView;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.warmBackground || '#FAF8F5',
  },
  message: {
    fontSize: 14,
    color: '#8A847E',
    textAlign: 'center',
    marginTop: 12,
  },
});
