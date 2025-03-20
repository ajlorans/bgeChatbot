"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { useChatbot } from "@/lib/useChatbot";
import { useChatbotContext } from "./ChatbotProvider";
import { ProductRecommendation } from "@/app/components/ProductRecommendation";
import {
  sanitizeInput,
  sanitizeOrderNumber,
  sanitizeEmail,
} from "@/lib/sanitizer";

interface ChatInterfaceProps {
  initialMessage?: string;
  primaryColor?: string;
  botName?: string;
  isEmbedded?: boolean;
  onAction?: (type: string, data: { [key: string]: any }) => void;
}

const ChatInterface = ({
  initialMessage = "Hi there! I'm your Big Green Egg assistant. How can I help you today?",
  primaryColor = "#006838", // BGE green
  botName = "BGE Assistant",
  isEmbedded = false,
  onAction,
}: ChatInterfaceProps) => {
  const [userInput, setUserInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    isLoading,
    isLiveChat,
    liveChatStatus,
    liveChatDetails,
    requestLiveAgent,
    endLiveChat,
    category,
    orderStatus,
    setOrderStatus,
  } = useChatbot({
    initialMessage,
    isLiveChat: false,
    liveChatDetails: undefined,
  });

  const { isOpen } = useChatbotContext();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Report container height for embedded widget
  useEffect(() => {
    if (isEmbedded && chatContainerRef.current && onAction) {
      const resizeObserver = new ResizeObserver((entries) => {
        const height = entries[0].contentRect.height;
        onAction("resize", { height });
      });

      resizeObserver.observe(chatContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isEmbedded, onAction]);

  const handleQuickAction = async (action: string) => {
    setUserInput(action);
    await sendMessage(action);
  };

  const handleOrderStatusSubmit = async (
    orderNumber: string,
    email: string
  ) => {
    const sanitizedOrderNumber = sanitizeOrderNumber(orderNumber);
    const sanitizedEmail = sanitizeEmail(email);

    await sendMessage(
      `Check my order status: Order #${sanitizedOrderNumber}, Email: ${sanitizedEmail}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    const sanitizedInput = sanitizeInput(userInput);
    setUserInput("");
    await sendMessage(sanitizedInput);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRequestLiveAgent = async () => {
    setShowEmailForm(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(emailInput)) {
      alert("Please enter a valid email address");
      return;
    }

    setShowEmailForm(false);
    await requestLiveAgent(emailInput, nameInput);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const renderLiveChatStatus = () => {
    if (!isLiveChat) return null;

    const statusMap: { [key: string]: { text: string; icon: JSX.Element } } = {
      waiting: {
        text: "Waiting for an agent...",
        icon: <ClockIcon className="w-5 h-5 text-yellow-500" />,
      },
      connected: {
        text: "Connected with agent",
        icon: <UserIcon className="w-5 h-5 text-green-500" />,
      },
      ended: {
        text: "Chat ended",
        icon: <PhoneIcon className="w-5 h-5 text-red-500" />,
      },
    };

    const status = statusMap[liveChatStatus] || statusMap.waiting;

    return (
      <div className="bg-gray-100 py-2 px-4 rounded-md text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status.icon}
          <span>
            {status.text}
            {liveChatStatus === "waiting" && liveChatDetails?.queuePosition && (
              <> (Position in queue: {liveChatDetails.queuePosition})</>
            )}
          </span>
        </div>
        {liveChatStatus !== "ended" && (
          <button
            onClick={endLiveChat}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            End Chat
          </button>
        )}
      </div>
    );
  };

  const renderEmailInputForm = () => {
    if (!showEmailForm) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md my-4">
        <h3 className="text-lg font-semibold mb-3">
          Request to speak with an agent
        </h3>
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Connect
            </button>
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderMessage = (content: string, category?: string) => {
    if (category === "product_recommendation") {
      try {
        const productData = JSON.parse(content);
        return <ProductRecommendation product={productData} />;
      } catch (error) {
        console.error("Failed to parse product recommendation:", error);
        return <ReactMarkdown>{content}</ReactMarkdown>;
      }
    }

    return <ReactMarkdown>{content}</ReactMarkdown>;
  };

  return (
    <div
      ref={chatContainerRef}
      className={`flex flex-col h-full bg-white ${
        isEmbedded ? "border-none" : "border rounded-lg shadow-lg"
      }`}
    >
      <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.role === "user"
                ? "flex justify-end"
                : msg.role === "system"
                ? "flex justify-center"
                : "flex justify-start"
            }`}
          >
            {msg.role === "system" ? (
              <div className="bg-gray-100 py-2 px-4 rounded-md text-sm max-w-[75%] text-center">
                {renderMessage(msg.content, msg.category)}
              </div>
            ) : (
              <div
                className={`py-2 px-4 rounded-lg max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {renderMessage(msg.content, msg.category)}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 py-2 px-4 rounded-lg flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm text-gray-500">{botName} is typing</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {renderEmailInputForm()}
      {renderLiveChatStatus()}

      <div className="border-t border-gray-200 p-4">
        {!showEmailForm && (
          <>
            <div className="flex space-x-2 mb-3 overflow-x-auto pb-1">
              <button
                onClick={() =>
                  handleQuickAction(
                    "What are the main features of the Big Green Egg?"
                  )
                }
                className="bg-gray-100 px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
              >
                BGE Features
              </button>
              <button
                onClick={() =>
                  handleQuickAction("How do I clean my Big Green Egg?")
                }
                className="bg-gray-100 px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
              >
                Cleaning Tips
              </button>
              <button
                onClick={() =>
                  handleQuickAction("What can I cook on my Big Green Egg?")
                }
                className="bg-gray-100 px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
              >
                Cooking Ideas
              </button>
              <button
                onClick={handleRequestLiveAgent}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
              >
                Speak to Agent
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none overflow-auto text-sm min-h-10 max-h-28"
                  rows={1}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className={`p-2 rounded-full ${
                  isLoading || !userInput.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
