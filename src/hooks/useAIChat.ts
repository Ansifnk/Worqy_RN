import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppContext } from '../context/AppContext';
import { http } from '../utils/http';
import { ChatMessage, SendMessageResponse, ChatAction } from '../screens/chat/types';
import { ScheduleItem } from '../screens/schedule/types';
import { Invoice } from '../screens/invoices/types';
import { ClientItem } from '../screens/clients/types';
import { TaskItem } from '../screens/tasks/types';
import { ProjectItem } from '../screens/projects/types';
import { clientKeys } from './useClient';
import { taskKeys } from './useTask';
import { scheduleKeys } from './useSchedule';
import { invoiceKeys } from './useInvoice';
import { projectKeys } from './useProject';

export const chatKeys = {
  all: ['chat'] as const,
  messages: (userId?: string) => [...chatKeys.all, 'messages', userId] as const,
};

export interface ExtractedEntities {
  schedule?: ScheduleItem;
  schedules?: ScheduleItem[];
  invoice?: Invoice;
  invoices?: Invoice[];
  client?: ClientItem;
  clients?: ClientItem[];
  task?: TaskItem;
  tasks?: TaskItem[];
  project?: ProjectItem;
  projects?: ProjectItem[];
}

export const extractEntitiesFromActions = (
  actions?: ChatAction[],
): ExtractedEntities => {
  if (!actions || actions.length === 0) return {};

  const entities: ExtractedEntities = {};

  for (const act of actions) {
    const tool = (act.tool || '').toLowerCase();
    const result = act.result;
    if (!result) continue;

    // Schedules
    if (tool.includes('create_schedule') || tool.includes('update_schedule')) {
      if (result.schedule) entities.schedule = result.schedule;
    }
    if (tool.includes('get_schedules')) {
      if (Array.isArray(result.schedules) && result.schedules.length > 0) {
        entities.schedule = result.schedules[0];
        entities.schedules = result.schedules;
      }
    }

    // Invoices
    if (tool.includes('create_invoice') || tool.includes('update_invoice')) {
      if (result.invoice) entities.invoice = result.invoice;
    }
    if (tool.includes('get_invoices')) {
      if (Array.isArray(result.invoices) && result.invoices.length > 0) {
        entities.invoice = result.invoices[0];
        entities.invoices = result.invoices;
      }
    }

    // Customers / Clients
    if (tool.includes('create_customer') || tool.includes('update_customer')) {
      if (result.customer) entities.client = result.customer;
    }
    if (tool.includes('get_customers')) {
      if (Array.isArray(result.customers) && result.customers.length > 0) {
        entities.client = result.customers[0];
        entities.clients = result.customers;
      }
    }

    // Tasks
    if (tool.includes('create_task') || tool.includes('update_task')) {
      if (result.task) entities.task = result.task;
    }
    if (tool.includes('get_tasks')) {
      if (Array.isArray(result.tasks) && result.tasks.length > 0) {
        entities.task = result.tasks[0];
        entities.tasks = result.tasks;
      }
    }

    // Projects
    if (tool.includes('create_project') || tool.includes('update_project')) {
      if (result.project) entities.project = result.project;
    }
    if (tool.includes('get_projects')) {
      if (Array.isArray(result.projects) && result.projects.length > 0) {
        entities.project = result.projects[0];
        entities.projects = result.projects;
      }
    }
  }

  return entities;
};

export const extractScheduleFromActions = extractEntitiesFromActions;

export const parseMessageMetadata = (msg: ChatMessage): ChatMessage => {
  if (!msg.content || typeof msg.content !== 'string') return msg;

  const metadataRegex = /\n?<!--\s*METADATA:\s*([\s\S]*?)\s*-->/;
  const match = msg.content.match(metadataRegex);

  let cleanContent = msg.content;
  let actions = msg.actions;
  let schedule = msg.schedule;
  let schedules = msg.schedules;
  let invoice = msg.invoice;
  let invoices = msg.invoices;
  let client = msg.client;
  let clients = msg.clients;
  let task = msg.task;
  let tasks = msg.tasks;
  let project = msg.project;
  let projects = msg.projects;

  if (match) {
    cleanContent = msg.content.replace(metadataRegex, '').trim();
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.actions) {
        actions = parsed.actions;
        const extracted = extractEntitiesFromActions(parsed.actions);
        if (extracted.schedule) schedule = extracted.schedule;
        if (extracted.schedules) schedules = extracted.schedules;
        if (extracted.invoice) invoice = extracted.invoice;
        if (extracted.invoices) invoices = extracted.invoices;
        if (extracted.client) client = extracted.client;
        if (extracted.clients) clients = extracted.clients;
        if (extracted.task) task = extracted.task;
        if (extracted.tasks) tasks = extracted.tasks;
        if (extracted.project) project = extracted.project;
        if (extracted.projects) projects = extracted.projects;
      }
    } catch (e) {
      console.warn('Failed to parse chat message metadata:', e);
    }
  } else if (actions) {
    const extracted = extractEntitiesFromActions(actions);
    if (!schedule && extracted.schedule) schedule = extracted.schedule;
    if (!schedules && extracted.schedules) schedules = extracted.schedules;
    if (!invoice && extracted.invoice) invoice = extracted.invoice;
    if (!invoices && extracted.invoices) invoices = extracted.invoices;
    if (!client && extracted.client) client = extracted.client;
    if (!clients && extracted.clients) clients = extracted.clients;
    if (!task && extracted.task) task = extracted.task;
    if (!tasks && extracted.tasks) tasks = extracted.tasks;
    if (!project && extracted.project) project = extracted.project;
    if (!projects && extracted.projects) projects = extracted.projects;
  }

  return {
    ...msg,
    content: cleanContent,
    actions,
    schedule,
    schedules,
    invoice,
    invoices,
    client,
    clients,
    task,
    tasks,
    project,
    projects,
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
          const extracted = extractEntitiesFromActions(data.actions);
          const hydratedReply: ChatMessage = parseMessageMetadata({
            ...data.reply,
            actions: data.actions,
            schedule: extracted.schedule,
            schedules: extracted.schedules,
            invoice: extracted.invoice,
            invoices: extracted.invoices,
            client: extracted.client,
            clients: extracted.clients,
            task: extracted.task,
            tasks: extracted.tasks,
            project: extracted.project,
            projects: extracted.projects,
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
        const hasProject = toolNames.some((t) => t.includes('project'));
        const hasTask = toolNames.some((t) => t.includes('task'));
        const hasSchedule = toolNames.some((t) => t.includes('schedule'));
        const hasInvoice = toolNames.some((t) => t.includes('invoice'));

        if (hasClient) {
          queryClient.invalidateQueries({
            queryKey: clientKeys.all,
            refetchType: 'all',
          });
        }
        if (hasProject) {
          queryClient.invalidateQueries({
            queryKey: projectKeys.all,
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
