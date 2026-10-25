import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MoreVertical, Leaf } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../../utils/colors';

export interface ClientItem {
  id: string;
  name: string;
  status: string;
  badgeType: 'bricado' | 'nkt' | 'britauria';
  optionsColor?: string;
}

interface ClientCardProps {
  item: ClientItem;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  item,
  onPress,
  onOptionsPress,
}) => {
  const renderBadge = () => {
    switch (item.badgeType) {
      case 'bricado':
        return (
          <View style={[styles.badgeBase, styles.bricadoBadge]}>
            <Svg width={30} height={30} viewBox="0 0 32 32" fill="none">
              <Circle cx="16" cy="16" r="13" stroke="#F2C078" strokeWidth="2.5" opacity={0.6} />
              <Path
                d="M11 19C12.5 22 17 23 20 20C23 17 22 12.5 19 11C16 9.5 11.5 10.5 10 13.5"
                stroke="#F2C078"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <Circle cx="16" cy="16" r="3.5" fill="#FFFFFF" />
            </Svg>
          </View>
        );
      case 'nkt':
        return (
          <View style={[styles.badgeBase, styles.nktBadge]}>
            <Text style={styles.nktText}>NK</Text>
          </View>
        );
      case 'britauria':
        return (
          <View style={[styles.badgeBase, styles.britauriaBadge]}>
            <Leaf size={22} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
          </View>
        );
      default:
        return (
          <View style={[styles.badgeBase, styles.nktBadge]}>
            <Text style={styles.nktText}>{item.name.substring(0, 2).toUpperCase()}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.rowContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Client Logo / Badge */}
      {renderBadge()}

      {/* Content Info */}
      <View style={styles.textContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.statusText} numberOfLines={1}>
          {item.status}
        </Text>
      </View>

      {/* Options Menu Button */}
      <TouchableOpacity
        style={styles.optionsButton}
        onPress={onOptionsPress}
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Client options"
      >
        <MoreVertical
          size={19}
          color={item.optionsColor || '#9E9E9E'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ClientCard;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
  },
  badgeBase: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bricadoBadge: {
    backgroundColor: '#1C1B1F',
  },
  nktBadge: {
    backgroundColor: '#111111',
  },
  nktText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  britauriaBadge: {
    backgroundColor: '#16A34A',
    borderRadius: 26, // Circular as in screenshot
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  statusText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  optionsButton: {
    padding: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
