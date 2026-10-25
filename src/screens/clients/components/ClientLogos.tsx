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

export type ClientLogoType =
  | 'bricado'
  | 'nkt'
  | 'britauria'
  | 'teckito'
  | 'pantone'
  | 'indianBreeze'
  | 'kanshub'
  | 'apex'
  | 'zenith'
  | 'lumina'
  | 'nova'
  | 'solaria';

interface ClientLogoProps {
  type: ClientLogoType | string;
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

  switch (type) {
    case 'bricado':
      return (
        <View style={[containerStyle, styles.bricadoBg]}>
          <Svg width={size * 0.64} height={size * 0.64} viewBox="0 0 32 32" fill="none">
            {/* Concentric rounded gem/leaf shape */}
            <Circle cx="16" cy="16" r="13" stroke="#22804A" strokeWidth="2.8" />
            <Path
              d="M16 6.5C19 6.5 22.5 10 22.5 15C22.5 19.5 19 23 16 23C13 23 9.5 19.5 9.5 15C9.5 10 13 6.5 16 6.5Z"
              fill="#22804A"
            />
            <Circle cx="16" cy="15.5" r="3.2" fill="#FAF8F5" />
          </Svg>
        </View>
      );

    case 'nkt':
      return (
        <View style={[containerStyle, styles.nktBg]}>
          <Text style={[styles.nktText, { fontSize: size * 0.38 }]}>NK</Text>
        </View>
      );

    case 'britauria':
      return (
        <View style={[containerStyle, styles.britauriaBg]}>
          <Svg width={size * 0.68} height={size * 0.68} viewBox="0 0 32 32" fill="none">
            {/* Assassin/Crest eagle emblem */}
            <Path
              d="M16 4L22 10L24 16L20 22L16 28L12 22L8 16L10 10L16 4Z"
              stroke="#E89B48"
              strokeWidth="2"
              fill="#D9822B"
              fillOpacity={0.25}
            />
            <Path
              d="M16 8L19.5 13L16 18L12.5 13L16 8Z"
              fill="#F4B266"
            />
            <Circle cx="16" cy="20" r="1.5" fill="#FFE2B8" />
          </Svg>
        </View>
      );

    case 'teckito':
      return (
        <View style={[containerStyle, styles.teckitoBg]}>
          <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 36 36" fill="none">
            {/* Stylized character portrait */}
            <Circle cx="18" cy="18" r="16" fill="#2F3B44" />
            {/* Hair / Beard hood */}
            <Path
              d="M10 24C10 20 12 11 18 11C24 11 26 20 26 24C26 27 23 30 18 30C13 30 10 27 10 24Z"
              fill="#E8DDD3"
            />
            {/* Face */}
            <Rect x="14" y="14" width="8" height="9" rx="3.5" fill="#E29578" />
            {/* Glasses */}
            <Rect x="13.5" y="15.5" width="4" height="3" rx="1" fill="#1C1B1F" />
            <Rect x="18.5" y="15.5" width="4" height="3" rx="1" fill="#1C1B1F" />
            <Rect x="17" y="16.5" width="2" height="1" fill="#1C1B1F" />
            {/* Dark cloak / shoulders */}
            <Path
              d="M8 32C8 28 12 26 18 26C24 26 28 28 28 32"
              stroke="#1C242B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );

    case 'pantone':
      return (
        <View style={[containerStyle, styles.pantoneBg]}>
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 32 32" fill="none">
            <Defs>
              <LinearGradient id="pantoneGrad" x1="0" y1="0" x2="32" y2="32">
                <Stop offset="0" stopColor="#00C0FF" />
                <Stop offset="1" stopColor="#0062E0" />
              </LinearGradient>
            </Defs>
            {/* Modern origami folded P / B */}
            <Rect x="6" y="6" width="7" height="20" rx="2" fill="url(#pantoneGrad)" />
            <Path
              d="M13 7H19C22.3 7 25 9.7 25 13C25 16.3 22.3 19 19 19H13V7Z"
              fill="#009BF5"
            />
            <Path
              d="M13 15H18C20.8 15 23 17.2 23 20C23 22.8 20.8 25 18 25H13V15Z"
              fill="#006FE6"
              opacity={0.9}
            />
            <Circle cx="17.5" cy="13" r="2" fill="#0A0A0E" />
          </Svg>
        </View>
      );

    case 'indianBreeze':
      return (
        <View style={[containerStyle, styles.indianBreezeBg]}>
          <Svg width={size * 0.68} height={size * 0.68} viewBox="0 0 32 32" fill="none">
            {/* Stylized hooded masked silhouette */}
            <Path
              d="M16 5C11 5 8 9 8 15C8 21 11 26 16 27C21 26 24 21 24 15C24 9 21 5 16 5Z"
              fill="#18181B"
            />
            {/* Mask slit / eyes */}
            <Path
              d="M12 14L15 16L12 17M20 14L17 16L20 17"
              stroke="#FAF8F5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <Path
              d="M16 18V22"
              stroke="#FAF8F5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );

    case 'kanshub':
      return (
        <View style={[containerStyle, styles.kanshubBg]}>
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 32 32" fill="none">
            {/* Origami brush 'K' */}
            <Path
              d="M8 6H13V26H8V6Z"
              fill="#FFFFFF"
            />
            <Path
              d="M12 17L22 6H26L16 17L26 26H21L12 17Z"
              fill="#FFFFFF"
            />
          </Svg>
        </View>
      );

    case 'apex':
      return (
        <View style={[containerStyle, styles.apexBg]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
            <Path d="M16 6L25 24H7L16 6Z" stroke="#F59E0B" strokeWidth="2.5" />
            <Path d="M11 20H21" stroke="#F59E0B" strokeWidth="2" />
          </Svg>
        </View>
      );

    case 'zenith':
      return (
        <View style={[containerStyle, styles.zenithBg]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
            <Path
              d="M16 6V26M6 16H26"
              stroke="#0284C7"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <Circle cx="16" cy="16" r="3" fill="#0369A1" />
          </Svg>
        </View>
      );

    case 'lumina':
      return (
        <View style={[containerStyle, styles.luminaBg]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
            <Path
              d="M16 4L19 13L28 16L19 19L16 28L13 19L4 16L13 13L16 4Z"
              fill="#E9D5FF"
            />
          </Svg>
        </View>
      );

    case 'nova':
      return (
        <View style={[containerStyle, styles.novaBg]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
            <Circle cx="16" cy="16" r="8" stroke="#FCD34D" strokeWidth="3" />
            <Circle cx="16" cy="16" r="3" fill="#FCD34D" />
          </Svg>
        </View>
      );

    case 'solaria':
      return (
        <View style={[containerStyle, styles.solariaBg]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
            <Circle cx="16" cy="16" r="7" fill="#34D399" />
            <Path
              d="M16 4V7M16 25V28M4 16H7M25 16H28M7.5 7.5L9.6 9.6M22.4 22.4L24.5 24.5M7.5 24.5L9.6 22.4M22.4 9.6L24.5 7.5"
              stroke="#34D399"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      );

    default:
      return (
        <View style={[containerStyle, styles.defaultBg]}>
          <Text style={[styles.defaultText, { fontSize: size * 0.4 }]}>
            {name ? name.substring(0, 2).toUpperCase() : 'CU'}
          </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bricadoBg: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE8',
  },
  nktBg: {
    backgroundColor: '#111111',
  },
  nktText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  britauriaBg: {
    backgroundColor: '#0F4428',
  },
  teckitoBg: {
    backgroundColor: '#2E3A42',
  },
  pantoneBg: {
    backgroundColor: '#0A0A0E',
  },
  indianBreezeBg: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4DF',
  },
  kanshubBg: {
    backgroundColor: '#111111',
  },
  apexBg: {
    backgroundColor: '#1E293B',
  },
  zenithBg: {
    backgroundColor: '#E0F2FE',
  },
  luminaBg: {
    backgroundColor: '#3B0764',
  },
  novaBg: {
    backgroundColor: '#78350F',
  },
  solariaBg: {
    backgroundColor: '#064E3B',
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
