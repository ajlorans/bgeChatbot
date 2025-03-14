export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
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
  | "general";

export interface ChatRequest {
  messages: Message[];
  category?: ChatCategory;
}

export interface ChatResponse {
  messages: Message[];
  category?: ChatCategory;
}
