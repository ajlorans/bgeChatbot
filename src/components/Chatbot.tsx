"use client";

import React, { useRef, useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { useChatbot } from "@/lib/useChatbot";
import { useChatbotContext } from "./ChatbotProvider";

interface ChatbotProps {
  initialMessage?: string;
  primaryColor?: string;
  botName?: string;
}

// Order Status Form Component
interface OrderStatusFormProps {
  onSubmit: (orderNumber: string, email: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  primaryColor: string;
}

const OrderStatusForm: React.FC<OrderStatusFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  primaryColor,
}) => {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ orderNumber: "", email: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const newErrors = { orderNumber: "", email: "" };
    let hasError = false;

    if (!orderNumber.trim()) {
      newErrors.orderNumber = "Order number is required";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    onSubmit(orderNumber, email);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        Check Order Status
      </h3>
      <p className="text-sm text-gray-800 mb-4">
        Please enter your order number and the email address associated with
        your order.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            htmlFor="orderNumber"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Order Number
          </label>
          <input
            type="text"
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. 123456"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
              errors.orderNumber ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          />
          {errors.orderNumber && (
            <p className="mt-1 text-xs text-red-500">{errors.orderNumber}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-800 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            disabled={isLoading}
          >
            {isLoading ? "Checking..." : "Check Status"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Chatbot: React.FC<ChatbotProps> = ({
  initialMessage = "Hi there! I'm your Big Green Egg assistant. How can I help you today?",
  primaryColor = "#006838", // BGE green
  botName = "BGE Assistant",
}) => {
  const { isOpen, toggleChat, closeChat } = useChatbotContext();
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showOrderStatusForm, setShowOrderStatusForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, sendMessage } = useChatbot({
    initialMessage,
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Hide quick actions after first user message
  useEffect(() => {
    if (messages.some((msg) => msg.role === "user")) {
      setShowQuickActions(false);
    }
  }, [messages]);

  const handleQuickAction = async (action: string) => {
    let message = "";
    switch (action) {
      case "order_status":
        setShowOrderStatusForm(true);
        return;
      case "product_recommendation":
        message = "Can you recommend a product for me?";
        break;
      case "customer_support":
        message = "I'd like some customer support assistance.";
        break;
      case "tips_and_tricks":
        message = "Can you share some cooking tips or recipes?";
        break;
      case "product_registration":
        message = "I need to register my product";
        break;
      case "browse_products":
        message = "I want to browse your products";
        break;
    }
    await sendMessage(message);
    setShowQuickActions(false);
  };

  const handleOrderStatusSubmit = async (
    orderNumber: string,
    email: string
  ) => {
    const message = `${orderNumber} ${email}`;
    await sendMessage(message);
    setShowOrderStatusForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Check if the input looks like an order status request
    const orderStatusRegex = /order|status|track|where.*order|check.*order/i;
    if (orderStatusRegex.test(inputValue.toLowerCase())) {
      setShowOrderStatusForm(true);
      setInputValue("");
      return;
    }

    await sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderMessage = (content: string) => {
    // Check if the content contains HTML
    if (content.includes('<div class="order-details">')) {
      return (
        <div
          className="order-details bg-white p-4 rounded-md shadow-sm border border-gray-200"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }
    // Otherwise, render as markdown with link support
    return (
      <ReactMarkdown
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 underline hover:text-green-900"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button - only show when chat is closed */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none transition-transform hover:scale-110"
          style={{ backgroundColor: primaryColor }}
          aria-label="Open chat"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col mb-2 overflow-hidden"
          style={{ border: `2px solid ${primaryColor}` }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <h3 className="font-medium text-white">{botName}</h3>
            <button
              onClick={closeChat}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white ml-auto"
                      : "bg-gray-100 text-gray-900 mr-auto"
                  } shadow-sm`}
                >
                  <div
                    className={`prose prose-sm max-w-none ${
                      message.role === "user" ? "prose-invert" : ""
                    }
                    [&_.order-details]:bg-white [&_.order-details]:p-4 [&_.order-details]:rounded-md [&_.order-details]:shadow-sm [&_.order-details]:border [&_.order-details]:border-gray-200
                    [&_.label]:text-gray-600 [&_.label]:font-semibold [&_.value]:ml-2 [&_.value]:text-gray-900
                    [&_.status-item]:flex [&_.status-item]:items-center [&_.status-item]:mb-2 [&_.status-item]:p-1
                    [&_.detail-item]:flex [&_.detail-item]:items-center [&_.detail-item]:mb-2 [&_.detail-item]:p-1 [&_.detail-item]:flex-wrap [&_.detail-item]:gap-x-2
                    [&_.items-list]:mt-3 [&_.items-list]:space-y-2 [&_.items-list]:text-sm [&_.items-list]:border-t [&_.items-list]:border-gray-100 [&_.items-list]:pt-3
                    [&_.tracking-link]:text-blue-600 [&_.tracking-link]:font-medium [&_.tracking-link]:hover:underline [&_.tracking-link]:hover:text-blue-700 [&_.tracking-link]:break-all
                    [&_.processing]:text-yellow-600 [&_.processing]:font-medium
                    [&_.completed]:text-green-600 [&_.completed]:font-medium
                    [&_.unfulfilled]:text-gray-600 [&_.unfulfilled]:font-medium
                    [&_.fulfilled]:text-green-600 [&_.fulfilled]:font-medium
                    [&_.paid]:text-green-600 [&_.paid]:font-medium
                    [&_.pending]:text-yellow-600 [&_.pending]:font-medium
                    [&_.refunded]:text-red-600 [&_.refunded]:font-medium
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:text-gray-900
                    [&_p]:mb-2 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3
                    [&_li]:mb-1
                    [&_strong]:font-semibold
                    [&_a]:text-blue-600 [&_a]:hover:underline`}
                  >
                    {renderMessage(message.content)}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === "user" ? "text-blue-50" : "text-gray-500"
                    }`}
                  >
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Order Status Form */}
            {showOrderStatusForm && (
              <OrderStatusForm
                onSubmit={handleOrderStatusSubmit}
                onCancel={() => setShowOrderStatusForm(false)}
                isLoading={isLoading}
                primaryColor={primaryColor}
              />
            )}

            {showQuickActions &&
              messages.length === 1 &&
              !showOrderStatusForm && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickAction("order_status")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    📦 Check Order Status
                  </button>
                  <button
                    onClick={() => handleQuickAction("product_recommendation")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    🛍️ Product Recommendations
                  </button>
                  <button
                    onClick={() => handleQuickAction("customer_support")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    🤝 Customer Support
                  </button>
                  <button
                    onClick={() => handleQuickAction("tips_and_tricks")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    👨‍🍳 Recipes & Tips
                  </button>
                  <button
                    onClick={() => handleQuickAction("product_registration")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    📝 Register Product
                  </button>
                  <button
                    onClick={() => handleQuickAction("browse_products")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    🛒 Browse Products
                  </button>
                </div>
              )}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!showOrderStatusForm && (
            <form onSubmit={handleSubmit} className="p-3 border-t">
              <div className="flex items-end">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none text-gray-900 placeholder-gray-500"
                  style={{ maxHeight: "100px", minHeight: "40px" }}
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className={`ml-2 p-2 rounded-full focus:outline-none ${
                    isLoading || !inputValue.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-opacity-90"
                  }`}
                  style={{ backgroundColor: primaryColor }}
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
