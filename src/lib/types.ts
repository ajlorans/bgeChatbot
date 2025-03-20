export type MessageRole = "user" | "assistant" | "system" | "agent";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  category?: ChatCategory;
  agentName?: string;
  metadata?: any;
  receivedAt?: number;
  isAgent?: boolean;
  isSystem?: boolean;
  sender?: string;
  chatSessionId?: string;
}

// Add type definition for Next.js API route handlers with dynamic params
export interface RouteHandlerParams<T extends Record<string, string>> {
  params: T;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  agentId?: string;
  isLiveChat?: boolean;
  status?: LiveChatStatus;
  customerEmail?: string;
  customerId?: string;
}

export interface ChatbotSettings {
  apiKey?: string;
  shopifyStoreUrl?: string;
  shopifyAccessToken?: string;
  initialMessage: string;
  botName: string;
  primaryColor: string;
  secondaryColor: string;
}

export type ChatCategory =
  | "order_status"
  | "product_recommendation"
  | "customer_support"
  | "tips_and_tricks"
  | "recipes"
  | "product_registration"
  | "merchandise"
  | "general"
  | "live_agent";

export interface ChatRequest {
  messages: Message[];
  category?: ChatCategory;
}

export interface ChatResponse {
  messages: Message[];
  category?: ChatCategory;
}

export type LiveChatStatus =
  | "requested" // User has requested a live agent
  | "queued" // User is waiting for an agent
  | "waiting" // User is waiting for an agent (dashboard terminology)
  | "active" // User is connected with an agent
  | "ended" // Chat session has ended
  | "closed" // Chat session is completed and in history
  | "abandoned"; // User left before agent connected

export interface LiveChatRequest {
  sessionId: string;
  customerEmail?: string;
  customerName?: string;
  issue?: string;
  priority?: "low" | "medium" | "high";
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isAvailable: boolean;
  role: "agent" | "supervisor" | "admin";
  activeSessions: string[]; // Array of active session IDs
  lastActive: number;
}
