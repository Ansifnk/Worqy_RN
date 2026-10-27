import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ChatMessage, SendMessageResponse } from '../screens/chat/types';

export const chatKeys = {
  all: ['chat'] as const,
  messages: (userId?: string) => [...chatKeys.all, 'messages', userId] as const,
};

export interface UseAIChatReturn {
  messages: ChatMessage[];
  loading: boolean;
  isReplying: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAIChat = (): UseAIChatReturn => {
  const { user } = useAppContext();
  const queryClient = useQueryClient();
  const [isReplying, setIsReplying] = useState(false);

  // TanStack Query for retrieving chat messages
  const {
    data: messages = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ChatMessage[]>({
    queryKey: chatKeys.messages(user?.id),
    queryFn: async () => {
      const response = await http.get<ChatMessage[]>('/chat');
      return response.data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });

  // Mutation for sending a message
  const sendMutation = useMutation<
    SendMessageResponse,
    Error,
    string,
    { previousMessages?: ChatMessage[] }
  >({
    mutationFn: async (messageText: string) => {
      setIsReplying(true);
      const res = await http.post<SendMessageResponse>('/chat', {
        message: messageText,
      });
      if (!res.data) {
        throw new Error(res.msg || 'Failed to send message');
      }
      return res.data;
    },
    onMutate: async (newMessageText: string) => {
      await queryClient.cancelQueries({
        queryKey: chatKeys.messages(user?.id),
      });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        chatKeys.messages(user?.id),
      );

      // Optimistic user message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        userId: user?.id || '',
        role: 'user',
        content: newMessageText,
        createdAt: new Date().toISOString(),
        isSending: true,
      };

      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(user?.id),
        (old = []) => [...old, optimisticMessage],
      );

      return { previousMessages };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(user?.id),
        (old = []) => {
          // Remove temporary sending message and add the server's persisted user + AI reply
          const filtered = old.filter((m) => !m.id.startsWith('temp-'));
          return [...filtered, data.userMessage, data.reply];
        },
      );
    },
    onError: (_err, _text, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatKeys.messages(user?.id),
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      setIsReplying(false);
    },
  });

  // Mutation for clearing chat history
  const clearMutation = useMutation({
    mutationFn: async () => {
      await http.delete('/chat');
    },
    onSuccess: () => {
      queryClient.setQueryData(chatKeys.messages(user?.id), []);
    },
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await sendMutation.mutateAsync(text.trim());
    },
    [sendMutation],
  );

  const clearChat = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const error = queryError ? (queryError as Error).message : null;

  return {
    messages,
    loading: isLoading,
    isReplying,
    error,
    sendMessage,
    clearChat,
    refresh,
  };
};

export default useAIChat;
