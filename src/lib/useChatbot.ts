"use client";

import { useState, useCallback, useEffect } from "react";
import { Message, ChatCategory } from "./types";
import { createMessage } from "./utils";

interface UseChatbotProps {
  initialMessage?: string;
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  category?: ChatCategory;
}

export function useChatbot({
  initialMessage = "Hi there! I'm your Big Green Egg assistant. How can I help you today?",
}: UseChatbotProps = {}): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<ChatCategory | undefined>(undefined);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([createMessage("assistant", initialMessage)]);
    }
  }, [initialMessage, messages.length]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage = createMessage("user", content);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        if (data.message) {
          // Handle single message response with category
          const assistantMessage = createMessage("assistant", data.message);
          if (data.category) {
            assistantMessage.category = data.category;
            setCategory(data.category);
          }
          setMessages((prev) => [...prev, assistantMessage]);
        } else if (Array.isArray(data.messages) && data.messages.length > 0) {
          // Handle multiple messages response
          setMessages((prev) => [...prev, ...data.messages]);

          // Set category from the last message if available
          const lastMessage = data.messages[data.messages.length - 1];
          if (lastMessage.category) {
            setCategory(lastMessage.category);
          } else if (data.category) {
            setCategory(data.category);
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again later."
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  const resetChat = useCallback(() => {
    setMessages([createMessage("assistant", initialMessage)]);
    setCategory(undefined);
  }, [initialMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    category,
  };
}
