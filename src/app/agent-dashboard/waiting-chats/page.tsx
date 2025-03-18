"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";

interface WaitingChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export default function WaitingChatsPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [sessions, setSessions] = useState<WaitingChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(15); // seconds
  const [claimingSession, setClaimingSession] = useState<string | null>(null);

  // Fetch waiting sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agent/sessions?status=waiting");

        if (!response.ok) {
          throw new Error("Failed to fetch waiting sessions");
        }

        const data = await response.json();
        setSessions(data.sessions);
      } catch (err) {
        console.error("Error fetching waiting sessions:", err);
        setError("Failed to load waiting sessions");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchSessions();

    // Set up polling
    const intervalId = setInterval(fetchSessions, refreshInterval * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Listen for new waiting sessions via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new waiting session
    const handleNewWaitingSession = (session: WaitingChatSession) => {
      if (!session || !session.id) return;

      // Check if we already have this session
      setSessions((prevSessions) => {
        if (prevSessions.some((s) => s.id === session.id)) {
          return prevSessions;
        }
        return [...prevSessions, session];
      });
    };

    // Subscribe to waiting session events
    socket.on("chat:newWaitingSession", handleNewWaitingSession);

    // Clean up on unmount
    return () => {
      socket.off("chat:newWaitingSession", handleNewWaitingSession);
    };
  }, [socket, isConnected]);

  // Calculate time in queue
  const getTimeInQueue = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "less than a minute";
    if (diffMins === 1) return "1 minute";
    if (diffMins < 60) return `${diffMins} minutes`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour";
    return `${diffHours} hours ${diffMins % 60} minutes`;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Claim a waiting chat session
  const claimSession = async (sessionId: string) => {
    try {
      setClaimingSession(sessionId);
      const response = await fetch(`/api/agent/sessions/${sessionId}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to claim chat session");
      }

      // Remove the session from the list
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.id !== sessionId)
      );

      // Redirect to the chat session
      router.push(`/agent-dashboard/sessions/${sessionId}`);
    } catch (err) {
      console.error("Error claiming chat:", err);
      setError(
        "Failed to claim chat session. It may have been claimed by another agent."
      );
      setClaimingSession(null);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Waiting Chats</h1>
        <p className="text-sm text-gray-500">
          Customers waiting to be connected to an agent
        </p>
      </div>

      {/* Refresh rate selector */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Refresh rate:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded p-1"
          >
            <option value={5}>5 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
          </select>
        </div>

        <span className="text-sm text-gray-500">
          {sessions.length} waiting{" "}
          {sessions.length === 1 ? "customer" : "customers"}
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
          <span className="ml-2">Loading waiting sessions...</span>
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
            No waiting chats
          </h3>
          <p className="mt-1 text-gray-500">
            There are no customers waiting for assistance at the moment.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Waiting Since
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Time in Queue
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Messages
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {session.customerName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {session.customerName || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.customerEmail || "No email provided"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatTime(session.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {getTimeInQueue(session.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {session.messageCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => claimSession(session.id)}
                      disabled={claimingSession === session.id}
                      className={`${
                        claimingSession === session.id
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-green-50 text-green-600 hover:text-green-900"
                      } px-3 py-1 rounded transition-colors duration-150`}
                    >
                      {claimingSession === session.id ? (
                        <>
                          <span className="inline-block w-4 h-4 mr-1 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                          Claiming...
                        </>
                      ) : (
                        "Claim Chat"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
