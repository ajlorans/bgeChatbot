/**
 * Basic chat message type definition
 */
export interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  sender?: {
    id: string;
    name: string;
  };
  isAgent?: boolean;
  isSystem?: boolean;
  category?: string;
  metadata?: {
    chatSessionId?: string;
    [key: string]: unknown;
  };
  receivedAt?: number;
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
