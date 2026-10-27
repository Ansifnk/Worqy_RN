import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ChatMessage, SendMessageResponse, ChatAction } from '../screens/chat/types';
import { ScheduleItem } from '../screens/schedule/types';
import { clientKeys } from './useClient';
import { taskKeys } from './useTask';
import { scheduleKeys } from './useSchedule';
import { invoiceKeys } from './useInvoice';

export const chatKeys = {
  all: ['chat'] as const,
  messages: (userId?: string) => [...chatKeys.all, 'messages', userId] as const,
};

export const extractScheduleFromActions = (
  actions?: ChatAction[],
): { schedule?: ScheduleItem; schedules?: ScheduleItem[] } => {
  if (!actions || actions.length === 0) return {};

  for (const act of actions) {
    const tool = (act.tool || '').toLowerCase();
    const result = act.result;
    if (!result) continue;

    if (tool.includes('create_schedule') || tool.includes('update_schedule')) {
      if (result.schedule) {
        return { schedule: result.schedule };
      }
    }

    if (tool.includes('get_schedules')) {
      if (Array.isArray(result.schedules) && result.schedules.length > 0) {
        return {
          schedule: result.schedules[0],
          schedules: result.schedules,
        };
      }
    }
  }

  return {};
};

export const parseMessageMetadata = (msg: ChatMessage): ChatMessage => {
  if (!msg.content || typeof msg.content !== 'string') return msg;

  const metadataRegex = /\n?<!--\s*METADATA:\s*([\s\S]*?)\s*-->/;
  const match = msg.content.match(metadataRegex);

  let cleanContent = msg.content;
  let actions = msg.actions;
  let schedule = msg.schedule;
  let schedules = msg.schedules;

  if (match) {
    cleanContent = msg.content.replace(metadataRegex, '').trim();
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.actions) {
        actions = parsed.actions;
        const extracted = extractScheduleFromActions(parsed.actions);
        if (extracted.schedule) schedule = extracted.schedule;
        if (extracted.schedules) schedules = extracted.schedules;
      }
    } catch (e) {
      console.warn('Failed to parse chat message metadata:', e);
    }
  } else if (actions && !schedule) {
    const extracted = extractScheduleFromActions(actions);
    if (extracted.schedule) schedule = extracted.schedule;
    if (extracted.schedules) schedules = extracted.schedules;
  }

  return {
    ...msg,
    content: cleanContent,
    actions,
    schedule,
    schedules,
  };
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
      const raw = response.data || [];
      return raw.map(parseMessageMetadata);
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
          const extracted = extractScheduleFromActions(data.actions);
          const hydratedReply: ChatMessage = parseMessageMetadata({
            ...data.reply,
            actions: data.actions,
            schedule: extracted.schedule,
            schedules: extracted.schedules,
          });
          return [...filtered, data.userMessage, hydratedReply];
        },
      );

      // Invalidate relevant query caches when tools were executed by AI
      if (data.actions && data.actions.length > 0) {
        const toolNames = data.actions.map((a) => (a.tool || '').toLowerCase());

        const hasClient = toolNames.some(
          (t) => t.includes('customer') || t.includes('client'),
        );
        const hasTask = toolNames.some((t) => t.includes('task'));
        const hasSchedule = toolNames.some((t) => t.includes('schedule'));
        const hasInvoice = toolNames.some((t) => t.includes('invoice'));

        if (hasClient) {
          queryClient.invalidateQueries({
            queryKey: clientKeys.all,
            refetchType: 'all',
          });
        }
        if (hasTask) {
          queryClient.invalidateQueries({
            queryKey: taskKeys.all,
            refetchType: 'all',
          });
        }
        if (hasSchedule) {
          queryClient.invalidateQueries({
            queryKey: scheduleKeys.all,
            refetchType: 'all',
          });
        }
        if (hasInvoice) {
          queryClient.invalidateQueries({
            queryKey: invoiceKeys.all,
            refetchType: 'all',
          });
          queryClient.invalidateQueries({
            queryKey: clientKeys.all,
            refetchType: 'all',
          });
        }
      }
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
