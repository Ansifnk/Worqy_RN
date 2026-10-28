import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Building2,
  Laptop,
  Users,
  Calendar,
  MapPin,
  Coffee,
  Check,
  Sparkles,
  Zap,
  Wifi,
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../utils/colors';

interface FloatingIconBadgesProps {
  width?: number;
  height?: number;
}

/**
 * 3D-styled Workspace Status Bubble (High-Speed WiFi / Instant Connectivity)
 */
const WifiStatusBubble: React.FC = () => (
  <View style={styles.chatBubbleContainer}>
    <View style={styles.chatBubbleBody}>
      <Wifi size={20} color={colors.primary} strokeWidth={2.4} />
    </View>
    <View style={styles.chatBubbleTail} />
  </View>
);

/**
 * 3D-styled Coffee Lounge & Coworking Amenity Badge with Orbital Ring
 */
const CoffeeAmenityBadge: React.FC = () => (
  <View style={styles.amenityContainer}>
    {/* Core circle */}
    <View style={styles.amenityCore}>
      <Coffee size={22} color="#FFFFFF" strokeWidth={2.4} />
    </View>
    {/* Angled decorative mint ring */}
    <Svg width={46} height={22} viewBox="0 0 46 22" style={styles.amenityRing}>
      <Path
        d="M2 11 C6 2, 40 2, 44 11 C40 20, 6 20, 2 11 Z"
        fill="none"
        stroke="#DCEFE7"
        strokeWidth={3}
      />
    </Svg>
  </View>
);

export const FloatingIconBadges: React.FC<FloatingIconBadgesProps> = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Top-Left: Modern Office & Laptop (Workstation) + Verified Check Badge */}
      <View style={[styles.badgeBase, styles.badgeTopLeft]}>
        <View style={styles.cloudRow}>
          <View style={[styles.iconChip, styles.chipMint]}>
            <Building2 size={18} color={colors.primary} strokeWidth={2.2} />
          </View>
          <View style={[styles.iconChip, styles.chipSoftTeal]}>
            <Laptop size={18} color="#24865B" strokeWidth={2.2} />
          </View>
        </View>
        {/* Attached verified checkmark badge */}
        <View style={styles.miniCheckBadge}>
          <Check size={11} color="#FFFFFF" strokeWidth={3} />
        </View>
      </View>

      {/* 2. Top-Right: Community & Desk Booking + Sparkles Badge */}
      <View style={[styles.badgeBase, styles.badgeTopRight]}>
        <View style={styles.cloudRow}>
          <View style={[styles.iconChip, styles.chipGreenWhite]}>
            <Users size={18} color={colors.primary} strokeWidth={2.2} />
          </View>
          <View style={[styles.iconChip, styles.chipMint]}>
            <Calendar size={18} color="#24865B" strokeWidth={2.2} />
          </View>
        </View>
        {/* Attached mint sparkle badge */}
        <View style={styles.miniSparkleBadge}>
          <Sparkles size={11} color="#FFFFFF" />
        </View>
      </View>

      {/* 3. Mid-Left: Location Pin & Coffee Amenities + Instant Access Badge */}
      <View style={[styles.badgeBase, styles.badgeMidLeft]}>
        <View style={styles.cloudRow}>
          <View style={[styles.iconChip, styles.chipSeafoam]}>
            <MapPin size={18} color={colors.primary} strokeWidth={2.2} />
          </View>
          <View style={[styles.iconChip, styles.chipGreenWhite]}>
            <Coffee size={18} color="#24865B" strokeWidth={2.2} />
          </View>
        </View>
        <View style={styles.miniAccessBadge}>
          <Zap size={11} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </View>

      {/* 4. Lower-Left: High-Speed WiFi Badge */}
      <View style={styles.chatBubblePosition}>
        <WifiStatusBubble />
      </View>

      {/* 5. Mid-Right: Coffee & Lounge Amenity Badge with Mint Ring */}
      <View style={styles.amenityPosition}>
        <CoffeeAmenityBadge />
      </View>
    </View>
  );
};

export default FloatingIconBadges;

const styles = StyleSheet.create({
  // Chip color variants using off-white and green-touch white
  chipMint: {
    backgroundColor: '#E6F4F0',
  },
  chipSoftTeal: {
    backgroundColor: '#DCEFE7',
  },
  chipGreenWhite: {
    backgroundColor: '#F5FAF8',
  },
  chipSeafoam: {
    backgroundColor: '#EAF6F3',
  },

  // Base Capsule Badge
  badgeBase: {
    position: 'absolute',
    backgroundColor: '#F5FAF8', // Off-white with green touch
    borderRadius: 22,
    padding: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#104441',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  cloudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mini Attached Badges
  miniCheckBadge: {
    position: 'absolute',
    top: -5,
    right: 22,
    backgroundColor: '#24865B', // Wyzo success green
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#24865B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  miniSparkleBadge: {
    position: 'absolute',
    top: -5,
    right: 22,
    backgroundColor: '#70B7A8', // Wyzo mint sage
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#70B7A8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  miniAccessBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#176B67', // Wyzo primary teal
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#176B67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },

  // Positioning across top half rays
  badgeTopLeft: {
    top: 76,
    left: 20,
  },
  badgeTopRight: {
    top: 86,
    right: 22,
  },
  badgeMidLeft: {
    top: 178,
    left: 18,
  },

  // 3D WiFi Status Bubble Styling
  chatBubblePosition: {
    position: 'absolute',
    top: 246,
    left: 36,
  },
  chatBubbleContainer: {
    alignItems: 'center',
    shadowColor: '#104441',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  chatBubbleBody: {
    width: 44,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F5FAF8', // Off-white with green touch
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F5FAF8',
    marginTop: -1,
    marginRight: 10,
  },

  // 3D Coffee Amenity Badge Styling
  amenityPosition: {
    position: 'absolute',
    top: 210,
    right: 32,
  },
  amenityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#104441',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  amenityCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#176B67', // Wyzo primary teal
    borderWidth: 2,
    borderColor: '#DCEFE7', // Soft seafoam green-touch white
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityRing: {
    position: 'absolute',
    transform: [{ rotate: '-22deg' }],
  },
});
