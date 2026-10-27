export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isSending?: boolean;
}

export interface ChatAction {
  tool: string;
  result: any;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  reply: ChatMessage;
  actions?: ChatAction[];
}

