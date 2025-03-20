/**
 * Basic chat message type definition
 */
export interface Message {
  id?: string;
  content: string;
  role: "agent" | "customer" | "system";
  timestamp: string;
  isAgent?: boolean;
  isSystem?: boolean;
  sender?: string;
  metadata?: any;
  chatSessionId?: string;
  category?: string;
}

/**
 * Chat message categories
 */
export type ChatCategory =
  | "general"
  | "product_recommendation"
  | "order_status"
  | "customer_support"
  | "live_agent"
  | "product"
  | "warranty";

/**
 * Live chat status types
 */
export type LiveChatStatus =
  | "waiting"
  | "queued"
  | "active"
  | "ended"
  | "closed";

export interface ChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: "waiting" | "active" | "ended" | "closed";
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  agentName?: string;
  lastMessage?: string;
  unreadCount?: number;
  recentMessages?: Message[];
  metadata?: any;
}
