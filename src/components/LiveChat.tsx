"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketContext";
import Image from "next/image";

interface Message {
  id?: string;
  content: string;
  role: "agent" | "customer" | "system";
  timestamp: string;
  isRead?: boolean;
}

interface LiveChatProps {
  primaryColor?: string;
  companyName?: string;
  logoUrl?: string;
  initialMessage?: string;
}

const LiveChat: React.FC<LiveChatProps> = ({
  primaryColor = "#4f46e5",
  companyName = "Customer Support",
  logoUrl = "/logo.png",
  initialMessage = "Hi there! How can we help you today?",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "" });
  const [showForm, setShowForm] = useState(true);
  const [formError, setFormError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected, lastMessage } = useSocket();

  // Initialize chat with system message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          content: initialMessage,
          role: "system",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [initialMessage, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agentTyping]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage && sessionId && lastMessage.chatSessionId === sessionId) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== lastMessage.id),
        lastMessage,
      ]);

      // Reset agent typing when message received
      if (lastMessage.role === "agent") {
        setAgentTyping(false);
      }
    }
  }, [lastMessage, sessionId]);

  // Handle socket events for the specific session
  useEffect(() => {
    if (!socket || !sessionId) return;

    // Subscribe to typing events
    socket.on("agentTyping", (data) => {
      if (data.sessionId === sessionId) {
        setAgentTyping(data.isTyping);
      }
    });

    // Join the session room
    socket.emit("joinSession", sessionId);

    // Cleanup
    return () => {
      socket.off("agentTyping");
      socket.emit("leaveSession", sessionId);
    };
  }, [socket, sessionId]);

  // Start a new chat session
  const startChatSession = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      setFormError("Please provide both name and email.");
      return;
    }

    if (!validateEmail(customerInfo.email)) {
      setFormError("Please provide a valid email address.");
      return;
    }

    setIsConnecting(true);
    setFormError("");

    try {
      const response = await fetch("/api/chat/start-live-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start chat session");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setShowForm(false);

      // Add system message
      setMessages((prev) => [
        ...prev,
        {
          content:
            "You are now connected with our support team. An agent will be with you shortly.",
          role: "system",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error starting chat:", error);
      setFormError("Failed to start chat. Please try again later.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Send a message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !sessionId || !socket) return;

    // Create a new message
    const newMessage: Message = {
      content: inputValue,
      role: "customer",
      timestamp: new Date().toISOString(),
    };

    // Add to local state
    setMessages((prev) => [...prev, newMessage]);

    // Send via socket
    socket.emit("sendMessage", {
      sessionId,
      content: inputValue,
    });

    // Clear input
    setInputValue("");
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !sessionId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { sessionId, isTyping: true });

      // Auto reset after 3 seconds of no typing
      setTimeout(() => {
        setIsTyping(false);
        socket?.emit("typing", { sessionId, isTyping: false });
      }, 3000);
    }
  };

  // Validate email format
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <button
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg focus:outline-none"
        style={{ backgroundColor: primaryColor }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-center"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="w-8 h-8 mr-3 relative overflow-hidden rounded-full bg-white flex items-center justify-center">
              <Image
                src={logoUrl}
                alt={companyName}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-white font-medium">{companyName}</h3>
              <p className="text-white opacity-80 text-xs">
                {isConnected ? "Online" : "Connecting..."}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white opacity-70 hover:opacity-100"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {/* Customer Information Form */}
            {showForm ? (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-3">Get Started</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Please provide your information to start the chat.
                </p>

                {formError && (
                  <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                    {formError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <button
                  onClick={startChatSession}
                  disabled={isConnecting}
                  className="w-full py-2 px-4 rounded text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isConnecting ? "Connecting..." : "Start Chat"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "system" ? (
                      <div className="bg-gray-200 text-gray-600 text-sm py-1 px-3 rounded max-w-xs">
                        {msg.content}
                      </div>
                    ) : (
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.role === "customer"
                            ? "bg-blue-500 text-white"
                            : "bg-white border text-gray-800"
                        }`}
                      >
                        {msg.content}
                        <div
                          className={`text-xs mt-1 ${
                            msg.role === "customer"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Agent typing indicator */}
                {agentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          {!showForm && (
            <form
              onSubmit={sendMessage}
              className="border-t p-3 flex items-center"
            >
              <input
                type="text"
                className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleTyping}
              />
              <button
                type="submit"
                className="p-2 rounded-r text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: primaryColor }}
                disabled={!inputValue.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChat;
