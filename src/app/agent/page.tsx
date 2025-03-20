"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastActive: string;
}

interface Message {
  id: string;
  content: string;
  role: string;
  timestamp: string;
  isRead?: boolean;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  lastMessage?: string;
  agentId?: string;
  agentName?: string;
}

const AgentDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"waiting" | "active" | "closed">("waiting");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agent/sessions");
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError("Error fetching sessions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAgents = async () => {
    try {
      const response = await fetch("/api/agent/active");
      if (!response.ok) throw new Error("Failed to fetch active agents");
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runSessionCleanup = async () => {
    try {
      const response = await fetch("/api/agent/sessions/cleanup", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.inactiveClosed > 0 || data.abandonedMarked > 0) {
          // Only refresh sessions if any were cleaned up
          fetchSessions();
        }
      }
    } catch (_error) {
      // Silent fail - this is a background process
      // Using _error to indicate intentionally unused variable
    }
  };

  const manuallyCloseSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/agent/sessions/cleanup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          reason: "manual_close",
        }),
      });

      if (response.ok) {
        // Refresh sessions after manual close
        fetchSessions();
      }
    } catch (error) {
      console.error("Error closing session:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSessions();
      fetchActiveAgents();

      // Run initial cleanup
      runSessionCleanup();

      // Set up periodic cleanup (every 5 minutes)
      const cleanupInterval = setInterval(runSessionCleanup, 5 * 60 * 1000);

      // Set up polling for sessions (every 30 seconds)
      const sessionInterval = setInterval(() => {
        fetchSessions();
        fetchActiveAgents();
      }, 30 * 1000);

      return () => {
        clearInterval(cleanupInterval);
        clearInterval(sessionInterval);
      };
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, runSessionCleanup, fetchSessions, fetchActiveAgents]);

  // Filter sessions based on current tab
  const filteredSessions = sessions.filter((session) => {
    if (tab === "waiting") return session.status === "waiting";
    if (tab === "active") {
      const currentAgentId = (session as any).user?.agentId || "";
      return session.status === "active" && session.agentId === currentAgentId;
    }
    if (tab === "closed")
      return ["closed", "abandoned"].includes(session.status);
    return true;
  });

  if (status === "loading") {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!session?.user) {
    return <div className="flex justify-center p-8">Not authenticated</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white p-4 rounded-lg shadow border"
            >
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.email}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        agent.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></span>
                    <span className="text-sm">
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {agent.lastActive &&
                        `Last seen ${formatDistanceToNow(
                          new Date(agent.lastActive)
                        )} ago`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setTab("waiting")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === "waiting"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Waiting ({sessions.filter((s) => s.status === "waiting").length})
            </button>
            <button
              onClick={() => setTab("active")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === "active"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Active Chats (
              {
                sessions.filter(
                  (s) =>
                    s.status === "active" &&
                    s.agentId === session?.user?.agentId
                ).length
              }
              )
            </button>
            <button
              onClick={() => setTab("closed")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === "closed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              History (
              {
                sessions.filter((s) =>
                  ["closed", "abandoned"].includes(s.status)
                ).length
              }
              )
            </button>
          </nav>
        </div>

        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {tab === "waiting" && "Waiting Sessions"}
            {tab === "active" && "My Active Sessions"}
            {tab === "closed" && "Chat History"}
          </h2>
          <button
            onClick={() => {
              fetchSessions();
              fetchActiveAgents();
              runSessionCleanup();
            }}
            className="flex items-center text-sm text-green-600 hover:text-green-800"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">{error}</div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-md text-center text-gray-500">
            No {tab} sessions found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-4 rounded-lg shadow border"
              >
                <div className="flex justify-between">
                  <div className="mb-2">
                    <span className="font-medium">
                      {session.customerName || "Anonymous Customer"}
                    </span>
                    {session.customerEmail && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({session.customerEmail})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center">
                    {session.status === "waiting" && (
                      <span className="flex items-center text-yellow-600 text-sm">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        Waiting
                      </span>
                    )}
                    {session.status === "active" && (
                      <span className="flex items-center text-green-600 text-sm">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                        Active
                      </span>
                    )}
                    {session.status === "closed" && (
                      <span className="flex items-center text-gray-600 text-sm">
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Closed
                      </span>
                    )}
                    {session.status === "abandoned" && (
                      <span className="flex items-center text-red-600 text-sm">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        Abandoned
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  Started {formatDistanceToNow(new Date(session.createdAt))} ago
                  {session.lastMessage && (
                    <p className="mt-1 truncate">
                      Last message: {session.lastMessage}
                    </p>
                  )}
                </div>

                <div className="flex justify-between">
                  <div>
                    {session.agentId && session.agentName && (
                      <div className="text-sm text-gray-500">
                        Assigned to: {session.agentName}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {session.status === "active" && (
                      <button
                        onClick={() => manuallyCloseSession(session.id)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100"
                      >
                        Close
                      </button>
                    )}

                    {session.status === "waiting" && (
                      <Link
                        href={`/agent/sessions/${session.id}`}
                        className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded hover:bg-green-100"
                      >
                        Claim
                      </Link>
                    )}

                    <Link
                      href={`/agent/sessions/${session.id}`}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
