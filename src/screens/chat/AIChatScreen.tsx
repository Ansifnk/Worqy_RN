import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, ArrowUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { colors } from '../../utils/colors';
import { useAppContext } from '../../context/AppContext';
import { useAIChat, chatKeys } from '../../hooks/useAIChat';
import { useSchedule } from '../../hooks/useSchedule';
import { useInvoice } from '../../hooks/useInvoice';
import { useClient } from '../../hooks/useClient';
import { useTask } from '../../hooks/useTask';
import { ScheduleItem, ScheduleFormData } from '../schedule/types';
import { Invoice } from '../invoices/types';
import { ClientItem, ClientFormData } from '../clients/types';
import { TaskItem } from '../tasks/types';
import ScheduleFormModal from '../schedule/components/ScheduleFormModal';
import ClientFormModal from '../clients/components/ClientFormModal';
import { ChatHeader } from './components/ChatHeader';
import { ChatBubble } from './components/ChatBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { EmptyChatWelcome } from './components/EmptyChatWelcome';
import { ChatMessage } from './types';

export const AIChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { user } = useAppContext();
  const {
    messages,
    loading,
    isReplying,
    sendMessage,
    clearChat,
    refresh,
  } = useAIChat();

  const { updateSchedule, deleteSchedule } = useSchedule();
  const { deleteInvoice } = useInvoice();
  const { updateClient, deleteClient } = useClient();
  const { deleteTask, toggleTaskComplete } = useTask();

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const initialScrollDone = useRef(false);
  const prevMessagesCount = useRef(0);

  // Edit Schedule Modal state
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  // Edit Client Modal state
  const [isClientModalVisible, setIsClientModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  // Auto-scroll logic: Instant jump on initial load (no animation), smooth scroll only for new messages
  useEffect(() => {
    if (messages.length === 0) {
      initialScrollDone.current = false;
      prevMessagesCount.current = 0;
      return;
    }

    if (!initialScrollDone.current) {
      // Immediate scroll with NO animation on initial load
      flatListRef.current?.scrollToEnd({ animated: false });
      const timer = setTimeout(() => {
        initialScrollDone.current = true;
      }, 300);
      return () => clearTimeout(timer);
    } else if (messages.length > prevMessagesCount.current) {
      // Smooth scroll only when a new message arrives during conversation
      flatListRef.current?.scrollToEnd({ animated: true });
    }
    prevMessagesCount.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (isReplying && initialScrollDone.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [isReplying]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isReplying) return;

    setInputText('');
    try {
      await sendMessage(trimmed);
    } catch (e) {
      console.warn('Failed to send chat message:', e);
    }
  }, [inputText, isReplying, sendMessage]);

  const handleSelectPrompt = useCallback((prompt: string) => {
    setInputText(prompt);
  }, []);

  // ---------------- SCHEDULE HANDLERS ----------------
  const handleEditSchedule = useCallback((sched: ScheduleItem) => {
    setEditingSchedule(sched);
    setIsScheduleModalVisible(true);
  }, []);

  const handleDeleteSchedule = useCallback(
    (scheduleId: string, scheduleTitle: string) => {
      Alert.alert(
        'Delete Schedule',
        `Are you sure you want to delete "${scheduleTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSchedule(scheduleId);
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(user?.id),
                  (old = []) =>
                    old.map((m) => {
                      if (m.schedule?.id === scheduleId) {
                        return { ...m, isDeletedSchedule: true };
                      }
                      if (m.schedules?.some((s) => s.id === scheduleId)) {
                        return {
                          ...m,
                          schedules: m.schedules.filter((s) => s.id !== scheduleId),
                          isDeletedSchedule: m.schedules.length === 1,
                        };
                      }
                      return m;
                    }),
                );
                Alert.alert('Deleted', 'Schedule has been removed.');
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete schedule');
              }
            },
          },
        ],
      );
    },
    [deleteSchedule, queryClient, user?.id],
  );

  const handleOpenSchedule = useCallback(
    (sched: ScheduleItem) => {
      navigation.navigate('Schedule', { date: sched.date, scheduleId: sched.id });
    },
    [navigation],
  );

  const handleScheduleFormSubmit = useCallback(
    async (formData: ScheduleFormData) => {
      if (!editingSchedule) return;
      try {
        await updateSchedule(editingSchedule.id, formData);
        queryClient.setQueryData<ChatMessage[]>(
          chatKeys.messages(user?.id),
          (old = []) =>
            old.map((m) => {
              if (m.schedule?.id === editingSchedule.id) {
                return { ...m, schedule: { ...m.schedule, ...formData } };
              }
              if (m.schedules) {
                return {
                  ...m,
                  schedules: m.schedules.map((s) =>
                    s.id === editingSchedule.id ? { ...s, ...formData } : s,
                  ),
                };
              }
              return m;
            }),
        );
        setIsScheduleModalVisible(false);
        setEditingSchedule(null);
        Alert.alert('Schedule Updated', `"${formData.title}" has been updated.`);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update schedule');
      }
    },
    [editingSchedule, updateSchedule, queryClient, user?.id],
  );

  // ---------------- INVOICE HANDLERS ----------------
  const handleEditInvoice = useCallback(
    (inv: Invoice) => {
      navigation.navigate('AddEditInvoice', { invoiceId: inv.id, isEdit: true });
    },
    [navigation],
  );

  const handleDeleteInvoice = useCallback(
    (invoiceId: string, invoiceNumber: string) => {
      Alert.alert(
        'Delete Invoice',
        `Are you sure you want to delete invoice "${invoiceNumber || ''}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteInvoice(invoiceId);
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(user?.id),
                  (old = []) =>
                    old.map((m) => {
                      if (m.invoice?.id === invoiceId) {
                        return { ...m, isDeletedInvoice: true };
                      }
                      if (m.invoices?.some((i) => i.id === invoiceId)) {
                        return {
                          ...m,
                          invoices: m.invoices.filter((i) => i.id !== invoiceId),
                          isDeletedInvoice: m.invoices.length === 1,
                        };
                      }
                      return m;
                    }),
                );
                Alert.alert('Deleted', 'Invoice has been removed.');
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete invoice');
              }
            },
          },
        ],
      );
    },
    [deleteInvoice, queryClient, user?.id],
  );

  const handleOpenInvoice = useCallback(
    (inv: Invoice) => {
      navigation.navigate('InvoiceDetail', { invoiceId: inv.id });
    },
    [navigation],
  );

  // ---------------- CLIENT HANDLERS ----------------
  const handleEditClient = useCallback((cli: ClientItem) => {
    setEditingClient(cli);
    setIsClientModalVisible(true);
  }, []);

  const handleDeleteClient = useCallback(
    (clientId: string, clientName: string) => {
      Alert.alert(
        'Delete Client',
        `Are you sure you want to delete client "${clientName || ''}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteClient(clientId);
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(user?.id),
                  (old = []) =>
                    old.map((m) => {
                      if (m.client?.id === clientId) {
                        return { ...m, isDeletedClient: true };
                      }
                      if (m.clients?.some((c) => c.id === clientId)) {
                        return {
                          ...m,
                          clients: m.clients.filter((c) => c.id !== clientId),
                          isDeletedClient: m.clients.length === 1,
                        };
                      }
                      return m;
                    }),
                );
                Alert.alert('Deleted', 'Client has been removed.');
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete client');
              }
            },
          },
        ],
      );
    },
    [deleteClient, queryClient, user?.id],
  );

  const handleOpenClient = useCallback(
    (cli: ClientItem) => {
      navigation.navigate('ClientDetail', { clientId: cli.id });
    },
    [navigation],
  );

  const handleClientFormSubmit = useCallback(
    async (formData: ClientFormData) => {
      if (!editingClient) return;
      try {
        await updateClient(editingClient.id, formData);
        queryClient.setQueryData<ChatMessage[]>(
          chatKeys.messages(user?.id),
          (old = []) =>
            old.map((m) => {
              if (m.client?.id === editingClient.id) {
                return { ...m, client: { ...m.client, ...formData } };
              }
              if (m.clients) {
                return {
                  ...m,
                  clients: m.clients.map((c) =>
                    c.id === editingClient.id ? { ...c, ...formData } : c,
                  ),
                };
              }
              return m;
            }),
        );
        setIsClientModalVisible(false);
        setEditingClient(null);
        Alert.alert('Client Updated', `"${formData.name}" has been updated.`);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update client');
      }
    },
    [editingClient, updateClient, queryClient, user?.id],
  );

  // ---------------- TASK HANDLERS ----------------
  const handleToggleTaskComplete = useCallback(
    async (taskId: string) => {
      try {
        await toggleTaskComplete(taskId);
        queryClient.setQueryData<ChatMessage[]>(
          chatKeys.messages(user?.id),
          (old = []) =>
            old.map((m) => {
              if (m.task?.id === taskId) {
                const newStatus = m.task.status === 'Done' ? 'To Do' : 'Done';
                return { ...m, task: { ...m.task, status: newStatus } };
              }
              if (m.tasks) {
                return {
                  ...m,
                  tasks: m.tasks.map((t) =>
                    t.id === taskId
                      ? { ...t, status: t.status === 'Done' ? 'To Do' : 'Done' }
                      : t,
                  ),
                };
              }
              return m;
            }),
        );
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update task');
      }
    },
    [toggleTaskComplete, queryClient, user?.id],
  );

  const handleEditTask = useCallback(
    (tsk: TaskItem) => {
      navigation.navigate('TaskDetail', { taskId: tsk.id });
    },
    [navigation],
  );

  const handleDeleteTask = useCallback(
    (taskId: string, taskTitle: string) => {
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete task "${taskTitle || ''}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTask(taskId);
                queryClient.setQueryData<ChatMessage[]>(
                  chatKeys.messages(user?.id),
                  (old = []) =>
                    old.map((m) => {
                      if (m.task?.id === taskId) {
                        return { ...m, isDeletedTask: true };
                      }
                      if (m.tasks?.some((t) => t.id === taskId)) {
                        return {
                          ...m,
                          tasks: m.tasks.filter((t) => t.id !== taskId),
                          isDeletedTask: m.tasks.length === 1,
                        };
                      }
                      return m;
                    }),
                );
                Alert.alert('Deleted', 'Task has been removed.');
              } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to delete task');
              }
            },
          },
        ],
      );
    },
    [deleteTask, queryClient, user?.id],
  );

  const handleOpenTask = useCallback(
    (tsk: TaskItem) => {
      navigation.navigate('TaskDetail', { taskId: tsk.id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      return (
        <ChatBubble
          message={item}
          onEditSchedule={handleEditSchedule}
          onDeleteSchedule={handleDeleteSchedule}
          onOpenSchedule={handleOpenSchedule}
          onEditInvoice={handleEditInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onOpenInvoice={handleOpenInvoice}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onOpenClient={handleOpenClient}
          onToggleTaskComplete={handleToggleTaskComplete}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onOpenTask={handleOpenTask}
        />
      );
    },
    [
      handleEditSchedule,
      handleDeleteSchedule,
      handleOpenSchedule,
      handleEditInvoice,
      handleDeleteInvoice,
      handleOpenInvoice,
      handleEditClient,
      handleDeleteClient,
      handleOpenClient,
      handleToggleTaskComplete,
      handleEditTask,
      handleDeleteTask,
      handleOpenTask,
    ],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <ChatHeader
        onClearChat={clearChat}
        messageCount={messages.length}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Connecting to Worqy AI...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={
              <EmptyChatWelcome
                userName={user?.name || 'there'}
                onSelectPrompt={handleSelectPrompt}
              />
            }
            ListFooterComponent={isReplying ? <TypingIndicator /> : undefined}
            onContentSizeChange={() => {
              if (messages.length === 0) return;
              if (!initialScrollDone.current) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            keyboardShouldPersistTaps="handled"
            refreshing={loading}
            onRefresh={refresh}
          />
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              returnKeyType="default"
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length > 0 && !isReplying
                  ? styles.sendButtonActive
                  : styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isReplying}
              activeOpacity={0.8}
            >
              {isReplying ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <ArrowUp
                  size={20}
                  color={
                    inputText.trim().length > 0
                      ? colors.white
                      : colors.textSecondary
                  }
                  strokeWidth={2.5}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Edit Schedule Modal */}
      <ScheduleFormModal
        visible={isScheduleModalVisible}
        onClose={() => {
          setIsScheduleModalVisible(false);
          setEditingSchedule(null);
        }}
        onSubmit={handleScheduleFormSubmit}
        initialData={editingSchedule}
        defaultDate={editingSchedule?.date}
        defaultStartTime={editingSchedule?.startTime}
      />

      {/* Edit Client Modal */}
      <ClientFormModal
        visible={isClientModalVisible}
        onClose={() => {
          setIsClientModalVisible(false);
          setEditingClient(null);
        }}
        onSubmit={handleClientFormSubmit}
        initialData={editingClient}
      />
    </View>
  );
};

export default AIChatScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 14,
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
