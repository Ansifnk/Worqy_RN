import { ScheduleItem } from '../schedule/types';
import { Invoice } from '../invoices/types';
import { ClientItem } from '../clients/types';
import { TaskItem } from '../tasks/types';

export interface ChatAction {
  tool: string;
  result: any;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isSending?: boolean;
  actions?: ChatAction[];
  schedule?: ScheduleItem;
  schedules?: ScheduleItem[];
  invoice?: Invoice;
  invoices?: Invoice[];
  client?: ClientItem;
  clients?: ClientItem[];
  task?: TaskItem;
  tasks?: TaskItem[];
  isDeletedSchedule?: boolean;
  isDeletedInvoice?: boolean;
  isDeletedClient?: boolean;
  isDeletedTask?: boolean;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  reply: ChatMessage;
  actions?: ChatAction[];
}

