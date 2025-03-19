"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  ClockIcon,
  PhoneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import { useChatbot } from "@/lib/useChatbot";
import { useChatbotContext } from "./ChatbotProvider";
import { ProductRecommendation } from "@/app/components/ProductRecommendation";
import { rateLimiter } from "@/lib/rateLimiter";
import {
  sanitizeInput,
  sanitizeOrderNumber,
  sanitizeEmail,
} from "@/lib/sanitizer";
import { Message } from "@/lib/types";

interface ChatbotProps {
  initialMessage?: string;
  primaryColor?: string;
  botName?: string;
  showChatBubble?: boolean;
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

const Chatbot = ({
  initialMessage = "Hi there! I'm your Big Green Egg assistant. How can I help you today?",
  primaryColor = "#006838", // BGE green
  botName = "BGE Assistant",
  showChatBubble = true,
  ...props
}: ChatbotProps) => {
  // Define all refs at the beginning of the component
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesRef = useRef<Message[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { isOpen, toggleChat, closeChat } = useChatbotContext();
  const [inputValue, setInputValue] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showOrderStatusForm, setShowOrderStatusForm] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [hasInteractedWithChat, setHasInteractedWithChat] = useState(false);

  const {
    messages,
    isLoading,
    sendMessage,
    isLiveChat,
    liveChatStatus,
    liveChatDetails,
    requestLiveAgent,
    endLiveChat,
    resetChat,
    agentName: currentAgentName,
  } = useChatbot({
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
    const hasUserMessage = messages.some((msg) => msg.role === "user");
    
    if (hasUserMessage && showQuickActions) {
      setShowQuickActions(false);
    }
  }, [messages, showQuickActions]);

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
        message = "I'd like to find a recipe for cooking on my Big Green Egg.";
        break;
      case "product_registration":
        message = "I want to know the warranty information";
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
    // Sanitize inputs
    const sanitizedOrderNumber = sanitizeOrderNumber(orderNumber);
    const sanitizedEmail = sanitizeEmail(email);

    // Check rate limiting
    const identifier = `order_status_${sanitizedEmail}`;
    if (rateLimiter.isRateLimited(identifier)) {
      alert("Too many requests. Please try again later.");
      return;
    }

    const message = `${sanitizedOrderNumber} ${sanitizedEmail}`;
    await sendMessage(message);
    setShowOrderStatusForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Sanitize input
    const sanitizedInput = sanitizeInput(inputValue);

    // Check rate limiting
    const identifier = `chat_message_${Date.now()}`;
    if (rateLimiter.isRateLimited(identifier)) {
      alert("Too many messages. Please wait a moment before sending more.");
      return;
    }

    // Check if the input looks like an order status request
    const orderStatusRegex = /order|status|track|where.*order|check.*order/i;
    if (orderStatusRegex.test(sanitizedInput.toLowerCase())) {
      setShowOrderStatusForm(true);
      setInputValue("");
      return;
    }

    await sendMessage(sanitizedInput);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle requesting a live agent
  const handleRequestLiveAgent = async () => {
    // If chat has ended, we shouldn't allow starting a new chat without page refresh
    if (liveChatStatus === "ended") {
      return;
    }
    
    // If we already have an email, use it directly
    if (customerEmail && validateEmail(customerEmail)) {
      await requestLiveAgent(customerEmail);
      setShowEmailInput(false);
      return;
    }

    // Show email input form for user to enter their info
    setShowEmailInput(true);
  };

  // Handle submitting the email for live agent
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!customerName) {
      setNameError("Please enter your name");
      hasError = true;
    } else {
      setNameError("");
    }

    if (!customerEmail) {
      setEmailError("Please enter your email address");
      hasError = true;
    } else if (!validateEmail(customerEmail)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (hasError) return;

    await requestLiveAgent(customerEmail, customerName);
    setShowEmailInput(false);
  };

  // Validate email format
  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Fix the renderLiveChatStatus function with proper type checking
  const renderLiveChatStatus = () => {
    if (!isLiveChat) return null;

    if (liveChatStatus === "queued" || liveChatStatus === "waiting") {
      const queuePosition = liveChatDetails?.queuePosition;
      const estimatedTime = liveChatDetails?.estimatedWaitTime;

      return (
        <div className="flex items-center p-2 bg-yellow-50 border-y border-yellow-200">
          <ClockIcon className="w-5 h-5 mr-2 text-yellow-500" />
          <span className="text-sm">
            <span className="font-medium text-gray-800">Waiting for an agent...</span>
            {queuePosition !== undefined && queuePosition > 0 && (
              <span className="block mt-1 text-gray-800">
                Position in queue: #{queuePosition}
              </span>
            )}
            {estimatedTime !== undefined && estimatedTime > 0 && (
              <span className="block mt-1 text-gray-800">
                Estimated wait time: ~{estimatedTime} minutes
              </span>
            )}
          </span>
        </div>
      );
    }

    if (liveChatStatus === "active") {
      return (
        <div className="flex items-center p-2 bg-green-50 border-y border-green-200">
          <UserIcon className="w-5 h-5 mr-2 text-green-500" />
          <span className="text-sm text-gray-800">
            Connected with {currentAgentName || liveChatDetails?.agentName || "Agent"}
          </span>
          <button
            onClick={endLiveChat}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
            aria-label="End chat"
          >
            End chat
          </button>
        </div>
      );
    }

    return null;
  };

  // Email input form for live chat
  const renderEmailInputForm = () => {
    if (!showEmailInput) return null;

    return (
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleEmailSubmit} className="space-y-2">
          <p className="text-sm text-gray-700">
            Please provide your information so our agent can assist you better:
          </p>
          <div className="mb-2">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-800"
              placeholder="Your name"
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
          </div>
          <div className="mb-2">
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-gray-800"
              placeholder="your.email@example.com"
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowEmailInput(false)}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-white rounded"
              style={{ backgroundColor: primaryColor }}
            >
              Connect with Agent
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderMessage = (content: string, category?: string) => {
    // If it's a product recommendation, use the ProductRecommendation component
    if (category === "product_recommendation") {
      return (
        <div className="product-recommendation-wrapper">
          <ProductRecommendation
            message={content}
            products={[]} // In a real implementation, you would parse products from the message or fetch them
            bundles={[]} // In a real implementation, you would parse bundles from the message or fetch them
          />
        </div>
      );
    }

    // If it's a product search result, render with enhanced styling
    if (category === "product") {
      return (
        <ReactMarkdown
          components={{
            a: ({ ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 underline hover:text-green-900 font-medium"
              />
            ),
            strong: ({ ...props }) => (
              <strong {...props} className="font-bold text-green-800" />
            ),
            p: ({ ...props }) => (
              <p {...props} className="mb-4 leading-relaxed" />
            ),
            ul: ({ ...props }) => (
              <ul {...props} className="list-disc pl-5 space-y-2 my-4" />
            ),
            li: ({ ...props }) => <li {...props} className="pl-1 mb-2" />,
          }}
        >
          {content}
        </ReactMarkdown>
      );
    }

    // Check if the content contains HTML for order details
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
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc pl-5 space-y-2 my-4" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal pl-5 space-y-2 my-4" />
          ),
          li: ({ ...props }) => <li {...props} className="pl-1 mb-2" />,
          p: ({ ...props }) => (
            <p {...props} className="mb-4 leading-relaxed" />
          ),
          h1: ({ ...props }) => (
            <h1 {...props} className="text-xl font-bold mb-4 mt-6" />
          ),
          h2: ({ ...props }) => (
            <h2 {...props} className="text-lg font-bold mb-3 mt-5" />
          ),
          h3: ({ ...props }) => (
            <h3 {...props} className="text-md font-bold mb-3 mt-4" />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-300 pl-4 italic my-4"
            />
          ),
          code: ({ ...props }) => (
            <code
              {...props}
              className="bg-gray-100 rounded px-1 py-0.5 text-sm"
            />
          ),
          pre: ({ ...props }) => (
            <pre
              {...props}
              className="bg-gray-100 rounded p-3 overflow-x-auto my-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Fix the useEffect with useRef
  useEffect(() => {
    // Use the refs defined at the top level of the component
    // Don't create new refs here
    
    // Function to handle changes that won't re-trigger effects
    const handleNewMessages = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Only run side effects if messages actually changed
    if (JSON.stringify(messages) !== JSON.stringify(prevMessagesRef.current)) {
      prevMessagesRef.current = [...messages];
      handleNewMessages();
    }
    
    // Clean up on unmount
    return () => {
      // Cleanup code...
    };
  }, [messages]);

  // Custom toggle chat function to track interactions
  const handleToggleChat = () => {
    // If we're opening the chat or closing it for the first time
    if (!isOpen || !hasInteractedWithChat) {
      setHasInteractedWithChat(true);
    }
    toggleChat();
  };

  // Custom close chat function
  const handleCloseChat = () => {
    setHasInteractedWithChat(true);
    closeChat();
  };

  // Add an effect to handle window close/refresh events
  useEffect(() => {
    // Function to notify the server when the window is closed/refreshed
    const handleBeforeUnload = () => {
      // If we have an active live chat session, notify the server
      if (isLiveChat && liveChatDetails?.sessionId) {
        try {
          // Using navigator.sendBeacon for reliable delivery during page unload
          const data = JSON.stringify({
            sessionId: liveChatDetails.sessionId,
            reason: 'customer_left',
            endedBy: 'customer'
          });
          
          // Use sendBeacon which works better during page unload than fetch
          navigator.sendBeacon('/api/chat/live-chat/end', data);
        } catch (error) {
          // Can't log during unload, but we tried our best
        }
      }
    };
    
    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLiveChat, liveChatDetails]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Chat button - only show when chat is closed */}
      {!isOpen && (
        <>
          {/* Chat bubble prompt - only show if showChatBubble is true and user hasn't interacted with chat yet */}
          {showChatBubble && !hasInteractedWithChat && (
            <div
              className="mb-2 bg-white rounded-lg shadow-md p-3 max-w-xs"
              style={{ borderColor: primaryColor, borderWidth: "1px" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: primaryColor }}
              >
                Need help or have questions? Chat with me!
              </p>
            </div>
          )}
          <button
            onClick={handleToggleChat}
            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none transition-transform hover:scale-110"
            style={{ backgroundColor: primaryColor }}
            aria-label="Open chat"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="w-96 sm:w-[450px] h-[700px] max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col mb-2 overflow-hidden"
          style={{ border: `2px solid ${primaryColor}` }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <h3 className="font-medium text-white">{botName}</h3>
            <button
              onClick={handleCloseChat}
              className="text-white hover:text-gray-200 focus:outline-none p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
            {messages
              .reduce<Message[]>(
                (
                  uniqueMessages: Message[],
                  message: Message,
                  index: number,
                  array: Message[]
                ) => {
                  const prevMessage = index > 0 ? array[index - 1] : null;
                  if (
                    prevMessage &&
                    prevMessage.role === message.role &&
                    prevMessage.content === message.content
                  ) {
                    // Handle timestamps that could be either strings or numbers
                    const getTimestamp = (ts: number | string): number => {
                      if (typeof ts === "number") return ts;
                      try {
                        const parsed = Date.parse(ts as string);
                        return isNaN(parsed) ? Date.now() : parsed;
                      } catch {
                        return Date.now();
                      }
                    };

                    const prevTime = getTimestamp(prevMessage.timestamp);
                    const currTime = getTimestamp(message.timestamp);

                    if (Math.abs(prevTime - currTime) < 3000) {
                      console.log(
                        "Skipping duplicate message:",
                        message.content
                      );
                      return uniqueMessages;
                    }
                  }
                  return [...uniqueMessages, message];
                },
                []
              )
              .map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  {message.role === "agent" && (
                    <div className="flex flex-col items-center mr-2">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-green-600 rounded-full">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                        {message.agentName || currentAgentName || "Agent"}
                      </span>
                    </div>
                  )}
                  
                  {message.role === "assistant" && (
                    <div className="flex flex-col items-center mr-2">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-green-600 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.625 6.4c-.125.125-.22.274-.282.411-.062.137-.11.29-.138.434h3.59c-.029-.145-.076-.297-.138-.434-.063-.137-.158-.286-.281-.41-.229-.229-.57-.386-.886-.386-.318 0-.658.157-.886.385l-.978.979zm1.382-.282c.374 0 .733.149 1.14.386.253-.307.392-.683.392-1.065 0-.399-.157-.78-.438-1.062A1.501 1.501 0 0010 4c-.828 0-1.5.672-1.5 1.5 0 .382.139.758.393 1.065.406-.237.765-.386 1.14-.386h-.026zm4.343 7.57l-1.088 1.089a1.71 1.71 0 01-1.214.5H7.952c-.454 0-.894-.167-1.214-.5L5.65 13.7a1.694 1.694 0 01-.5-1.213V7.88c0-.563.137-1.107.396-1.595l.667-1.222a1.69 1.69 0 011.585-.968c.693.033 1.286.5 1.5 1.171l.214.688a1.68 1.68 0 001.59 1.123h.374c.709 0 1.33-.472 1.52-1.152l.204-.682c.22-.67.81-1.2 1.5-1.2a1.69 1.69 0 011.638 1.246l.148.536c.117.425.18.864.18 1.306v3.544c0 .341-.102.673-.29.957z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 mt-1">BGE Assistant</span>
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${
                      message.role === "system"
                        ? "bg-blue-100 text-blue-800 italic mx-auto w-full max-w-full"
                        : message.role === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : message.role === "agent"
                        ? "bg-green-100 text-gray-800 rounded-bl-none border border-green-200"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {message.role === "system" ? (
                      <p className="text-sm italic">{message.content}</p>
                    ) : message.role === "agent" ||
                      message.role === "assistant" ? (
                      <div className="prose prose-sm">
                        {renderMessage(message.content, message.category)}
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex flex-col items-center ml-2">
                      <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                        {customerName || "You"}
                      </span>
                    </div>
                  )}
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
                    🛍️ Egg Recommendation
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
                    👨‍🍳 Recipes
                  </button>
                  <button
                    onClick={() => handleQuickAction("product_registration")}
                    className="p-2 text-sm bg-white border-2 border-green-700 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    📝 Warranty/Registration
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

          {/* Add this after the messages map and before the chat form */}
          {renderLiveChatStatus()}
          {renderEmailInputForm()}

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
                <div className="flex items-center mt-2 space-x-2">
                  {!isLiveChat && liveChatStatus !== "ended" && (
                    <button
                      type="button"
                      onClick={handleRequestLiveAgent}
                      className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      Speak to Agent
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={resetChat}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    aria-label="reset chat"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Reset
                  </button>
                </div>
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
