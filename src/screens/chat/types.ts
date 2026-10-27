import { ScheduleItem } from '../schedule/types';

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
  isDeletedSchedule?: boolean;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  reply: ChatMessage;
  actions?: ChatAction[];
}

