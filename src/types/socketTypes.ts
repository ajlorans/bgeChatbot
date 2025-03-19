import { Message, ChatSession } from './chatTypes';

export interface ServerToClientEvents {
  messageReceived: (message: Message) => void;
  agentTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  customerTyping: (data: { sessionId: string; isTyping: boolean }) => void;
  sessionUpdated: (session: ChatSession) => void;
  chatEnded: (data: { sessionId: string; endedBy: 'agent' | 'customer' }) => void;
}

export interface ClientToServerEvents {
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  typing: (data: { sessionId: string; isTyping: boolean }) => void;
  endChat: (sessionId: string) => void;
  markRead: (sessionId: string) => void;
  updateStatus: (data: { sessionId: string; status: string }) => void;
} 