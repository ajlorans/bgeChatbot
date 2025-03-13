import { Message, ChatCategory } from "./types";

export function generateUniqueId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getCurrentTimestamp(): number {
  return Date.now();
}

export function createMessage(
  role: "user" | "assistant" | "system",
  content: string
): Message {
  return {
    id: generateUniqueId(),
    role,
    content,
    timestamp: getCurrentTimestamp(),
  };
}

export function detectCategory(message: string): ChatCategory {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("order") ||
    lowerMessage.includes("shipping") ||
    lowerMessage.includes("delivery") ||
    lowerMessage.includes("tracking")
  ) {
    return "order_status";
  }

  if (
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("which product") ||
    lowerMessage.includes("best grill") ||
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("should buy") ||
    lowerMessage.includes("should get") ||
    lowerMessage.includes("what grill") ||
    lowerMessage.includes("which grill") ||
    lowerMessage.includes("family of") ||
    lowerMessage.includes("looking for") ||
    (lowerMessage.includes("need") &&
      (lowerMessage.includes("grill") ||
        lowerMessage.includes("egg") ||
        lowerMessage.includes("product")))
  ) {
    return "product_recommendation";
  }

  if (
    lowerMessage.includes("help") ||
    lowerMessage.includes("support") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("problem")
  ) {
    return "customer_support";
  }

  if (
    lowerMessage.includes("tip") ||
    lowerMessage.includes("trick") ||
    lowerMessage.includes("how to") ||
    lowerMessage.includes("advice")
  ) {
    return "tips_and_tricks";
  }

  if (
    lowerMessage.includes("recipe") ||
    lowerMessage.includes("cook") ||
    lowerMessage.includes("food") ||
    lowerMessage.includes("meal")
  ) {
    return "recipes";
  }

  return "general";
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return ""; // Return empty string if date is invalid
  }
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

export const defaultSystemPrompt = `You are a helpful assistant for Big Green Egg, a premium ceramic grill and smoker company. 
Your name is BGE Assistant.

You can help with:
1. Order status inquiries
   - Ask for order number if not provided
   - Format: "To check your order status, please provide your order number (e.g., #123456)"
   - Once order number is provided, I will fetch the status
2. Product recommendations based on customer needs
3. Customer support for common issues
4. Tips and tricks for using Big Green Egg products
5. Recipes and cooking advice for Big Green Egg grills
6. General information about Big Green Egg products

For order status:
- If no order number is provided, ask for it
- If an order number is provided, I will check its status
- If the order lookup fails, provide customer service contact information

Always be friendly, helpful, and knowledgeable about Big Green Egg products. 
If you don't know something, be honest and suggest the customer contact support directly.
Keep responses concise but informative.`;
