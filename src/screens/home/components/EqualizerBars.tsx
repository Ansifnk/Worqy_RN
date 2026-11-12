import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EqualizerBarsProps {
  bars: number[]; // normalized heights 0 to 1
  baseColor: string;
  accentColor: string;
  height?: number;
}

export const EqualizerBars: React.FC<EqualizerBarsProps> = ({
  bars,
  baseColor,
  accentColor,
  height = 24,
}) => {
  return (
    <View style={[styles.container, { height }]}>
      {bars.map((value, idx) => {
        const isAccent = idx >= bars.length - 3;
        const barHeight = Math.max(Math.round(value * height), 3);
        return (
          <View
            key={idx}
            style={[
              styles.bar,
              {
                height: barHeight,
                backgroundColor: isAccent ? accentColor : baseColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default EqualizerBars;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 6,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
  },
});

