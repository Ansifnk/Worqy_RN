import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { Sparkles, Clock } from 'lucide-react-native';
import { colors } from '../../../utils/colors';
import { ChatMessage } from '../types';
import { ScheduleItem } from '../../schedule/types';
import { Invoice } from '../../invoices/types';
import { ClientItem } from '../../clients/types';
import { TaskItem } from '../../tasks/types';
import { ChatScheduleCard } from './ChatScheduleCard';
import { ChatInvoiceCard } from './ChatInvoiceCard';
import { ChatClientCard } from './ChatClientCard';
import { ChatTaskCard } from './ChatTaskCard';
import { ChatMarkdownText } from './ChatMarkdownText';

interface ChatBubbleProps {
  message: ChatMessage;
  // Schedules
  onEditSchedule?: (schedule: ScheduleItem) => void;
  onDeleteSchedule?: (scheduleId: string, scheduleTitle: string) => void;
  onOpenSchedule?: (schedule: ScheduleItem) => void;
  // Invoices
  onEditInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoiceId: string, invoiceNumber: string) => void;
  onOpenInvoice?: (invoice: Invoice) => void;
  // Clients
  onEditClient?: (client: ClientItem) => void;
  onDeleteClient?: (clientId: string, clientName: string) => void;
  onOpenClient?: (client: ClientItem) => void;
  // Tasks
  onToggleTaskComplete?: (taskId: string) => void;
  onEditTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: string, taskTitle: string) => void;
  onOpenTask?: (task: TaskItem) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  onEditSchedule,
  onDeleteSchedule,
  onOpenSchedule,
  onEditInvoice,
  onDeleteInvoice,
  onOpenInvoice,
  onEditClient,
  onDeleteClient,
  onOpenClient,
  onToggleTaskComplete,
  onEditTask,
  onDeleteTask,
  onOpenTask,
}) => {
  const isUser = message.role === 'user';
  const timeFormatted = message.createdAt
    ? dayjs(message.createdAt).format('h:mm A')
    : '';

  if (isUser) {
    return (
      <View style={styles.userContainer}>
        <View style={styles.userBubble}>
          <ChatMarkdownText content={message.content} style={styles.userText} isUser={true} />
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

  // Determine schedules to display
  const schedulesToRender: ScheduleItem[] = [];
  if (message.schedules && message.schedules.length > 0) {
    schedulesToRender.push(...message.schedules);
  } else if (message.schedule) {
    schedulesToRender.push(message.schedule);
  }

  // Determine invoices to display
  const invoicesToRender: Invoice[] = [];
  if (message.invoices && message.invoices.length > 0) {
    invoicesToRender.push(...message.invoices);
  } else if (message.invoice) {
    invoicesToRender.push(message.invoice);
  }

  // Determine clients to display
  const clientsToRender: ClientItem[] = [];
  if (message.clients && message.clients.length > 0) {
    clientsToRender.push(...message.clients);
  } else if (message.client) {
    clientsToRender.push(message.client);
  }

  // Determine tasks to display
  const tasksToRender: TaskItem[] = [];
  if (message.tasks && message.tasks.length > 0) {
    tasksToRender.push(...message.tasks);
  } else if (message.task) {
    tasksToRender.push(message.task);
  }

  return (
    <View style={styles.assistantContainer}>
      <View style={styles.assistantAvatar}>
        <Sparkles size={14} color={colors.primary} />
      </View>

      <View style={styles.assistantBubble}>
        {Boolean(message.content) && (
          <ChatMarkdownText content={message.content} style={styles.assistantText} />
        )}

        {/* Schedule Cards if present */}
        {schedulesToRender.map((sched, idx) => (
          <ChatScheduleCard
            key={sched.id || `sched-${idx}`}
            schedule={sched}
            isDeleted={message.isDeletedSchedule}
            onEdit={(s) => onEditSchedule?.(s)}
            onDelete={(id, title) => onDeleteSchedule?.(id, title)}
            onOpen={(s) => onOpenSchedule?.(s)}
          />
        ))}

        {/* Invoice Cards if present */}
        {invoicesToRender.map((inv, idx) => (
          <ChatInvoiceCard
            key={inv.id || `inv-${idx}`}
            invoice={inv}
            isDeleted={message.isDeletedInvoice}
            onEdit={(i) => onEditInvoice?.(i)}
            onDelete={(id, num) => onDeleteInvoice?.(id, num)}
            onOpen={(i) => onOpenInvoice?.(i)}
          />
        ))}

        {/* Client Cards if present */}
        {clientsToRender.map((cli, idx) => (
          <ChatClientCard
            key={cli.id || `cli-${idx}`}
            client={cli}
            isDeleted={message.isDeletedClient}
            onEdit={(c) => onEditClient?.(c)}
            onDelete={(id, name) => onDeleteClient?.(id, name)}
            onOpen={(c) => onOpenClient?.(c)}
          />
        ))}

        {/* Task Cards if present */}
        {tasksToRender.map((tsk, idx) => (
          <ChatTaskCard
            key={tsk.id || `tsk-${idx}`}
            task={tsk}
            isDeleted={message.isDeletedTask}
            onToggleComplete={(id) => onToggleTaskComplete?.(id)}
            onEdit={(t) => onEditTask?.(t)}
            onDelete={(id, title) => onDeleteTask?.(id, title)}
            onOpen={(t) => onOpenTask?.(t)}
          />
        ))}

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
    maxWidth: '88%',
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
