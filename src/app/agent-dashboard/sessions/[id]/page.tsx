"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { format } from "date-fns";

// Use a local message interface similar to what we had before
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isAgent: boolean;
  isSystem: boolean;
  metadata?: {
    chatSessionId?: string;
    [key: string]: unknown;
  };
  role: string;
}

interface ChatSession {
  id: string;
  status: "waiting" | "active" | "ended" | "closed";
  customerName: string | null;
  customerEmail: string | null;
  customerMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  agentId: string | null;
  agentName?: string;
}

interface MessageData {
  sessionId?: string;
  chatSessionId?: string;
  id: string;
  content: string;
  sender: string;
  role: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export default function ChatSessionPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const socketContext = useSocket();
  const { socket, isConnected } = socketContext || {};
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const messageEndRef = useRef<HTMLDivElement>(null);
  const id = params.id;

  // Style for debug info - temporary
  const textXxs = {
    fontSize: "0.6rem",
    lineHeight: "0.75rem",
  };

  // Fetch chat session details and messages
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);

        // Fetch session details
        const sessionResponse = await fetch(`/api/agent/sessions/${id}`, {
          credentials: "include",
        });
        if (!sessionResponse.ok) {
          throw new Error("Failed to fetch session details");
        }
        const sessionData = await sessionResponse.json();
        setSession(sessionData.session);

        // Fetch messages
        const messagesResponse = await fetch(
          `/api/agent/sessions/${id}/messages`,
          { credentials: "include" }
        );
        if (!messagesResponse.ok) {
          throw new Error("Failed to fetch messages");
        }
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching session data:", err);
        setError("Failed to load session data");
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected || !id) return;

    console.log(`Subscribing to socket events for chat session ${id}`);

    // Join the session room
    socket.emit("joinSession", id);
    console.log(`Joined room for session: ${id}`);

    // Ensure agent can see all messages by getting the full history first
    const refreshMessages = async () => {
      try {
        const messagesResponse = await fetch(
          `/api/agent/sessions/${id}/messages`,
          { credentials: "include" }
        );
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();

          // Check if we have new messages
          if (messagesData.messages && messagesData.messages.length > 0) {
            console.log(
              `Loaded ${messagesData.messages.length} messages from API`
            );

            // Merge the API messages with existing messages, preserving local classifications
            setMessages((prevMessages) => {
              // Create a map of existing messages by ID
              const existingMessages = new Map();
              prevMessages.forEach((msg) => {
                existingMessages.set(msg.id, msg);
              });

              // Merge new messages, preserving agent/customer flags from existing messages
              const mergedMessages = messagesData.messages.map(
                (apiMsg: any) => {
                  // If message exists locally and is marked as from agent, preserve that
                  if (
                    existingMessages.has(apiMsg.id) &&
                    existingMessages.get(apiMsg.id).isAgent
                  ) {
                    console.log(
                      `Preserving agent status for message ${apiMsg.id}`
                    );
                    return {
                      ...apiMsg,
                      isAgent: true,
                      sender: "Agent",
                    };
                  }

                  // Ensure proper formatting for API messages
                  return {
                    ...apiMsg,
                    isAgent:
                      apiMsg.role === "agent" || apiMsg.sender === "Agent",
                    isSystem:
                      apiMsg.role === "system" || apiMsg.sender === "System",
                  };
                }
              );

              return mergedMessages;
            });
          }
        }
      } catch (err) {
        console.error("Error refreshing messages:", err);
      }
    };

    // Initial refresh
    refreshMessages();

    // Set up a refresh interval
    const refreshInterval = setInterval(() => {
      console.log("Refreshing chat session data...");
      refreshMessages();

      // Also refresh session status to detect closed sessions
      fetch(`/api/agent/sessions/${id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          // Check if session status has changed
          if (data.session && data.session.status !== session?.status) {
            console.log(
              `Session status changed from ${session?.status} to ${data.session.status}`
            );
            setSession(data.session);

            // If status is now closed and wasn't before, add a system message
            if (
              data.session.status === "closed" &&
              session?.status !== "closed"
            ) {
              // Add a system message locally if not already present
              setMessages((prevMessages) => {
                // Check if we already have a similar message
                const hasEndMessage = prevMessages.some(
                  (msg) =>
                    msg.isSystem &&
                    (msg.content.includes("customer has ended") ||
                      msg.content.includes("ended by customer"))
                );

                if (hasEndMessage) return prevMessages;

                // Add new system message
                return [
                  ...prevMessages,
                  {
                    id: `system-${Date.now()}`,
                    content: "The customer has ended this chat session.",
                    sender: "System",
                    timestamp: new Date().toISOString(),
                    isAgent: false,
                    isSystem: true,
                    metadata: { chatSessionId: id, endedBy: "customer" },
                    role: "system",
                  },
                ];
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error refreshing session:", error);
        });
    }, 5000); // Poll every 5 seconds

    // Handle incoming messages from the socket
    const handleNewMessage = (message: MessageData) => {
      console.log("⚡ Socket received message:", message);
      console.log("Message role:", message.role);
      console.log("Message isAgent:", message.isAgent);
      console.log("Message sender:", message.sender);

      // Check if message is valid
      if (!message || !message.content) {
        console.log("Ignoring invalid message:", message);
        return;
      }

      // Determine if this message belongs to this session via multiple possible fields
      const messageSessionId =
        message.sessionId ||
        message.chatSessionId ||
        (message.metadata && message.metadata.chatSessionId);

      console.log(
        `Message session ID: ${messageSessionId}, Current session: ${id}`
      );

      // Only handle messages for this session
      if (messageSessionId !== id) {
        console.log("Ignoring message for different session");
        return;
      }

      // Log the message to help with debugging
      console.log(`✅ Processing message for session ${id}:`, message);

      // Ensure the message has a unique ID
      const messageId =
        message.id ||
        `socket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Determine sender based on multiple possible properties
      let sender = "Customer";
      let isSystemMessage = false;
      let isAgentMessage = false;

      if (
        message.isAgent ||
        message.role === "agent" ||
        message.sender === "Agent"
      ) {
        sender = "Agent";
        isAgentMessage = true;
      } else if (message.isSystem || message.role === "system") {
        sender = "System";
        isSystemMessage = true;
      } else if (message.sender) {
        // Handle customer messages - preserve the original sender name if it exists
        sender = message.sender;
        // Only override if it's explicitly marked as an agent message
        if (message.sender.toLowerCase() === "agent") {
          sender = "Agent";
          isAgentMessage = true;
        }
      }

      // Parse timestamp with fallback
      let timestamp = new Date().toISOString();
      try {
        if (message.timestamp) {
          if (
            typeof message.timestamp === "object" &&
            message.timestamp instanceof Date
          ) {
            timestamp = message.timestamp.toISOString();
          } else if (typeof message.timestamp === "string") {
            timestamp = message.timestamp;
          } else if (typeof message.timestamp === "number") {
            timestamp = new Date(message.timestamp).toISOString();
          }
        }
      } catch (e) {
        console.error("Error parsing message timestamp:", e);
      }

      const formattedMessage: Message = {
        id: messageId,
        content: message.content,
        sender: sender,
        timestamp: timestamp,
        isAgent: isAgentMessage,
        isSystem: isSystemMessage,
        metadata: message.metadata || {},
        role: isAgentMessage
          ? "agent"
          : isSystemMessage
          ? "system"
          : "customer",
      };

      console.log("📝 Adding formatted message:", formattedMessage);
      console.log(`Message is from agent? ${formattedMessage.isAgent}`);
      console.log(`Message sender: ${formattedMessage.sender}`);
      console.log(`Message role: ${formattedMessage.role}`);

      // Add the message to the list, avoiding duplicates
      setMessages((prev) => {
        // Check if message already exists by ID
        const duplicateIdIndex = prev.findIndex((m) => m.id === messageId);
        if (duplicateIdIndex !== -1) {
          console.log("🔄 Skipping duplicate message (same ID)");

          // If it's a temp message that's now confirmed, make sure isAgent is correct
          if (
            prev[duplicateIdIndex].id.startsWith("temp-") &&
            sender === "Agent"
          ) {
            console.log(
              "🔄 Replacing temp message with confirmed agent message"
            );
            const updatedMessages = [...prev];
            updatedMessages[duplicateIdIndex] = formattedMessage;
            return updatedMessages;
          }

          return prev;
        }

        // Also check for duplicate content that might have different IDs
        const duplicateContentIndex = prev.findIndex(
          (m) =>
            m.content === formattedMessage.content &&
            m.sender === formattedMessage.sender &&
            Math.abs(
              new Date(m.timestamp).getTime() -
                new Date(formattedMessage.timestamp).getTime()
            ) < 5000
        );

        if (duplicateContentIndex !== -1) {
          console.log("🔄 Skipping duplicate message (similar content)");
          return prev;
        }

        console.log("✅ Adding new message to chat");
        return [...prev, formattedMessage];
      });
    };

    // Handle customer typing indicators
    const handleTypingIndicator = (data: {
      sessionId: string;
      isTyping: boolean;
    }) => {
      if (data.sessionId === id) {
        console.log(`Customer typing: ${data.isTyping}`);
        setCustomerTyping(data.isTyping);

        // Clear previous timeout if it exists
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Auto-clear typing indicator after 5 seconds
        if (data.isTyping) {
          const timeout = setTimeout(() => {
            setCustomerTyping(false);
          }, 5000);
          setTypingTimeout(timeout);
        }
      }
    };

    // Subscribe to socket events
    socket.on("messageReceived", handleNewMessage);
    socket.on("customerTyping", handleTypingIndicator);

    console.log("Socket event handlers registered");

    // Clean up on unmount
    return () => {
      socket.off("messageReceived", handleNewMessage);
      socket.off("customerTyping", handleTypingIndicator);

      // Leave the chat room
      socket.emit("leaveSession", id);
      console.log(`Left chat room: ${id}`);

      // Clear the refresh interval
      clearInterval(refreshInterval);
    };
  }, [socket, isConnected, id, typingTimeout]);

  // Send a message
  const sendMessage = async () => {
    if (!inputValue.trim() || sending || !session) return;

    try {
      setSending(true);

      // Generate a truly unique ID for temp messages
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      // Create a temporary message for immediate display
      const tempMessage: Message = {
        id: tempId,
        content: inputValue,
        sender: "Agent",
        timestamp: new Date().toISOString(),
        isAgent: true,
        isSystem: false,
        metadata: { chatSessionId: id },
        role: "agent",
      };

      // Add the message to local state immediately for better UX
      setMessages((prev) => {
        // Make sure we don't already have this exact message in the list
        const isDuplicate = prev.some(
          (msg) =>
            msg.content === tempMessage.content &&
            msg.isAgent === tempMessage.isAgent &&
            Math.abs(
              new Date(msg.timestamp).getTime() -
                new Date(tempMessage.timestamp).getTime()
            ) < 5000
        );

        if (isDuplicate) return prev;
        return [...prev, tempMessage];
      });

      // Send to the server
      const response = await fetch(`/api/agent/sessions/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          content: inputValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Get the real message from the response
      const data = await response.json();

      // Remove the temporary message and add the real one
      if (data.message) {
        setMessages((prev) => {
          // Filter out the temporary message
          const filtered = prev.filter((msg) => msg.id !== tempId);

          // Check if the real message already exists in the list
          const realMessageExists = filtered.some(
            (msg) => msg.id === data.message.id
          );

          if (realMessageExists) return filtered;

          // Add the real message with proper formatting
          return [
            ...filtered,
            {
              id: data.message.id,
              content: data.message.content,
              sender: "Agent",
              timestamp: data.message.timestamp || new Date().toISOString(),
              isAgent: true,
              isSystem: false,
              metadata: data.message.metadata || { chatSessionId: id },
              role: "agent",
            },
          ];
        });
      }

      setInputValue("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");

      // Remove the temporary message on error
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));
    } finally {
      setSending(false);
    }
  };

  // End the chat session
  const endSession = async () => {
    if (!session) return;

    try {
      setSending(true);
      const response = await fetch(`/api/agent/sessions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "ended",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end session");
      }

      const data = await response.json();
      setSession(data.session);

      // Emit chatEnded event
      if (socketContext) {
        socketContext.emitEvent("endChat", id);
      }
    } catch (err) {
      console.error("Error ending session:", err);
      setError("Failed to end session");
    } finally {
      setSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format message timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if the session has been ended by customer
  const isSessionEndedByCustomer = messages.some(
    (msg) =>
      msg.isSystem &&
      (msg.content.includes("customer has ended") ||
        msg.content.includes("Live chat ended by customer") ||
        (msg.metadata && msg.metadata.endedBy === "customer"))
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading chat session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-100 p-4 rounded-lg text-red-800">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => router.push("/agent-dashboard")}
            className="mt-4 bg-white px-4 py-2 rounded text-red-800 hover:bg-red-50"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">
            Session Not Found
          </h1>
          <p className="text-gray-700 mb-4">
            The chat session you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access.
          </p>
          <button
            onClick={() => router.push("/agent-dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Chat header */}
      <div className="p-4 bg-white border-b shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Chat with {session?.customerName || "Customer"}
          </h1>
          {session?.customerEmail && (
            <p className="text-sm text-gray-600">{session.customerEmail}</p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isSessionEndedByCustomer && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-md">
              Chat ended by customer
            </span>
          )}
          {!isSessionEndedByCustomer && session?.status === "active" && (
            <button
              onClick={endSession}
              disabled={session?.status !== "active"}
              className={`px-3 py-1.5 rounded text-white ${
                session?.status !== "active"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* Show message when chat has been ended by customer */}
      {isSessionEndedByCustomer && (
        <div className="bg-red-50 p-3 border-b border-red-200">
          <p className="text-center text-red-700 text-sm">
            This chat has been ended by the customer. You can no longer send
            messages.
          </p>
        </div>
      )}

      {/* Customer information sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {/* Messages */}
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                className={`flex ${
                  message.isAgent || message.role === "agent"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.isSystem || message.role === "system" ? (
                  <div className="bg-gray-100 text-gray-600 rounded-lg p-3 max-w-md text-sm">
                    <div>{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg p-3 max-w-md ${
                      message.isAgent || message.role === "agent"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {message.isAgent || message.role === "agent" ? (
                        <>
                          <span>{session?.agentName || "Agent"}</span>
                          <br />
                          You (Agent)
                        </>
                      ) : (
                        message.sender || "Customer"
                      )}
                      {/* Debug info - only temporary */}
                      <span className="text-xxs opacity-70" style={textXxs}>
                        {" "}
                        [id: {message.id.substring(0, 4)}... | role:{" "}
                        {message.role || "unset"} | agent:{" "}
                        {message.isAgent ? "true" : "false"}]
                      </span>
                    </div>
                    <div>{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.isAgent || message.role === "agent"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Customer typing indicator */}
            {customerTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 rounded-lg p-2 max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>
        </div>

        {/* Customer information panel */}
        <div className="w-64 bg-gray-50 border-l overflow-y-auto p-4 ">
          <h2 className="font-medium mb-3 text-gray-900">
            Customer Information
          </h2>

          <div className="mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium">
              Name
            </h3>
            <p className="text-sm text-gray-900">
              {session.customerName || "Anonymous"}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium">
              Email
            </h3>
            <p className="text-sm text-gray-900">
              {session.customerEmail || "Not provided"}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium">
              Session Started
            </h3>
            <div className="text-sm text-gray-500 mb-4">
              Customer requested help on{" "}
              {session?.createdAt
                ? format(new Date(session.createdAt), "PPP 'at' p")
                : ""}
            </div>
          </div>

          {session.customerMetadata && (
            <>
              <h2 className="font-medium mb-2 mt-6 border-t pt-2">
                Technical Details
              </h2>

              {session.customerMetadata.browser && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    Browser
                  </h3>
                  <p className="text-sm">{session.customerMetadata.browser}</p>
                </div>
              )}

              {session.customerMetadata.os && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    OS
                  </h3>
                  <p className="text-sm">{session.customerMetadata.os}</p>
                </div>
              )}

              {session.customerMetadata.device && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    Device
                  </h3>
                  <p className="text-sm">{session.customerMetadata.device}</p>
                </div>
              )}

              {session.customerMetadata.ip && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    IP Address
                  </h3>
                  <p className="text-sm">{session.customerMetadata.ip}</p>
                </div>
              )}

              {session.customerMetadata.location && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    Location
                  </h3>
                  <p className="text-sm">{session.customerMetadata.location}</p>
                </div>
              )}

              {session.customerMetadata.referrer && (
                <div className="mb-2">
                  <h3 className="text-xs uppercase text-gray-500 font-medium">
                    Referred From
                  </h3>
                  <p className="text-sm">{session.customerMetadata.referrer}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat input */}
      <div className="p-3 bg-white border-t text-gray-900">
        <form onSubmit={(e) => e.preventDefault()} className="flex">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={
              sending ||
              session?.status === "ended" ||
              session?.status === "closed" ||
              isSessionEndedByCustomer
            }
            placeholder={
              isSessionEndedByCustomer
                ? "Chat has been ended by the customer"
                : session?.status === "ended" || session?.status === "closed"
                ? "This chat has ended"
                : "Type your message..."
            }
            className={`flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isSessionEndedByCustomer ||
              session?.status === "ended" ||
              session?.status === "closed"
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-white"
            }`}
            rows={2}
          ></textarea>
          <button
            onClick={sendMessage}
            disabled={
              !inputValue.trim() ||
              sending ||
              session?.status === "ended" ||
              session?.status === "closed" ||
              isSessionEndedByCustomer
            }
            className={`px-4 rounded-r-md ${
              !inputValue.trim() ||
              sending ||
              isSessionEndedByCustomer ||
              session?.status === "ended" ||
              session?.status === "closed"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
