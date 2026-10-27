import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import ThreeDotsMenu, { ActionMenuItem } from '../../../components/ThreeDotsMenu';
import { ClientLogo } from '../../clients/components/ClientLogos';

export interface ClientItem {
  id: string;
  name: string;
  status: string;
  category?: string;
  companyName?: string;
  clientType?: string;
  profilePic?: string;
  badgeType?: string;
  optionsColor?: string;
}

interface ClientCardProps {
  item: ClientItem;
  onPress?: () => void;
  onOptionsPress?: () => void;
  actions?: ActionMenuItem[];
}

export const ClientCard: React.FC<ClientCardProps> = ({
  item,
  onPress,
  onOptionsPress,
  actions,
}) => {
  // Infer logo type or fallback
  const logoType =
    item.badgeType ||
    (item.name.toLowerCase().includes('bricado')
      ? 'bricado'
      : item.name.toLowerCase().includes('nkt')
      ? 'nkt'
      : item.name.toLowerCase().includes('britauria')
      ? 'britauria'
      : 'custom');

  const subtitle =
    item.companyName ||
    item.category ||
    item.status ||
    (item.clientType ? `${item.clientType} Account` : 'Client');

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        style={styles.clickableContent}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Client Logo / Badge */}
        <View style={styles.badgeWrapper}>
          <ClientLogo type={logoType} name={item.name} size={50} />
        </View>

        {/* Content Info */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {item.name}
            </Text>
            {item.status ? (
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'Active'
                    ? styles.activeBadge
                    : styles.defaultBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    item.status === 'Active'
                      ? styles.activeBadgeText
                      : styles.defaultBadgeText,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.statusText} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Options Menu */}
      <View style={styles.optionsWrapper}>
        {actions && actions.length > 0 ? (
          <ThreeDotsMenu
            actions={actions}
            title={item.name}
            iconSize={19}
            iconColor={item.optionsColor || '#9E9E9E'}
            buttonStyle={styles.optionsButton}
          />
        ) : (
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
        )}
      </View>
    </View>
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
  clickableContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  badgeWrapper: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#EAF6EE',
  },
  defaultBadge: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeBadgeText: {
    color: '#238349',
  },
  defaultBadgeText: {
    color: '#6B7280',
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
