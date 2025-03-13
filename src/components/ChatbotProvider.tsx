"use client";

import React, { createContext, useContext, useState } from "react";
import Chatbot from "./Chatbot";

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
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
  initialMessage,
  primaryColor,
  botName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <ChatbotContext.Provider
      value={{ isOpen, openChat, closeChat, toggleChat }}
    >
      {children}
      <Chatbot
        initialMessage={initialMessage}
        primaryColor={primaryColor}
        botName={botName}
      />
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider;
