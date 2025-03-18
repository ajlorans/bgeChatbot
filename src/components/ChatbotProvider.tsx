"use client";

import React, { createContext, useContext, useState } from "react";
import Chatbot from "./Chatbot";
import { usePathname } from "next/navigation";

interface ChatbotContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return context;
};

interface ChatbotProviderProps {
  children: React.ReactNode;
  initialMessage?: string;
  primaryColor?: string;
  botName?: string;
  showChatBubble?: boolean;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  initialMessage,
  primaryColor,
  botName,
  showChatBubble = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on an agent-related page
  const isAgentPage =
    pathname?.includes("/agent-dashboard") ||
    pathname?.includes("/agent-login");

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <ChatbotContext.Provider
      value={{ isOpen, openChat, closeChat, toggleChat }}
    >
      {children}
      {/* Only render the Chatbot if we're not on an agent page */}
      {!isAgentPage && (
        <Chatbot
          initialMessage={initialMessage}
          primaryColor={primaryColor}
          botName={botName}
          showChatBubble={showChatBubble}
        />
      )}
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;
