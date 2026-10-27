import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { Sparkles, Clock } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const timeFormatted = message.createdAt
    ? dayjs(message.createdAt).format('h:mm A')
    : '';

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userTime}>{timeFormatted}</Text>
            {message.isSending && (
              <Clock size={11} color="rgba(255, 255, 255, 0.7)" style={styles.clockIcon} />
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantContainer}>
      <View style={styles.assistantAvatar}>
        <Sparkles size={14} color={colors.primary} />
      </View>

      <View style={styles.assistantBubble}>
        <Text style={styles.assistantText}>{message.content}</Text>
        <Text style={styles.assistantTime}>{timeFormatted}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;

const styles = StyleSheet.create({
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userBubble: {
    maxWidth: '82%',
    backgroundColor: colors.primary,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  userText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  userTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
  clockIcon: {
    marginLeft: 4,
  },
  assistantContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  assistantBubble: {
    maxWidth: '82%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  assistantText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  assistantTime: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
});
