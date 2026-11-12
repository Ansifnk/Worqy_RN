import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress?: number; // 0 to 100
  color?: string;
  trackColor?: string;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 56,
  strokeWidth = 5.5,
  progress = 68,
  color = '#22C55E',
  trackColor = '#DCFCE7',
  label,
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * safeProgress) / 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.centerLabelContainer}>
          <Text style={styles.percentageText}>
            {label ?? `${Math.round(safeProgress)}%`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CircularProgress;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.2,
  },
});
