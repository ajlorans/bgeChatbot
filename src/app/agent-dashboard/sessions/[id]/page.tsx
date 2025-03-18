"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import { format } from "date-fns";

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
}

interface ChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  agentId: string | null;
  agentName: string | null;
  customerMetadata?: {
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
    location?: string;
    referrer?: string;
  };
}

export default function ChatSessionPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const { socket, isConnected } = useSocket();
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

    // Handle new messages
    const handleNewMessage = (message: {
      id: string;
      content: string;
      role?: "agent" | "user" | "system";
      sessionId?: string;
      timestamp?: string | number;
      metadata?: {
        chatSessionId?: string;
        [key: string]: unknown;
      };
    }) => {
      console.log("Message received in chat component:", message);

      // Check if this message belongs to the current session
      if (message.sessionId === id || message.metadata?.chatSessionId === id) {
        // Format the message to match the component's expected format
        const formattedMessage: Message = {
          id: message.id,
          content: message.content,
          sender: message.role === "agent" ? "Agent" : "Customer",
          timestamp:
            typeof message.timestamp === "number"
              ? new Date(message.timestamp).toISOString()
              : message.timestamp || new Date().toISOString(),
          isAgent: message.role === "agent",
          isSystem: message.role === "system",
          metadata: message.metadata || {},
        };

        // Add the message to the list, avoiding duplicates
        setMessages((prev) => {
          // Check if message already exists in the list
          const exists = prev.some((m) => m.id === formattedMessage.id);
          if (exists) return prev;
          return [...prev, formattedMessage];
        });
      }
    };

    const handleTypingIndicator = (data: {
      sessionId: string;
      isTyping: boolean;
    }) => {
      if (data.sessionId === id) {
        setCustomerTyping(data.isTyping);

        if (data.isTyping) {
          // Reset the typing timeout if it exists
          if (typingTimeout) {
            clearTimeout(typingTimeout);
          }

          // Set a new timeout to clear the typing indicator
          const timeout = setTimeout(() => {
            setCustomerTyping(false);
          }, 3000);

          setTypingTimeout(timeout);
        }
      }
    };

    const handleSessionEnded = (data: { sessionId: string }) => {
      if (data.sessionId === id) {
        // Refresh session data to update status
        fetch(`/api/agent/sessions/${id}`, { credentials: "include" })
          .then((res) => res.json())
          .then((data) => {
            setSession(data.session);
          })
          .catch((error) => {
            console.error("Error refreshing session:", error);
          });
      }
    };

    // Subscribe to events
    socket.on("messageReceived", handleNewMessage);
    socket.on("customerTyping", handleTypingIndicator);
    socket.on("sessionUpdated", handleSessionEnded);

    // Join the chat room
    socket.emit("joinSession", id);
    console.log("Joined chat room:", id);

    // Clean up on unmount
    return () => {
      socket.off("messageReceived", handleNewMessage);
      socket.off("customerTyping", handleTypingIndicator);
      socket.off("sessionUpdated", handleSessionEnded);

      // Leave the chat room
      socket.emit("leaveSession", id);
      console.log("Left chat room:", id);
    };
  }, [socket, isConnected, id, typingTimeout]);

  // Send a message
  const sendMessage = async () => {
    if (!inputValue.trim() || sending || !session) return;

    try {
      setSending(true);

      // Create a temporary message for immediate display
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: inputValue,
        sender: "Agent",
        timestamp: new Date().toISOString(),
        isAgent: true,
        isSystem: false,
        metadata: { chatSessionId: id },
      };

      // Add the message to local state immediately for better UX
      setMessages((prev) => [...prev, tempMessage]);

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

      // Replace the temporary message with the real one if available
      if (data.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? {
                  ...msg,
                  id: data.message.id,
                  timestamp: data.message.timestamp || msg.timestamp,
                }
              : msg
          )
        );
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

  // Format a timestamp
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), "p");
  };

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
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-medium">
            Chat with {session.customerName || "Anonymous Customer"}
          </h1>
          <p className="text-sm text-gray-500">
            {session.customerEmail || "No email provided"} •
            {session.status === "active" ? (
              <span className="text-green-600 ml-1">Active</span>
            ) : (
              <span className="text-gray-600 ml-1">Closed</span>
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          {session.status === "active" && (
            <button
              onClick={endSession}
              className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded"
            >
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* Customer information sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {/* Messages */}
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isAgent ? "justify-start" : "justify-end"
                }`}
              >
                {message.isSystem ? (
                  <div className="bg-gray-100 text-gray-600 rounded-lg p-3 max-w-md text-sm">
                    <div>{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg p-3 max-w-md ${
                      message.isAgent
                        ? "bg-gray-200 text-gray-800"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <div>{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.isAgent ? "text-gray-500" : "text-blue-100"
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
        <div className="w-64 bg-gray-50 border-l overflow-y-auto p-4">
          <h2 className="font-medium mb-3">Customer Information</h2>

          <div className="mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium">
              Name
            </h3>
            <p className="text-sm">{session.customerName || "Anonymous"}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xs uppercase text-gray-500 font-medium">
              Email
            </h3>
            <p className="text-sm">{session.customerEmail || "Not provided"}</p>
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

      {/* Message input */}
      {session.status === "active" ? (
        <div className="p-4 border-t bg-white">
          <div className="flex">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="flex-1 border rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || sending}
              className={`px-4 py-2 rounded-r-lg ${
                !inputValue.trim() || sending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {sending ? (
                <>
                  <span className="inline-block w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to send, Shift+Enter for a new line
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-center border-t">
          <p className="text-gray-600">This chat session has ended</p>
        </div>
      )}
    </div>
  );
}
