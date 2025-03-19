"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/socketService";
import type { Socket } from "socket.io-client";

interface WaitingChatSession {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface AlertMessage {
  type: 'success' | 'error' | 'info';
  message: string;
  id: string;
}

export default function WaitingChatsPage() {
  const router = useRouter();
  const socketContext = useSocket();
  const socket = socketContext?.socket;
  const isConnected = socketContext?.isConnected || false;
  const [sessions, setSessions] = useState<WaitingChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(5); // default 5 seconds
  const [claimingSession, setClaimingSession] = useState<string | null>(null);
  const [loadTime, setLoadTime] = useState<number>(Date.now());

  // Helper to add alerts
  const addAlert = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setAlerts(prev => [...prev, { type, message, id }]);
    
    // Auto-dismiss success and info alerts after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
      }, 5000);
    }
  };
  
  // Dismiss an alert
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Fetch waiting sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Add cache buster to prevent browser caching
        const cacheBuster = `${Date.now()}-${Math.random()}`;
        const response = await fetch(
          `/api/agent/sessions?status=waiting&_=${cacheBuster}`,
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch waiting sessions");
        }

        const data = await response.json();
        setSessions(data.sessions);
        
        // Update load time to track when we last got data
        setLoadTime(Date.now());
      } catch (err) {
        console.error("Error fetching waiting sessions:", err);
        addAlert('error', "Failed to load waiting sessions. Please try refreshing the page.");
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

  // Listen for socket events related to waiting sessions
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
        
        // Add notification for new waiting session
        addAlert('info', `New customer waiting: ${session.customerName || 'Anonymous'}`);
        
        return [...prevSessions, session];
      });
    };
    
    // Handle session claimed by another agent
    const handleSessionClaimed = (data: { 
      sessionId: string, 
      agentId: string, 
      agentName: string 
    }) => {
      if (!data || !data.sessionId) return;
      
      // Remove the session from our list if claimed by another agent
      setSessions((prevSessions) => {
        const sessionIndex = prevSessions.findIndex(s => s.id === data.sessionId);
        if (sessionIndex === -1) return prevSessions;
        
        const claimedSession = prevSessions[sessionIndex];
        
        // Only show alert if session was in our list
        addAlert('info', `${data.agentName} claimed the chat with ${claimedSession.customerName || 'Anonymous'}`);
        
        return prevSessions.filter(s => s.id !== data.sessionId);
      });
    };

    // Use type assertion for custom event names not in the type definition
    (socket as any).on("chat:newWaitingSession", handleNewWaitingSession);
    (socket as any).on("chat:claimed", handleSessionClaimed);

    // Clean up on unmount
    return () => {
      (socket as any).off("chat:newWaitingSession", handleNewWaitingSession);
      (socket as any).off("chat:claimed", handleSessionClaimed);
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

      const data = await response.json();

      // If not a successful response, handle the error
      if (!response.ok) {
        if (response.status === 409) {
          addAlert('error', "This chat was already claimed by another agent.");
          // Remove the session from the list as it's already claimed
          setSessions((prevSessions) =>
            prevSessions.filter((session) => session.id !== sessionId)
          );
        } else {
          addAlert('error', data.error || "Failed to claim chat");
        }
        setClaimingSession(null);
        return;
      }

      // If already claimed by this agent, redirect
      if (data.alreadyClaimed) {
        addAlert('info', "You have already claimed this session");
        router.push(`/agent-dashboard/sessions/${sessionId}`);
        return;
      }

      // Success - remove the session from list and redirect
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.id !== sessionId)
      );
      
      addAlert('success', "Chat claimed successfully!");

      // Redirect to the chat session
      router.push(`/agent-dashboard/sessions/${sessionId}`);
    } catch (err) {
      console.error("Error claiming chat:", err);
      addAlert('error', "Failed to claim chat session. Please try again.");
      setClaimingSession(null);
    }
  };

  // Force manual refresh
  const handleManualRefresh = () => {
    addAlert('info', "Refreshing waiting sessions...");
    // Trigger the useEffect by updating the refresh interval
    setRefreshInterval(prev => prev === 5 ? 4.99 : 5);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Waiting Chats</h1>
        <p className="text-sm text-gray-500">
          Customers waiting to be connected to an agent
        </p>
      </div>

      {/* Alert messages */}
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded flex justify-between items-center ${
                alert.type === 'success' ? 'bg-green-100 text-green-700' : 
                alert.type === 'error' ? 'bg-red-100 text-red-700' : 
                'bg-blue-100 text-blue-700'
              }`}
            >
              <span>{alert.message}</span>
              <button 
                onClick={() => dismissAlert(alert.id)} 
                className="ml-2 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Refresh rate selector and statistics */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">Refresh every:</span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-sm border rounded p-1 text-gray-900 bg-white"
          >
            <option value={5}>5 seconds</option>
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
          </select>
          <button
            onClick={handleManualRefresh}
            className="ml-2 p-1 text-sm bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100"
          >
            Refresh Now
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">
            {sessions.length} waiting{" "}
            {sessions.length === 1 ? "customer" : "customers"}
          </span>
          <span className="text-xs text-gray-500">
            Last updated: {new Date(loadTime).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Sessions list */}
      {loading && sessions.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <span className="ml-2">Loading waiting sessions...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-500"
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
                    Waiting Since
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time in Queue
                  </th>
                  <th
                    scope="col"
                    className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Messages
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
                          {/* Mobile-only info */}
                          <div className="sm:hidden mt-1 text-xs text-gray-500">
                            <div>Waiting since: {formatTime(session.createdAt)}</div>
                            <div>Time in queue: {getTimeInQueue(session.createdAt)}</div>
                            <div>Messages: {session.messageCount || 0}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(session.createdAt)}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {getTimeInQueue(session.createdAt)}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {session.messageCount || 0}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => claimSession(session.id)}
                        disabled={claimingSession === session.id}
                        className={`${
                          claimingSession === session.id
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-green-50 text-green-600 hover:text-green-900 hover:bg-green-100"
                        } px-3 py-1 rounded transition-colors duration-150 w-full sm:w-auto`}
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
        </div>
      )}
    </div>
  );
}
