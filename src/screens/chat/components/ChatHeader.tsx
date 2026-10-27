import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Sparkles, Trash2 } from 'lucide-react-native';
import { colors } from '../../../utils/colors';

interface ChatHeaderProps {
  onClearChat: () => void;
  messageCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClearChat,
  messageCount,
}) => {
  const handleClearPress = () => {
    if (messageCount === 0) return;
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to delete all messages in this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearChat },
      ],
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Sparkles size={20} color={colors.white} />
          </View>
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.infoWrapper}>
          <Text style={styles.title}>Worqy AI</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Smart Assistant • Active</Text>
          </View>
        </View>
      </View>

      {messageCount > 0 && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleClearPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={19} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  infoWrapper: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
