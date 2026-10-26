import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Polygon, Defs, RadialGradient, Stop } from 'react-native-svg';

interface SunburstBackgroundProps {
  width: number;
  height: number;
  centerY: number;
}

// Ray colors adhering strictly to Worqy's brand palette:
// Alternating off-white, delicate green-touch white, soft mint, seafoam, and emerald teal
const RAY_COLORS = [
  '#70B7A8', // Soft Mint Sage
  '#F5FAF8', // Off-White with delicate green touch
  '#4E9D8F', // Medium Teal
  '#E6F4F0', // Soft Green-tinted White
  '#2C8A84', // Emerald Teal
  '#FFFFFF', // Crisp Off-White
  '#58AFA2', // Fresh Mint
  '#DCEFE7', // Soft Seafoam / Green-touch white
  '#EBF6F2', // Pale Green-touch White
];

export const SunburstBackground: React.FC<SunburstBackgroundProps> = ({
  width,
  height,
  centerY,
}) => {
  const rays = useMemo(() => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    // Radius large enough to reach well beyond any screen corner
    const R = Math.hypot(width, centerY) + 160;
    const cx = width / 2;

    const startAngle = 195;
    const endAngle = -15;
    const totalSpan = startAngle - endAngle;
    const step = totalSpan / RAY_COLORS.length;

    return RAY_COLORS.map((color, index) => {
      const theta1 = startAngle - index * step;
      const theta2 = startAngle - (index + 1) * step;

      const x1 = cx + R * Math.cos(toRad(theta1));
      const y1 = centerY - R * Math.sin(toRad(theta1));

      const x2 = cx + R * Math.cos(toRad(theta2));
      const y2 = centerY - R * Math.sin(toRad(theta2));

      return {
        points: `${cx},${centerY} ${x1},${y1} ${x2},${y2}`,
        fill: color,
        key: `ray-${index}`,
      };
    });
  }, [width, centerY]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Subtle radial glow focused at the convergence point with green-touch white */}
          <RadialGradient id="burstCenterGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#E2F4EE" stopOpacity="0.45" />
            <Stop offset="50%" stopColor="#70B7A8" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#104441" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base dark teal background */}
        <Rect width={width} height={height} fill="#104441" />

        {/* Radiating Fan Rays (Top Half) */}
        {rays.map((ray) => (
          <Polygon key={ray.key} points={ray.points} fill={ray.fill} opacity={0.96} />
        ))}

        {/* Lower Section Background (Smooth solid teal below ray focal point) */}
        <Rect
          x={0}
          y={centerY - 2}
          width={width}
          height={height - centerY + 2}
          fill="#104441"
        />

        {/* Radial glow around the focal center behind the app badge */}
        <Rect
          x={width / 2 - 130}
          y={centerY - 130}
          width={260}
          height={260}
          fill="url(#burstCenterGlow)"
        />
      </Svg>
    </View>
  );
};

export default SunburstBackground;
