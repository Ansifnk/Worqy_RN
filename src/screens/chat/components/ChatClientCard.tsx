import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Users,
  Building2,
  Phone,
  Mail,
  Edit3,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ClientItem } from '../../clients/types';

interface ChatClientCardProps {
  client: ClientItem;
  onEdit: (client: ClientItem) => void;
  onDelete: (clientId: string, clientName: string) => void;
  onOpen: (client: ClientItem) => void;
  isDeleted?: boolean;
}

const getClientStatusConfig = (status?: string) => {
  const norm = (status || 'Active').toLowerCase();

  if (norm === 'active') {
    return {
      label: 'Active',
      bg: '#DCFCE7',
      text: '#15803D',
      borderColor: '#BBF7D0',
    };
  }
  if (norm === 'lead') {
    return {
      label: 'Lead',
      bg: '#EDE9FE',
      text: '#6D28D9',
      borderColor: '#DDD6FE',
    };
  }
  if (norm === 'completed') {
    return {
      label: 'Completed',
      bg: '#E0F2FE',
      text: '#0369A1',
      borderColor: '#BAE6FD',
    };
  }
  return {
    label: status || 'Contact',
    bg: '#F1F5F9',
    text: '#475569',
    borderColor: '#E2E8F0',
  };
};

export const ChatClientCard: React.FC<ChatClientCardProps> = ({
  client,
  onEdit,
  onDelete,
  onOpen,
  isDeleted = false,
}) => {
  const statusCfg = getClientStatusConfig(client.status);
  const isCompany = client.clientType === 'Company' || Boolean(client.companyName);

  if (isDeleted) {
    return (
      <View style={[styles.cardContainer, styles.deletedCard]}>
        <View style={styles.deletedRow}>
          <Trash2 size={16} color={colors.textSecondary} />
          <Text style={styles.deletedText}>
            Client &quot;{client.name || ''}&quot; was deleted
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      {/* Top Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            {isCompany ? (
              <Building2 size={18} color="#2563EB" strokeWidth={2.2} />
            ) : (
              <Users size={18} color="#2563EB" strokeWidth={2.2} />
            )}
          </View>
          <View style={styles.clientTitleWrapper}>
            <Text style={styles.clientName} numberOfLines={1}>
              {client.name}
            </Text>
            {Boolean(client.companyName) && (
              <Text style={styles.companyName} numberOfLines={1}>
                {client.companyName}
              </Text>
            )}
          </View>
        </View>

        {/* Status Tag */}
        <View
          style={[
            styles.statusTag,
            { backgroundColor: statusCfg.bg, borderColor: statusCfg.borderColor },
          ]}
        >
          <Text style={[styles.statusTagText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Contact Info Badges */}
      <View style={styles.metaRow}>
        {Boolean(client.phone) && (
          <View style={styles.metaBadge}>
            <Phone size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {client.phone}
            </Text>
          </View>
        )}

        {Boolean(client.email) && (
          <View style={styles.metaBadge}>
            <Mail size={12} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.metaText} numberOfLines={1}>
              {client.email}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons Divider & Toolbar */}
      <View style={styles.actionsDivider} />

      <View style={styles.actionsContainer}>
        {/* Edit Button */}
        <TouchableOpacity
          style={styles.actionBtnEdit}
          onPress={() => onEdit(client)}
          activeOpacity={0.7}
          accessibilityLabel="Edit client"
        >
          <Edit3 size={13} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.actionBtnEditText}>Edit</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => onDelete(client.id, client.name)}
          activeOpacity={0.7}
          accessibilityLabel="Delete client"
        >
          <Trash2 size={13} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.actionBtnDeleteText}>Delete</Text>
        </TouchableOpacity>

        {/* Open Button */}
        <TouchableOpacity
          style={styles.actionBtnOpen}
          onPress={() => onOpen(client)}
          activeOpacity={0.8}
          accessibilityLabel="Open client profile"
        >
          <ExternalLink size={13} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.actionBtnOpenText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatClientCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    padding: 12,
    marginTop: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deletedCard: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
    paddingVertical: 10,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletedText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientTitleWrapper: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  companyName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 2,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  actionsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(109, 40, 217, 0.2)',
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  actionBtnOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnOpenText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
