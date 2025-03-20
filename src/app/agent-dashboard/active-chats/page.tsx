"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";

interface RecentMessage {
  id: string;
  content: string;
  timestamp: string;
  role: string;
  isAgent: boolean;
}

interface ChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  agentName: string | null;
  lastMessage: string | null;
  unreadCount?: number;
  recentMessages?: RecentMessage[];
}

interface MessageType {
  sessionId?: string;
  chatSessionId?: string;
  content: string;
  id: string;
  role?: string;
  sender?: string;
  timestamp: string;
}

export default function ActiveChatsPage() {
  const router = useRouter();
  const socketContext = useSocket();
  const { socket, isConnected } = socketContext || {};
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle incoming messages
    const handleNewMessage = (message: MessageType) => {
      console.log("New message received in active chats:", message);

      // Get the session ID from either sessionId or chatSessionId (handle both formats)
      const sessionId = message.sessionId || message.chatSessionId;

      if (!sessionId) {
        console.warn("Received message without session ID:", message);
        return;
      }

      // Update the session with the new message
      setSessions((prevSessions) => {
        // Check if we already have this session
        const sessionExists = prevSessions.some((s) => s.id === sessionId);

        if (sessionExists) {
          // Update existing session with new message info
          return prevSessions.map((session) => {
            if (session.id === sessionId) {
              // Update the session
              const updatedSession = {
                ...session,
                lastMessage: message.content,
                updatedAt: new Date().toISOString(),
                unreadCount: (session.unreadCount || 0) + 1,
              };

              // Add this message to recentMessages if it doesn't exist already
              if (session.recentMessages) {
                const messageExists = session.recentMessages.some(
                  (m) => m.id === message.id
                );
                if (!messageExists) {
                  updatedSession.recentMessages = [
                    {
                      id: message.id,
                      content: message.content,
                      timestamp: message.timestamp || new Date().toISOString(),
                      role: message.role || "user",
                      isAgent: message.role === "agent",
                    },
                    ...session.recentMessages,
                  ].slice(0, 5); // Keep only 5 most recent
                }
              } else {
                updatedSession.recentMessages = [
                  {
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp || new Date().toISOString(),
                    role: message.role || "user",
                    isAgent: message.role === "agent",
                  },
                ];
              }

              return updatedSession;
            }
            return session;
          });
        } else {
          // This is a message for a session we don't have yet
          // Trigger a refresh to get the latest sessions including this one
          console.log("Received message for unknown session, refreshing...");
          fetchSessions();
          return prevSessions;
        }
      });
    };

    // Handle session updates (new sessions, status changes)
    const handleSessionUpdated = (updatedSession: ChatSession) => {
      console.log("Session updated via socket:", updatedSession);

      setSessions((prevSessions) => {
        // Check if we already have this session
        const existingIndex = prevSessions.findIndex(
          (s) => s.id === updatedSession.id
        );

        if (existingIndex >= 0) {
          // Update existing session
          const newSessions = [...prevSessions];
          newSessions[existingIndex] = {
            ...newSessions[existingIndex],
            ...updatedSession,
          };
          return newSessions;
        } else if (
          updatedSession.status === "active" &&
          updatedSession.agentId // Only add if there's an agent assigned
        ) {
          // Add this new session
          return [...prevSessions, updatedSession];
        }

        return prevSessions;
      });
    };

    // Subscribe to events
    socket.on("messageReceived", handleNewMessage);
    socket.on("sessionUpdated", handleSessionUpdated);

    // Clean up on unmount
    return () => {
      socket.off("messageReceived", handleNewMessage);
      socket.off("sessionUpdated", handleSessionUpdated);
    };
  }, [socket, isConnected]);

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Only fetch active sessions assigned to the current agent
      const activeResponse = await fetch("/api/agent/sessions?status=active", {
        credentials: "include",
      });

      if (!activeResponse.ok) {
        throw new Error("Failed to fetch active sessions");
      }

      const activeData = await activeResponse.json();

      // Set only the active sessions, not waiting ones
      setSessions(activeData.sessions);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  // Set up polling for active sessions
  useEffect(() => {
    // Initial fetch
    fetchSessions();

    // Set up polling
    const intervalId = setInterval(fetchSessions, refreshInterval * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Calculate time elapsed since last update
  const getTimeElapsed = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Join chat session
  const joinChat = (sessionId: string) => {
    router.push(`/agent-dashboard/sessions/${sessionId}`);
  };

  // End chat session
  const endChat = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/agent/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "closed" }),
      });

      if (!response.ok) {
        throw new Error("Failed to end chat session");
      }

      // Refresh sessions
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.id !== sessionId)
      );
    } catch (err) {
      console.error("Error ending chat:", err);
      setError("Failed to end chat session");
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Active Chats</h1>
        <p className="text-sm text-gray-500">
          Manage your current active chat sessions
        </p>
      </div>

      {/* Refresh rate selector */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">Refresh rate:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded p-1 text-gray-900 bg-white"
          >
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>

        <span className="text-sm text-gray-900">
          {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-2">Loading sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No active chats
          </h3>
          <p className="mt-1 text-gray-500">
            You don&apos;t have any active chat sessions at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Message
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Updated
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {session.customerName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {session.customerName || "Anonymous"}
                            {session.unreadCount && session.unreadCount > 0 ? (
                              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {session.unreadCount}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-sm text-gray-900">
                            {session.customerEmail || "No email provided"}
                          </div>
                          {/* Mobile-only info */}
                          <div className="sm:hidden mt-1 text-xs text-gray-900">
                            <div>
                              Last updated: {getTimeElapsed(session.updatedAt)}
                            </div>
                            {session.recentMessages &&
                            session.recentMessages.filter(
                              (msg: RecentMessage) =>
                                !msg.isAgent && msg.role !== "agent"
                            ).length > 0 ? (
                              <div className="truncate">
                                Last message:{" "}
                                {session.recentMessages
                                  .filter(
                                    (msg: RecentMessage) =>
                                      !msg.isAgent && msg.role !== "agent"
                                  )
                                  .slice(0, 1)
                                  .map(
                                    (message: RecentMessage) => message.content
                                  )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {session.recentMessages &&
                        session.recentMessages.filter(
                          (msg: RecentMessage) =>
                            !msg.isAgent && msg.role !== "agent"
                        ).length > 0 ? (
                          session.recentMessages
                            .filter(
                              (msg: RecentMessage) =>
                                !msg.isAgent && msg.role !== "agent"
                            )
                            .slice(0, 1)
                            .map((message: RecentMessage) => (
                              <p
                                key={message.id}
                                className="text-sm text-gray-900 truncate"
                              >
                                {message.content}
                              </p>
                            ))
                        ) : (
                          <p className="text-sm text-gray-900 italic">
                            No customer messages yet
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTimeElapsed(session.updatedAt)}
                      </div>
                      <div className="text-xs text-gray-900">
                        {formatTime(session.updatedAt)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <button
                          onClick={() => joinChat(session.id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded w-full sm:w-auto"
                        >
                          Join Chat
                        </button>
                        <button
                          onClick={() => endChat(session.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded w-full sm:w-auto"
                        >
                          End Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
